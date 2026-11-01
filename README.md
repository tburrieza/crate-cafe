# Crate Café

Sitio de Crate Café en Vercel: linktree (`/`) y Crate Puntos (`/crate-puntos`).

## Variables de entorno (Vercel → Project Settings → Environment Variables)

- `cratepuntos_MONGODB_URI`: URI de MongoDB Atlas. No va en el repo.
- `MONGO_DB` (opcional): base de datos, por defecto `crate_puntos`.

Región de las funciones: `lhr1` (Londres), en `vercel.json`.

## Colecciones

- `links`: `{ label, url, order, active }`. Son los enlaces del linktree. `/api/links` devuelve solo los `active: true`, ordenados por `order`, con cache de 5 min en el edge.
- `signups`: altas de Crate Puntos (`nombre`, `apellido`, `email`, `consent`). El email es único.

## Desarrollo

    npm install
    npx vercel dev
