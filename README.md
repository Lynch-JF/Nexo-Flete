# Sujumi · Frontend

Sitio estático (HTML + JS vanilla, sin build). Páginas: `sujumi-login.html`, `sujumi-dashboard.html`,
`sujumi-registrar-viaje.html`, `sujumi-comparacion.html`, `sujumi-tarifas-parametros.html`.

1. Edita `js/config.js` con la URL de tu API (Railway). Si lo sirves desde el mismo Express, usa `''`.
2. Sirve la carpeta: `npx serve .` en local, o `app.use(express.static('public'))` en el backend
   (en ese caso copia esta carpeta a `public/`), o cualquier hosting estático.
3. Abre `sujumi-login.html`. El token JWT se guarda en `localStorage` (`sujumi_token`).
