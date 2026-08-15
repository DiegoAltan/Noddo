# Noddo

Visualización y memoria en psicoterapia. App web para crear lienzos por
consultante: mapas de nodos conectados, tareas y seguimiento por sesión.

## Desarrollo

```bash
npm install
npm run dev
```

## Estado actual

- React + Vite, sin backend todavía.
- La persistencia usa `src/storage.js`, un shim que hoy guarda en
  `localStorage` del navegador. Cuando se conecte Supabase, esa es la única
  pieza que hay que reemplazar (misma firma `get(key)` / `set(key, value)`).

## Próximos pasos

- Conectar Supabase (auth + base de datos) para persistencia real y multiusuario.
- Deploy en Vercel.
