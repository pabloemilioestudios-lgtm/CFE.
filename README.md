# Consejo Familiar Electoral

**Funciona ya**: abre `index.html` (o publícalo en GitHub Pages) y entra con `admin` / `A1234`. Sin backend usa *modo local* (los datos quedan en ese navegador). Para que todos los dispositivos compartan datos, conecta el backend de abajo.

Carpeta única: la web (`index.html`, `app.js`, `styles.css`, `config.js`, logos) + el backend (`worker/`).

## Backend (Cloudflare) — 4 comandos
```bash
npm i -g wrangler
wrangler login
cd cfe-plataforma/worker
node setup.js A1234 https://TU-USUARIO.github.io/TU-REPO/
```
`setup.js` crea la base de datos, publica el backend, guarda los secretos, crea el usuario admin y escribe la URL en `config.js`.

## Web (GitHub Pages)
```bash
cd ..
git init
git add .
git commit -m "CFE"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```
Luego: repo → Settings → Pages → Branch `main` / `(root)` → Save.

Entrada: usuario `admin` · contraseña la que pusiste (A1234 por defecto).
