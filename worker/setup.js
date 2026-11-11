// Uso: node setup.js [CONTRASEÑA_ADMIN] [URL_DE_GITHUB_PAGES]
// Crea la base de datos, publica el backend, guarda los secretos y conecta config.js
const { execSync } = require("child_process"), fs = require("fs"), path = require("path"), crypto = require("crypto");
const pass = process.argv[2] || "A1234", front = process.argv[3] || "";
const sh = (c, o = {}) => { try { return execSync(c + " 2>&1", { encoding: "utf8", ...o }); } catch (e) { console.log(e.stdout || e.message); process.exit(1); } };
const tomlPath = path.join(__dirname, "wrangler.toml");
let t = fs.readFileSync(tomlPath, "utf8");

if (t.includes("PEGA_AQUI")) {
  console.log("1/4 Creando base de datos D1...");
  const out = sh("wrangler d1 create cfe"); console.log(out);
  const m = out.match(/database_id["']?\s*[:=]\s*["']([0-9a-f-]{36})["']/i);
  if (!m) { console.log("No pude leer el database_id. Cópialo a wrangler.toml a mano."); process.exit(1); }
  t = t.replace("PEGA_AQUI_EL_ID_DE_D1", m[1]);
}
if (front) t = t.replace(/FRONTEND_URL = ".*"/, `FRONTEND_URL = "${front}"`);
fs.writeFileSync(tomlPath, t);

console.log("2/4 Publicando el backend...");
const dep = sh("wrangler deploy"); console.log(dep);
const url = (dep.match(/https:\/\/[\w.-]+\.workers\.dev/) || [])[0];

console.log("3/4 Guardando secretos...");
sh("wrangler secret put SECRET", { input: crypto.randomBytes(32).toString("hex") });
sh("wrangler secret put ADMIN_PASSWORD", { input: pass });

console.log("4/4 Conectando la web...");
if (url) {
  const cp = path.join(__dirname, "..", "config.js");
  fs.writeFileSync(cp, fs.readFileSync(cp, "utf8").replace(/window\.CFE_API = ".*";/, `window.CFE_API = "${url}";`));
  console.log("\nLISTO. Backend: " + url + "\nUsuario: admin   Contraseña: " + pass);
} else console.log("\nBackend publicado. Pega la URL del Worker en config.js (window.CFE_API).");
