# Cambios para el backend

1. Copia `src/routes/personal.routes.js` a `src/routes/` en el backend.
2. Reemplaza `src/utils/versionedResource.js` por el de esta carpeta (corrige `entityKeyColumns` y aplica `compute`).
3. En `src/app.js` agrega:
   const personalRoutes = require('./routes/personal.routes');
   app.use('/personal', personalRoutes);
