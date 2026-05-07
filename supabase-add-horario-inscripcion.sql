-- Ejecuta este script en Supabase → SQL Editor.
-- Crea tabla `horario` (horas disponibles) y `inscripcion` (horario asignado por alumna).

create extension if not exists pgcrypto;

create table if not exists public.horario (
  id_horario uuid primary key default gen_random_uuid(),
  nombre_horario text not null,
  dia text,
  hora_inicio time,
  hora_fin time,
  created_at timestamptz not null default now()
);

-- Si `horario` ya existía con otro esquema, aseguramos columnas usadas por la app.
alter table public.horario
  add column if not exists nombre_horario text,
  add column if not exists hora_inicio time,
  add column if not exists hora_fin time;

create table if not exists public.inscripcion (
  id_inscripcion uuid primary key default gen_random_uuid(),
  id_alumna uuid not null references auth.users(id) on delete cascade,
  id_horario uuid not null references public.horario(id_horario) on delete restrict,
  created_at timestamptz not null default now(),
  unique (id_alumna)
);

-- Si `inscripcion` ya existía con otro esquema, aseguramos columnas mínimas.
alter table public.inscripcion
  add column if not exists id_inscripcion uuid;

-- Asegura PK en `inscripcion` si la tabla ya existía sin PK.
do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints tc
    where tc.table_schema = 'public'
      and tc.table_name = 'inscripcion'
      and tc.constraint_type = 'PRIMARY KEY'
  ) then
    alter table public.inscripcion
      add constraint inscripcion_pkey primary key (id_inscripcion);
  end if;
exception when others then
  -- Si ya existe otra PK o el campo no aplica, lo dejamos tal cual.
  null;
end $$;

-- Horas disponibles (puedes editar / agregar más).
-- La app usa `nombre_horario` / `hora_inicio` para mostrar opciones como "07:10", "08:10", etc.
do $$
declare
  has_hora boolean;
  has_cupo_max boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'horario'
      and column_name = 'hora'
  ) into has_hora;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'horario'
      and column_name = 'cupo_max'
  ) into has_cupo_max;

  if has_hora and has_cupo_max then
    execute $sql$
      insert into public.horario (nombre_horario, hora_inicio, hora_fin, hora, cupo_max)
      values
        ('07:10 - 08:00', '07:10', '08:00', '07:10', 20),
        ('08:10 - 09:00', '08:10', '09:00', '08:10', 20),
        ('17:00 - 18:00', '17:00', '18:00', '17:00', 20),
        ('18:00 - 19:00', '18:00', '19:00', '18:00', 20),
        ('19:00 - 20:00', '19:00', '20:00', '19:00', 20),
        ('20:00 - 21:00', '20:00', '21:00', '20:00', 20)
      on conflict do nothing
    $sql$;
  elsif has_hora then
    -- Esquema legacy: `hora` es NOT NULL, así que también la poblamos.
    execute $sql$
      insert into public.horario (nombre_horario, hora_inicio, hora_fin, hora)
      values
        ('07:10 - 08:00', '07:10', '08:00', '07:10'),
        ('08:10 - 09:00', '08:10', '09:00', '08:10'),
        ('17:00 - 18:00', '17:00', '18:00', '17:00'),
        ('18:00 - 19:00', '18:00', '19:00', '18:00'),
        ('19:00 - 20:00', '19:00', '20:00', '19:00'),
        ('20:00 - 21:00', '20:00', '21:00', '20:00')
      on conflict do nothing
    $sql$;
  elsif has_cupo_max then
    execute $sql$
      insert into public.horario (nombre_horario, hora_inicio, hora_fin, cupo_max)
      values
        ('07:10 - 08:00', '07:10', '08:00', 20),
        ('08:10 - 09:00', '08:10', '09:00', 20),
        ('17:00 - 18:00', '17:00', '18:00', 20),
        ('18:00 - 19:00', '18:00', '19:00', 20),
        ('19:00 - 20:00', '19:00', '20:00', 20),
        ('20:00 - 21:00', '20:00', '21:00', 20)
      on conflict do nothing
    $sql$;
  else
    execute $sql$
      insert into public.horario (nombre_horario, hora_inicio, hora_fin)
      values
        ('07:10 - 08:00', '07:10', '08:00'),
        ('08:10 - 09:00', '08:10', '09:00'),
        ('17:00 - 18:00', '17:00', '18:00'),
        ('18:00 - 19:00', '18:00', '19:00'),
        ('19:00 - 20:00', '19:00', '20:00'),
        ('20:00 - 21:00', '20:00', '21:00')
      on conflict do nothing
    $sql$;
  end if;
end $$;

alter table public.horario enable row level security;
alter table public.inscripcion enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'horario' and policyname = 'anon_full_access_horario'
  ) then
    create policy anon_full_access_horario on public.horario for all to anon using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'horario' and policyname = 'authenticated_full_access_horario'
  ) then
    create policy authenticated_full_access_horario on public.horario for all to authenticated using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'inscripcion' and policyname = 'anon_full_access_inscripcion'
  ) then
    create policy anon_full_access_inscripcion on public.inscripcion for all to anon using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'inscripcion' and policyname = 'authenticated_full_access_inscripcion'
  ) then
    create policy authenticated_full_access_inscripcion on public.inscripcion for all to authenticated using (true) with check (true);
  end if;
end $$;

