-- Noddo — esquema inicial (profesionales, autenticación, lienzos, tareas)
-- Aplicar en el editor SQL de Supabase, o vía `supabase db push`.

create extension if not exists pgcrypto;

-- ============================================================
-- profesionales_autorizados
-- Administrada manualmente (dashboard/SQL) por quien opera Noddo.
-- Nadie la consulta directo desde el cliente: sin policies de
-- select/insert/update/delete, solo accesible con la service_role
-- key o desde funciones SECURITY DEFINER como handle_new_user().
-- ============================================================
create table profesionales_autorizados (
  id uuid primary key default gen_random_uuid(),
  correo text unique not null,
  estado text not null default 'activo' check (estado in ('activo', 'suspendido', 'revocado')),
  fecha_alta timestamptz not null default now(),
  vigencia_hasta date, -- null = sin vencimiento; a futuro, control de suscripción paga
  notas text
);
alter table profesionales_autorizados enable row level security;

-- ============================================================
-- perfiles — 1:1 con auth.users, solo existe si el correo estaba
-- autorizado al momento del primer login (ver trigger más abajo).
-- ============================================================
create table perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  correo text not null,
  nombre_completo text not null default '',
  profesion text not null default '',
  registro_sis text not null default '',
  registro_mineduc text not null default '',
  creado_en timestamptz not null default now()
);
alter table perfiles enable row level security;

create policy "perfil propio select" on perfiles
  for select using (id = auth.uid());

create policy "perfil propio update" on perfiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ============================================================
-- lienzos
-- nodos + enlaces viven como un documento (grafo jsonb): el editor
-- ya trata el grafo completo como una sola unidad que autoguarda
-- entera cada ~800ms, así que normalizarlo en filas no aporta y sí
-- complica la escritura fluida. Ver justificación completa en el
-- historial de la conversación.
-- ============================================================
create table lienzos (
  id uuid primary key default gen_random_uuid(),
  profesional_id uuid not null references perfiles (id) on delete cascade,
  numero integer not null,
  nombre text not null default '',
  paciente jsonb not null default '{}',
  estilo jsonb not null default '{"patron":"plano","color":"bruma"}',
  sesion integer not null default 1,
  vista jsonb not null default '{"x":0,"y":0,"k":1}',
  grafo jsonb not null default '{"nodos":[],"enlaces":[]}',
  archivado boolean not null default false,
  rut_normalizado text unique, -- null = sin acceso de consultante asociado
  codigo_acceso_hash text, -- bcrypt (pgcrypto crypt/gen_salt), nunca texto plano
  codigo_expira_en timestamptz,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
alter table lienzos enable row level security;
create index lienzos_profesional_id_idx on lienzos (profesional_id);

create policy "profesional CRUD sus lienzos" on lienzos
  for all using (profesional_id = auth.uid()) with check (profesional_id = auth.uid());

-- El consultante autentica vía Edge Function (Etapa 2), que emite una
-- sesión Supabase Auth cuyo JWT lleva app_metadata.rut_normalizado.
create policy "consultante lee su lienzo" on lienzos
  for select using (
    rut_normalizado is not null
    and rut_normalizado = (auth.jwt() -> 'app_metadata' ->> 'rut_normalizado')
  );

-- ============================================================
-- tareas — tabla propia (no dentro del grafo jsonb): es el único
-- punto donde el consultante necesita escritura granular ("solo
-- puede marcar como hecha"), y eso se resuelve mejor con una función
-- RPC dedicada (marcar_tarea) que con RLS de columna.
-- ============================================================
create table tareas (
  id uuid primary key default gen_random_uuid(),
  lienzo_id uuid not null references lienzos (id) on delete cascade,
  nodo_id text not null, -- referencia blanda al id del nodo dentro de grafo jsonb
  texto text not null default '',
  hecha boolean not null default false,
  creada_en timestamptz not null default now(),
  marcada_por uuid references auth.users (id),
  marcada_en timestamptz
);
alter table tareas enable row level security;
create index tareas_lienzo_id_idx on tareas (lienzo_id);

create policy "profesional CRUD tareas de sus lienzos" on tareas
  for all using (lienzo_id in (select id from lienzos where profesional_id = auth.uid()))
  with check (lienzo_id in (select id from lienzos where profesional_id = auth.uid()));

create policy "consultante lee tareas de su lienzo" on tareas
  for select using (
    lienzo_id in (
      select id from lienzos
      where rut_normalizado = (auth.jwt() -> 'app_metadata' ->> 'rut_normalizado')
    )
  );
-- No hay policy de UPDATE para el consultante: el toggle de "hecha"
-- pasa siempre por la función marcar_tarea() (ver más abajo).

-- ============================================================
-- accesos — bitácora de intentos/entradas de consultantes.
-- ============================================================
create table accesos (
  id uuid primary key default gen_random_uuid(),
  lienzo_id uuid references lienzos (id) on delete set null,
  rut_normalizado text not null,
  resultado text not null check (resultado in ('exitoso', 'codigo_invalido', 'rut_no_asociado', 'bloqueado')),
  creado_en timestamptz not null default now()
);
alter table accesos enable row level security;
create index accesos_lienzo_id_idx on accesos (lienzo_id);

create policy "profesional ve accesos de sus lienzos" on accesos
  for select using (lienzo_id in (select id from lienzos where profesional_id = auth.uid()));
-- Sin policy de insert: solo la Edge Function (service_role) escribe aquí.

-- ============================================================
-- intentos_acceso_consultante — rate limiting / bloqueo temporal
-- por RUT. Solo la Edge Function (service_role) la toca.
-- ============================================================
create table intentos_acceso_consultante (
  rut_normalizado text primary key,
  intentos_fallidos integer not null default 0,
  bloqueado_hasta timestamptz
);
alter table intentos_acceso_consultante enable row level security;
-- Sin policies: no accesible desde anon/authenticated.

-- ============================================================
-- handle_new_user — crea el perfil SOLO si el correo de Google
-- está autorizado y vigente. Si no lo está, auth.users igual queda
-- creado (así es como funciona Supabase Auth) pero sin perfil: como
-- todas las policies de arriba filtran por perfiles/profesional_id,
-- esa cuenta no puede leer ni escribir absolutamente nada. La app
-- cierra la sesión apenas detecta "hay sesión pero no hay perfil" y
-- muestra el mensaje de cuenta no autorizada.
--
-- Nota: se evaluó hacer esto con un trigger que aborta la creación
-- del usuario (raise exception) para que la cuenta ni siquiera
-- llegue a existir. Se descartó: lanzar excepciones desde un trigger
-- sobre auth.users no es una práctica soportada de forma oficial por
-- Supabase y puede dejar el flujo de OAuth en un estado confuso. El
-- enfoque de abajo logra el mismo resultado de seguridad (cero
-- acceso a datos) apoyado enteramente en RLS, sin tocar el
-- comportamiento interno de Auth.
-- ============================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from profesionales_autorizados
    where lower(correo) = lower(new.email)
      and estado = 'activo'
      and (vigencia_hasta is null or vigencia_hasta >= current_date)
  ) then
    insert into perfiles (id, correo)
    values (new.id, new.email)
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- marcar_tarea — único camino de escritura que tiene el consultante.
-- SECURITY DEFINER porque debe poder hacer el UPDATE incluso cuando
-- quien llama es un consultante (que solo tiene SELECT por RLS), pero
-- valida "a mano" que la tarea pertenezca a su lienzo o al lienzo de
-- un profesional autenticado como dueño antes de tocar la fila.
-- ============================================================
create or replace function marcar_tarea(p_tarea_id uuid, p_hecha boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lienzo record;
begin
  select l.profesional_id, l.rut_normalizado
  into v_lienzo
  from tareas t
  join lienzos l on l.id = t.lienzo_id
  where t.id = p_tarea_id;

  if not found then
    raise exception 'Tarea no encontrada';
  end if;

  if v_lienzo.profesional_id <> auth.uid()
     and (
       v_lienzo.rut_normalizado is null
       or v_lienzo.rut_normalizado <> (auth.jwt() -> 'app_metadata' ->> 'rut_normalizado')
     )
  then
    raise exception 'No autorizado';
  end if;

  update tareas
  set hecha = p_hecha, marcada_por = auth.uid(), marcada_en = now()
  where id = p_tarea_id;
end;
$$;

revoke execute on function marcar_tarea(uuid, boolean) from public;
grant execute on function marcar_tarea(uuid, boolean) to authenticated;

-- ============================================================
-- generar_codigo_acceso — el profesional (dueño del lienzo) genera
-- o regenera el código de acceso del consultante. Alfabeto sin
-- 0/O/1/l/I (se lee en voz alta). 8 símbolos de un alfabeto de 32 =
-- 32^8 (~1.1 billón de combinaciones). Se guarda solo el hash
-- (pgcrypto, bcrypt); el texto plano se retorna una única vez para
-- que el profesional lo copie/comunique.
-- ============================================================
create or replace function generar_codigo_acceso(p_lienzo_id uuid)
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_alfabeto text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- 32 símbolos
  v_bytes bytea;
  v_codigo text := '';
  v_i int;
begin
  if not exists (
    select 1 from lienzos where id = p_lienzo_id and profesional_id = auth.uid()
  ) then
    raise exception 'No autorizado';
  end if;

  v_bytes := gen_random_bytes(8);
  for v_i in 0..7 loop
    v_codigo := v_codigo || substr(v_alfabeto, 1 + (get_byte(v_bytes, v_i) % 32), 1);
  end loop;

  update lienzos
  set codigo_acceso_hash = crypt(v_codigo, gen_salt('bf')),
      codigo_expira_en = now() + interval '90 days',
      actualizado_en = now()
  where id = p_lienzo_id;

  return v_codigo;
end;
$$;

revoke execute on function generar_codigo_acceso(uuid) from public;
grant execute on function generar_codigo_acceso(uuid) to authenticated;
