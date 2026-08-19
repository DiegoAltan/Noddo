# Noddo

Visualización y memoria en psicoterapia. App web para crear lienzos por
consultante: mapas de nodos conectados, tareas y seguimiento por sesión.

## Desarrollo

```bash
npm install
npm run dev
```

## Estado actual

- React + Vite.
- Autenticación y persistencia con Supabase: acceso de profesionales por
  Google OAuth (invitación manual vía la tabla `profesionales_autorizados`),
  lienzos/tareas guardados en Postgres con Row Level Security.
- El acceso de consultante (RUT + código) todavía no está conectado — la
  pantalla existe pero falta la Edge Function que lo valida (próxima etapa).
- La migración de lienzos que quedaron en `localStorage` de sesiones
  anteriores a Supabase todavía no está implementada (próxima etapa).

## Configuración de Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Habilita el proveedor de Google en Authentication > Providers.
3. Corre `supabase/migrations/0001_init.sql` en el editor SQL del proyecto.
4. Agrega tu correo a `profesionales_autorizados` (estado `activo`).
5. Copia `.env.example` a `.env.local` y completa `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY` (la anon key es pública; la service key nunca
   va en el cliente).

## Próximos pasos

- Etapa 2: acceso de consultante (Edge Function RUT + código).
- Etapa 3: importar a Supabase lo que haya quedado en `localStorage`.
- Deploy en Vercel (agregar las mismas variables de entorno ahí).
