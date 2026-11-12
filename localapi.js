// Modo local: hace que TODA la plataforma funcione sin servidor (datos en este navegador).
// Cuando conectes el backend de Cloudflare (config.js), esto deja de usarse.
(function () {
  const K = "cfe_db", now = () => new Date().toISOString().replace("T", " ").slice(0, 19);
  const err = (m, s = 400) => Object.assign(new Error(m), { status: s });
  async function H(p) {
    const s = "cfe:" + p;
    if (globalThis.crypto && crypto.subtle) { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join(""); }
    let h = 5381; for (const c of s) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0; return "x" + h;
  }
  const load = () => { try { const d = JSON.parse(localStorage.getItem(K)); if (d && d.users) return d; } catch {} return { seq: {}, users: [], parties: [], elections: [], candidates: [], votes: [], polls: [], options: [], pvotes: [], activity: [] }; };
  const save = (d) => localStorage.setItem(K, JSON.stringify(d));
  const nid = (d, t) => (d.seq[t] = (d.seq[t] || 0) + 1);
  const pub = (u) => ({ id: u.id, name: u.name, username: u.username, role: u.role });

  async function handle(db, p, m, b, tok) {
    const log = (t, d = "") => db.activity.unshift({ id: nid(db, "a"), text: t, detail: d, created: now() });
    const mkUser = async (name, username, password) => {
      username = String(username).trim().toLowerCase();
      if (db.users.some((x) => x.username === username)) throw err("Ese usuario ya existe");
      const u = { id: nid(db, "u"), name, username, role: "member", pass: await H(password), created: now() };
      db.users.push(u); return u;
    };
    if (p === "/api/login" && m === "POST") {
      const u = db.users.find((x) => x.username === String(b.username || "").trim().toLowerCase());
      if (!u || u.pass !== (await H(String(b.password || "")))) throw err("Usuario o contraseña incorrectos", 401);
      return { token: "local:" + u.id, user: pub(u) };
    }
    if (p === "/api/register" && m === "POST") {
      if (!b.name || !b.username || String(b.password || "").length < 6) throw err("Completa nombre, correo y una contraseña de 6 o más caracteres");
      let u; try { u = await mkUser(b.name, b.username, b.password); } catch { throw err("Ese correo ya está registrado"); }
      log("Se registró un miembro", b.name);
      return { token: "local:" + u.id, user: pub(u) };
    }
    const me = db.users.find((x) => x.id === +String(tok || "").replace("local:", ""));
    if (!me) throw err("Sesión no válida", 401);
    const admin = me.role === "admin", need = () => { if (!admin) throw err("Solo el administrador puede hacer esto", 403); };
    const mt = p.match(/^\/api\/(\w+)(?:\/(\d+))?(?:\/(\w+))?$/); if (!mt) throw err("No encontrado", 404);
    const res = mt[1], id = +mt[2], sub = mt[3], ok = { ok: true };
    const byId = (arr) => arr.find((x) => x.id === id);

    if (res === "me") return pub(me);
    if (res === "profile" && m === "POST") { if (!b.name) throw err("Escribe tu nombre"); me.name = b.name; return ok; }
    if (res === "password" && m === "POST") {
      if (me.pass !== (await H(String(b.old || "")))) throw err("La contraseña actual no es correcta");
      if (String(b.new || "").length < 4) throw err("La nueva contraseña es muy corta");
      me.pass = await H(b.new); return ok;
    }
    if (res === "activity") return db.activity.slice(0, 100);
    if (res === "dashboard") {
      const open = db.elections.filter((e) => e.status === "open"), members = db.users.length, voters = new Set(db.votes.map((v) => v.user_id)).size;
      const next = [...db.elections].filter((e) => e.status !== "closed").sort((a, c) => (c.status === "open") - (a.status === "open") || c.id - a.id)[0] || null;
      return { members, open: open.length, closed: db.elections.filter((e) => e.status === "closed").length,
        participation: members ? Math.round((voters / members) * 100) : 0,
        pending: open.filter((e) => !db.votes.some((v) => v.election_id === e.id && v.user_id === me.id)).length
               + db.polls.filter((q) => q.status === "open" && !db.pvotes.some((v) => v.poll_id === q.id && v.user_id === me.id)).length,
        next, recent: db.activity.slice(0, 4) };
    }
    if (res === "members") {
      if (m === "GET") return db.users.map((u) => admin ? { id: u.id, name: u.name, username: u.username, role: u.role, created: u.created } : { id: u.id, name: u.name, role: u.role, created: u.created });
      need();
      if (m === "POST" && !id) {
        if (!b.name || !b.username || String(b.password || "").length < 4) throw err("Datos incompletos");
        await mkUser(b.name, b.username, b.password); log("Se registró un miembro", b.name); return ok;
      }
      if (m === "POST" && sub === "password") {
        if (String(b.password || "").length < 4) throw err("Contraseña muy corta");
        const u = byId(db.users); if (u && u.role !== "admin") u.pass = await H(b.password); return ok;
      }
      if (m === "DELETE") { db.users = db.users.filter((u) => !(u.id === id && u.role !== "admin")); return ok; }
    }
    if (res === "parties") {
      if (m === "GET") return [...db.parties].sort((a, c) => a.name.localeCompare(c.name));
      need();
      if (m === "POST") { if (!b.name) throw err("Falta el nombre del partido"); db.parties.push({ id: nid(db, "p"), name: b.name, color: b.color || "#f59e0b", description: b.description || "" }); log("Nuevo partido registrado", b.name); return ok; }
      if (m === "DELETE") { db.parties = db.parties.filter((x) => x.id !== id); return ok; }
    }
    if (res === "candidates") {
      if (m === "GET") return db.candidates.map((c) => { const e = db.elections.find((x) => x.id === c.election_id), pt = db.parties.find((x) => x.id === c.party_id); return e && { id: c.id, name: c.name, bio: c.bio, election_id: c.election_id, election: e.title, party: pt?.name, color: pt?.color }; }).filter(Boolean).sort((a, c) => c.election_id - a.election_id || a.id - c.id);
      need();
      if (m === "POST") {
        if (!b.name || !b.election_id) throw err("Elige la elección y escribe el nombre del candidato");
        db.candidates.push({ id: nid(db, "c"), election_id: +b.election_id, party_id: b.party_id ? +b.party_id : null, name: b.name, bio: b.bio || "" }); log("Nuevo candidato", b.name); return ok;
      }
      if (m === "DELETE") { db.votes = db.votes.filter((v) => v.candidate_id !== id); db.candidates = db.candidates.filter((c) => c.id !== id); return ok; }
    }
    if (res === "elections") {
      if (m === "GET") return [...db.elections].sort((a, c) => c.id - a.id).map((e) => {
        const show = admin || e.status === "closed";
        return { ...e, voted: db.votes.some((v) => v.election_id === e.id && v.user_id === me.id),
          candidates: db.candidates.filter((c) => c.election_id === e.id).map((c) => { const pt = db.parties.find((x) => x.id === c.party_id); return { id: c.id, election_id: c.election_id, name: c.name, bio: c.bio, party: pt?.name, color: pt?.color, votes: show ? db.votes.filter((v) => v.candidate_id === c.id).length : null }; }) };
      });
      if (m === "POST" && !id) { need(); if (!b.title) throw err("Falta el título"); db.elections.push({ id: nid(db, "e"), title: b.title, description: b.description || "", date: b.date || "", status: "draft", created: now() }); log("Nueva elección creada", b.title); return ok; }
      if (m === "POST" && sub === "status") {
        need(); if (!["draft", "open", "closed"].includes(b.status)) throw err("Estado inválido");
        const e = byId(db.elections); if (e) { e.status = b.status; log(b.status === "open" ? "Votación abierta" : b.status === "closed" ? "Resultados publicados" : "Elección en borrador", e.title); } return ok;
      }
      if (m === "POST" && sub === "vote") {
        const e = byId(db.elections); if (!e || e.status !== "open") throw err("La votación no está abierta");
        const c = db.candidates.find((x) => x.id === +b.candidate_id && x.election_id === id); if (!c) throw err("Candidato inválido");
        if (db.votes.some((v) => v.election_id === id && v.user_id === me.id)) throw err("Ya votaste en esta elección");
        db.votes.push({ election_id: id, user_id: me.id, candidate_id: c.id }); return ok;
      }
      if (m === "DELETE") { need(); db.votes = db.votes.filter((v) => v.election_id !== id); db.candidates = db.candidates.filter((c) => c.election_id !== id); db.elections = db.elections.filter((e) => e.id !== id); return ok; }
    }
    if (res === "polls") {
      if (m === "GET") return [...db.polls].sort((a, c) => c.id - a.id).map((q) => {
        const voted = db.pvotes.some((v) => v.poll_id === q.id && v.user_id === me.id), show = admin || voted;
        return { ...q, voted, options: db.options.filter((o) => o.poll_id === q.id).map((o) => ({ ...o, votes: show ? db.pvotes.filter((v) => v.option_id === o.id).length : null })) };
      });
      if (m === "POST" && !id) {
        need(); const opts = (b.options || []).map((x) => String(x).trim()).filter(Boolean);
        if (!b.question || opts.length < 2) throw err("Escribe la pregunta y al menos 2 opciones");
        const q = { id: nid(db, "q"), question: b.question, status: "open" }; db.polls.push(q);
        opts.forEach((t) => db.options.push({ id: nid(db, "o"), poll_id: q.id, text: t })); log("Nueva encuesta", b.question); return ok;
      }
      if (m === "POST" && sub === "status") { need(); const q = byId(db.polls); if (q) q.status = b.status === "closed" ? "closed" : "open"; return ok; }
      if (m === "POST" && sub === "vote") {
        const q = byId(db.polls); if (!q || q.status !== "open") throw err("La encuesta está cerrada");
        const o = db.options.find((x) => x.id === +b.option_id && x.poll_id === id); if (!o) throw err("Opción inválida");
        if (db.pvotes.some((v) => v.poll_id === id && v.user_id === me.id)) throw err("Ya respondiste esta encuesta");
        db.pvotes.push({ poll_id: id, user_id: me.id, option_id: o.id }); return ok;
      }
      if (m === "DELETE") { need(); db.pvotes = db.pvotes.filter((v) => v.poll_id !== id); db.options = db.options.filter((o) => o.poll_id !== id); db.polls = db.polls.filter((q) => q.id !== id); return ok; }
    }
    throw err("No encontrado", 404);
  }

  window.localApi = async (p, m = "GET", b = {}, tok) => {
    const db = load();
    if (!db.users.length) db.users.push({ id: nid(db, "u"), name: "Administrador", username: "admin", role: "admin", pass: await H("A1234"), created: now() });
    const r = await handle(db, p, m, b || {}, tok);
    save(db); return r;
  };
})();
