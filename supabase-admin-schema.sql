-- Ejecuta este script en el SQL Editor de Supabase.
-- Estandariza tablas usadas por pantallas admin.

create table if not exists public.pagos (
  id text primary key,
  id_alumna uuid not null references auth.users(id) on delete cascade,
  fecha date not null,
  monto numeric not null default 0,
  metodo text,
  estado text not null check (estado in ('Pagado', 'Pendiente', 'Vencido')),
  mes text,
  created_at timestamptz not null default now()
);

create table if not exists public.asistencias (
  id bigserial primary key,
  id_alumna uuid not null references auth.users(id) on delete cascade,
  fecha date not null,
  clase text not null,
  estado text not null check (estado in ('Presente', 'Ausente', 'Justificado')),
  created_at timestamptz not null default now(),
  unique (id_alumna, fecha)
);

create table if not exists public.horarios_clases (
  id bigserial primary key,
  bloque_horario text not null,
  dia text not null,
  nombre_clase text,
  tipo text default 'empty',
  created_at timestamptz not null default now()
);

alter table public.usuarios
  add column if not exists correo text,
  add column if not exists matricula text,
  add column if not exists plan text,
  add column if not exists horario text,
  add column if not exists fecha_nacimiento date,
  add column if not exists fecha_ingreso date default now(),
  add column if not exists estado_pago text check (estado_pago in ('Al día', 'Pendiente', 'Vencido')),
  add column if not exists proximo_pago date,
  add column if not exists ultimo_pago date,
  add column if not exists cuota_mensual numeric default 0,
  add column if not exists notas text;

-- Citas agendadas por alumnas (día y hora en fecha_hora)
create table if not exists public.citas (
  id_cita uuid primary key default gen_random_uuid(),
  id_alumna uuid not null references auth.users(id) on delete cascade,
  fecha_hora timestamptz not null,
  motivo text,
  estado text not null default 'solicitada' check (estado in ('solicitada', 'confirmada', 'cancelada')),
  created_at timestamptz not null default now()
);

-- Avisos generados por la app (ej. recordatorio de pago 7 días antes)
create table if not exists public.avisos_usuario (
  id uuid primary key default gen_random_uuid(),
  id_alumna uuid not null references auth.users(id) on delete cascade,
  tipo text not null,
  mensaje text not null,
  referencia_fecha date,
  created_at timestamptz not null default now()
);

create index if not exists idx_citas_alumna on public.citas (id_alumna);
create index if not exists idx_avisos_alumna on public.avisos_usuario (id_alumna);

alter table public.pagos enable row level security;
alter table public.asistencias enable row level security;
alter table public.horarios_clases enable row level security;
alter table public.citas enable row level security;
alter table public.avisos_usuario enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'pagos' and policyname = 'anon_full_access_pagos'
  ) then
    create policy anon_full_access_pagos on public.pagos for all to anon using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'asistencias' and policyname = 'anon_full_access_asistencias'
  ) then
    create policy anon_full_access_asistencias on public.asistencias for all to anon using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'horarios_clases' and policyname = 'anon_full_access_horarios'
  ) then
    create policy anon_full_access_horarios on public.horarios_clases for all to anon using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'citas' and policyname = 'anon_full_access_citas'
  ) then
    create policy anon_full_access_citas on public.citas for all to anon using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'avisos_usuario' and policyname = 'anon_full_access_avisos'
  ) then
    create policy anon_full_access_avisos on public.avisos_usuario for all to anon using (true) with check (true);
  end if;
end $$;
