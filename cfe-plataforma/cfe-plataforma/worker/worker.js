// API del Consejo Familiar Electoral — Cloudflare Worker + D1
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};
const J = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
const err = (m, s = 400) => Object.assign(new Error(m), { status: s });
const enc = new TextEncoder();
const b64 = (b) => btoa(String.fromCharCode(...new Uint8Array(b)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const rnd = () => b64(crypto.getRandomValues(new Uint8Array(16)));

async function hash(pw, salt) {
  const k = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  return b64(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: unb64(salt), iterations: 100000 }, k, 256));
}
async function sign(data, secret) {
  const k = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64(await crypto.subtle.sign("HMAC", k, enc.encode(data)));
}
async function mkToken(u, env) {
  const p = btoa(JSON.stringify({ id: u.id, role: u.role, exp: Date.now() + 30 * 864e5 }));
  return p + "." + (await sign(p, env.SECRET));
}
async function auth(req, env) {
  const [p, s] = (req.headers.get("Authorization") || "").slice(7).split(".");
  if (!p || !s || s !== (await sign(p, env.SECRET))) return null;
  const o = JSON.parse(atob(p));
  return o.exp > Date.now() ? o : null;
}
async function newUser(db, { name, username, password, role }) {
  const salt = rnd();
  await db.prepare("INSERT INTO users(name,username,role,salt,pass) VALUES(?,?,?,?,?)")
    .bind(name, username.trim().toLowerCase(), role, salt, await hash(password, salt)).run();
}
const pub = (u) => ({ id: u.id, name: u.name, username: u.username, role: u.role });
const log = (db, text, detail = "") => db.prepare("INSERT INTO activity(text,detail) VALUES(?,?)").bind(text, detail).run();

let ready = false;
async function init(env) {
  if (ready) return;
  const db = env.DB;
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT, username TEXT UNIQUE, role TEXT, salt TEXT, pass TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE TABLE IF NOT EXISTS parties(id INTEGER PRIMARY KEY, name TEXT, color TEXT, description TEXT)"),
    db.prepare("CREATE TABLE IF NOT EXISTS elections(id INTEGER PRIMARY KEY, title TEXT, description TEXT, date TEXT, status TEXT DEFAULT 'draft', created TEXT DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE TABLE IF NOT EXISTS candidates(id INTEGER PRIMARY KEY, election_id INTEGER, party_id INTEGER, name TEXT, bio TEXT)"),
    db.prepare("CREATE TABLE IF NOT EXISTS votes(election_id INTEGER, user_id INTEGER, candidate_id INTEGER, PRIMARY KEY(election_id,user_id))"),
    db.prepare("CREATE TABLE IF NOT EXISTS polls(id INTEGER PRIMARY KEY, question TEXT, status TEXT DEFAULT 'open')"),
    db.prepare("CREATE TABLE IF NOT EXISTS poll_options(id INTEGER PRIMARY KEY, poll_id INTEGER, text TEXT)"),
    db.prepare("CREATE TABLE IF NOT EXISTS poll_votes(poll_id INTEGER, user_id INTEGER, option_id INTEGER, PRIMARY KEY(poll_id,user_id))"),
    db.prepare("CREATE TABLE IF NOT EXISTS activity(id INTEGER PRIMARY KEY, text TEXT, detail TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP)"),
  ]);
  // Usuario administrador de fábrica
  if (!(await db.prepare("SELECT id FROM users WHERE username='admin'").first()))
    await newUser(db, { name: "Administrador", username: "admin", password: env.ADMIN_PASSWORD || "A1234", role: "admin" });
  ready = true;
}

// ---- Entrar con Google / GitHub (opcional, requiere configurar claves) ----
const OA = {
  github: { auth: "https://github.com/login/oauth/authorize", scope: "read:user user:email" },
  google: { auth: "https://accounts.google.com/o/oauth2/v2/auth", scope: "openid email profile" },
};
async function oauth(req, env, url, prov, cb) {
  const cfg = OA[prov], id = env[prov.toUpperCase() + "_ID"], secret = env[prov.toUpperCase() + "_SECRET"];
  if (!cfg) throw err("Proveedor no válido", 404);
  if (!id || !secret) return new Response(`Falta configurar ${prov.toUpperCase()}_ID y ${prov.toUpperCase()}_SECRET en Cloudflare.`, { status: 501 });
  const redirect = `${url.origin}/api/oauth/${prov}/callback`;
  if (!cb) {
    const ts = String(Date.now());
    const q = new URLSearchParams({ client_id: id, redirect_uri: redirect, scope: cfg.scope, response_type: "code", state: ts + "." + (await sign(ts, env.SECRET)) });
    return Response.redirect(cfg.auth + "?" + q, 302);
  }
  const [ts, sg] = (url.searchParams.get("state") || "").split(".");
  if (!ts || sg !== (await sign(ts, env.SECRET)) || Date.now() - ts > 6e5) throw err("Sesión de acceso inválida");
  let name, email;
  if (prov === "github") {
    const t = await (await fetch("https://github.com/login/oauth/access_token", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ client_id: id, client_secret: secret, code: url.searchParams.get("code") }) })).json();
    const h = { Authorization: "Bearer " + t.access_token, "User-Agent": "cfe", Accept: "application/json" };
    const u = await (await fetch("https://api.github.com/user", { headers: h })).json();
    const es = await (await fetch("https://api.github.com/user/emails", { headers: h })).json();
    email = (Array.isArray(es) ? es.find((e) => e.primary && e.verified) : null)?.email; name = u.name || u.login;
  } else {
    const t = await (await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: new URLSearchParams({ code: url.searchParams.get("code"), client_id: id, client_secret: secret, redirect_uri: redirect, grant_type: "authorization_code" }) })).json();
    const u = await (await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: "Bearer " + t.access_token } })).json();
    email = u.email_verified ? u.email : null; name = u.name;
  }
  if (!email) throw err("No se pudo verificar tu correo en " + prov);
  const db = env.DB; email = email.toLowerCase();
  let u = await db.prepare("SELECT * FROM users WHERE username=?").bind(email).first();
  if (!u) {
    await newUser(db, { name: name || email, username: email, password: rnd() + rnd(), role: "member" });
    await log(db, "Se registró un miembro", name || email);
    u = await db.prepare("SELECT * FROM users WHERE username=?").bind(email).first();
  }
  return Response.redirect(env.FRONTEND_URL + "#token=" + encodeURIComponent(await mkToken(u, env)), 302);
}

async function route(req, env) {
  const url = new URL(req.url), p = url.pathname, m = req.method, db = env.DB;
  const body = m === "GET" || m === "DELETE" ? {} : await req.json().catch(() => ({}));
  const one = (q, ...a) => db.prepare(q).bind(...a).first();
  const all = async (q, ...a) => (await db.prepare(q).bind(...a).all()).results;
  const num = async (q, ...a) => (await one(q, ...a)).n;

  let o = p.match(/^\/api\/oauth\/(\w+)(\/callback)?$/);
  if (o) return oauth(req, env, url, o[1], !!o[2]);

  if (p === "/api/login" && m === "POST") {
    const u = await one("SELECT * FROM users WHERE username=?", String(body.username || "").trim().toLowerCase());
    if (!u || (await hash(String(body.password || ""), u.salt)) !== u.pass) throw err("Usuario o contraseña incorrectos", 401);
    return J({ token: await mkToken(u, env), user: pub(u) });
  }
  if (p === "/api/register" && m === "POST") {
    if (!body.name || !body.username || String(body.password || "").length < 6) throw err("Completa nombre, correo y una contraseña de 6 o más caracteres");
    try { await newUser(db, { ...body, role: "member" }); } catch { throw err("Ese correo ya está registrado"); }
    await log(db, "Se registró un miembro", body.name);
    const u = await one("SELECT * FROM users WHERE username=?", body.username.trim().toLowerCase());
    return J({ token: await mkToken(u, env), user: pub(u) });
  }

  const s = await auth(req, env);
  if (!s) throw err("Sesión no válida", 401);
  const admin = s.role === "admin";
  const need = () => { if (!admin) throw err("Solo el administrador puede hacer esto", 403); };
  const mt = p.match(/^\/api\/(\w+)(?:\/(\d+))?(?:\/(\w+))?$/);
  if (!mt) throw err("No encontrado", 404);
  const [, res, id, sub] = mt;
  const ok = () => J({ ok: true });

  if (res === "me") return J(pub(await one("SELECT * FROM users WHERE id=?", s.id)));
  if (res === "profile" && m === "POST") {
    if (!body.name) throw err("Escribe tu nombre");
    await db.prepare("UPDATE users SET name=? WHERE id=?").bind(body.name, s.id).run(); return ok();
  }
  if (res === "password" && m === "POST") {
    const u = await one("SELECT * FROM users WHERE id=?", s.id);
    if ((await hash(String(body.old || ""), u.salt)) !== u.pass) throw err("La contraseña actual no es correcta");
    if (String(body.new || "").length < 4) throw err("La nueva contraseña es muy corta");
    const salt = rnd();
    await db.prepare("UPDATE users SET salt=?,pass=? WHERE id=?").bind(salt, await hash(body.new, salt), s.id).run(); return ok();
  }
  if (res === "activity") return J(await all("SELECT * FROM activity ORDER BY id DESC LIMIT 100"));

  if (res === "dashboard") {
    const members = await num("SELECT COUNT(*) n FROM users"), voters = await num("SELECT COUNT(DISTINCT user_id) n FROM votes");
    return J({
      members, open: await num("SELECT COUNT(*) n FROM elections WHERE status='open'"),
      closed: await num("SELECT COUNT(*) n FROM elections WHERE status='closed'"),
      participation: members ? Math.round((voters / members) * 100) : 0,
      pending: (await num("SELECT COUNT(*) n FROM elections e WHERE status='open' AND NOT EXISTS(SELECT 1 FROM votes v WHERE v.election_id=e.id AND v.user_id=?)", s.id))
             + (await num("SELECT COUNT(*) n FROM polls q WHERE status='open' AND NOT EXISTS(SELECT 1 FROM poll_votes v WHERE v.poll_id=q.id AND v.user_id=?)", s.id)),
      next: await one("SELECT * FROM elections WHERE status!='closed' ORDER BY (status='open') DESC, id DESC LIMIT 1"),
      recent: await all("SELECT * FROM activity ORDER BY id DESC LIMIT 4"),
    });
  }

  if (res === "members") {
    if (m === "GET") return J(await all(admin ? "SELECT id,name,username,role,created FROM users ORDER BY id" : "SELECT id,name,role,created FROM users ORDER BY id"));
    need();
    if (m === "POST" && !id) {
      if (!body.name || !body.username || String(body.password || "").length < 4) throw err("Datos incompletos");
      try { await newUser(db, { ...body, role: "member" }); } catch { throw err("Ese usuario ya existe"); }
      await log(db, "Se registró un miembro", body.name); return ok();
    }
    if (m === "POST" && sub === "password") {
      if (String(body.password || "").length < 4) throw err("Contraseña muy corta");
      const salt = rnd();
      await db.prepare("UPDATE users SET salt=?,pass=? WHERE id=? AND role!='admin'").bind(salt, await hash(body.password, salt), id).run(); return ok();
    }
    if (m === "DELETE") { await db.prepare("DELETE FROM users WHERE id=? AND role!='admin'").bind(id).run(); return ok(); }
  }

  if (res === "parties") {
    if (m === "GET") return J(await all("SELECT * FROM parties ORDER BY name"));
    need();
    if (m === "POST") {
      if (!body.name) throw err("Falta el nombre del partido");
      await db.prepare("INSERT INTO parties(name,color,description) VALUES(?,?,?)").bind(body.name, body.color || "#f59e0b", body.description || "").run();
      await log(db, "Nuevo partido registrado", body.name); return ok();
    }
    if (m === "DELETE") { await db.prepare("DELETE FROM parties WHERE id=?").bind(id).run(); return ok(); }
  }

  if (res === "candidates") {
    if (m === "GET") return J(await all("SELECT c.id,c.name,c.bio,c.election_id,e.title election,p.name party,p.color FROM candidates c JOIN elections e ON e.id=c.election_id LEFT JOIN parties p ON p.id=c.party_id ORDER BY c.election_id DESC,c.id"));
    need();
    if (m === "POST") {
      if (!body.name || !body.election_id) throw err("Elige la elección y escribe el nombre del candidato");
      await db.prepare("INSERT INTO candidates(election_id,party_id,name,bio) VALUES(?,?,?,?)").bind(body.election_id, body.party_id || null, body.name, body.bio || "").run();
      await log(db, "Nuevo candidato", body.name); return ok();
    }
    if (m === "DELETE") { await db.batch([db.prepare("DELETE FROM votes WHERE candidate_id=?").bind(id), db.prepare("DELETE FROM candidates WHERE id=?").bind(id)]); return ok(); }
  }

  if (res === "elections") {
    if (m === "GET") {
      const els = await all("SELECT * FROM elections ORDER BY id DESC");
      const cands = await all("SELECT c.id,c.election_id,c.name,c.bio,p.name party,p.color,(SELECT COUNT(*) FROM votes v WHERE v.candidate_id=c.id) votes FROM candidates c LEFT JOIN parties p ON p.id=c.party_id");
      const mine = await all("SELECT election_id FROM votes WHERE user_id=?", s.id);
      return J(els.map((e) => {
        const show = admin || e.status === "closed";
        return { ...e, voted: mine.some((v) => v.election_id === e.id),
          candidates: cands.filter((c) => c.election_id === e.id).map((c) => ({ ...c, votes: show ? c.votes : null })) };
      }));
    }
    if (m === "POST" && !id) {
      need();
      if (!body.title) throw err("Falta el título");
      await db.prepare("INSERT INTO elections(title,description,date) VALUES(?,?,?)").bind(body.title, body.description || "", body.date || "").run();
      await log(db, "Nueva elección creada", body.title); return ok();
    }
    if (m === "POST" && sub === "status") {
      need();
      if (!["draft", "open", "closed"].includes(body.status)) throw err("Estado inválido");
      await db.prepare("UPDATE elections SET status=? WHERE id=?").bind(body.status, id).run();
      const e = await one("SELECT title FROM elections WHERE id=?", id);
      await log(db, body.status === "open" ? "Votación abierta" : body.status === "closed" ? "Resultados publicados" : "Elección en borrador", e?.title); return ok();
    }
    if (m === "POST" && sub === "vote") {
      const e = await one("SELECT * FROM elections WHERE id=?", id);
      if (!e || e.status !== "open") throw err("La votación no está abierta");
      const c = await one("SELECT id FROM candidates WHERE id=? AND election_id=?", body.candidate_id, id);
      if (!c) throw err("Candidato inválido");
      try { await db.prepare("INSERT INTO votes(election_id,user_id,candidate_id) VALUES(?,?,?)").bind(id, s.id, c.id).run(); }
      catch { throw err("Ya votaste en esta elección"); }
      return ok();
    }
    if (m === "DELETE") {
      need();
      await db.batch([db.prepare("DELETE FROM votes WHERE election_id=?").bind(id), db.prepare("DELETE FROM candidates WHERE election_id=?").bind(id), db.prepare("DELETE FROM elections WHERE id=?").bind(id)]);
      return ok();
    }
  }

  if (res === "polls") {
    if (m === "GET") {
      const ps = await all("SELECT * FROM polls ORDER BY id DESC");
      const os = await all("SELECT o.id,o.poll_id,o.text,(SELECT COUNT(*) FROM poll_votes v WHERE v.option_id=o.id) votes FROM poll_options o");
      const mine = await all("SELECT poll_id FROM poll_votes WHERE user_id=?", s.id);
      return J(ps.map((q) => {
        const voted = mine.some((v) => v.poll_id === q.id), show = admin || voted;
        return { ...q, voted, options: os.filter((x) => x.poll_id === q.id).map((x) => ({ ...x, votes: show ? x.votes : null })) };
      }));
    }
    if (m === "POST" && !id) {
      need();
      const opts = (body.options || []).map((x) => String(x).trim()).filter(Boolean);
      if (!body.question || opts.length < 2) throw err("Escribe la pregunta y al menos 2 opciones");
      const r = await db.prepare("INSERT INTO polls(question) VALUES(?)").bind(body.question).run();
      await db.batch(opts.map((t) => db.prepare("INSERT INTO poll_options(poll_id,text) VALUES(?,?)").bind(r.meta.last_row_id, t)));
      await log(db, "Nueva encuesta", body.question); return ok();
    }
    if (m === "POST" && sub === "status") { need(); await db.prepare("UPDATE polls SET status=? WHERE id=?").bind(body.status === "closed" ? "closed" : "open", id).run(); return ok(); }
    if (m === "POST" && sub === "vote") {
      const q = await one("SELECT * FROM polls WHERE id=?", id);
      if (!q || q.status !== "open") throw err("La encuesta está cerrada");
      const x = await one("SELECT id FROM poll_options WHERE id=? AND poll_id=?", body.option_id, id);
      if (!x) throw err("Opción inválida");
      try { await db.prepare("INSERT INTO poll_votes(poll_id,user_id,option_id) VALUES(?,?,?)").bind(id, s.id, x.id).run(); }
      catch { throw err("Ya respondiste esta encuesta"); }
      return ok();
    }
    if (m === "DELETE") {
      need();
      await db.batch([db.prepare("DELETE FROM poll_votes WHERE poll_id=?").bind(id), db.prepare("DELETE FROM poll_options WHERE poll_id=?").bind(id), db.prepare("DELETE FROM polls WHERE id=?").bind(id)]);
      return ok();
    }
  }
  throw err("No encontrado", 404);
}

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    try { await init(env); return await route(req, env); }
    catch (e) { return J({ error: e.message || "Error" }, e.status || 500); }
  },
};
