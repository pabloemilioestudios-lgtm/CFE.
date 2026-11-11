# Consejo Familiar Electoral — plataforma web

Todo en esta carpeta:
- `index.html`, `app.js`, `styles.css`, `config.js`, `logo.png` → la web (GitHub Pages)
- `worker/` → API + base de datos en Cloudflare (Workers + D1)

## 1. Cloudflare (datos en la nube)
```bash
npm i -g wrangler
wrangler login
cd worker
wrangler d1 create cfe            # copia el database_id en wrangler.toml
wrangler secret put SECRET        # una frase larga y aleatoria
wrangler deploy                   # te da https://cfe-api.xxx.workers.dev
```
Las tablas y el usuario **admin / A1234** se crean solos en la primera visita.
(Recomendado: `wrangler secret put ADMIN_PASSWORD` antes del primer uso para no dejar A1234.)

## 2. GitHub Pages (la web)
1. En `config.js` pega la URL de tu Worker. En `worker/wrangler.toml` pon tu URL de Pages en `FRONTEND_URL` y vuelve a hacer `wrangler deploy`.
2. Sube esta carpeta al repositorio (raíz).
3. Settings → Pages → *Deploy from a branch* → `main` / `(root)`.

## 3. Entrar con Google / GitHub (opcional)
Crea una app OAuth en cada servicio con la URL de retorno
`https://TU-WORKER.workers.dev/api/oauth/github/callback` (y `/google/callback`) y guarda:
`wrangler secret put GITHUB_ID`, `GITHUB_SECRET`, `GOOGLE_ID`, `GOOGLE_SECRET`.
Sin esto, esos dos botones muestran un aviso; el registro con correo funciona siempre.

## Acceso inicial
Usuario `admin` · Contraseña `A1234`
