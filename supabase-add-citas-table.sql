-- Ejecuta en Supabase → SQL Editor si aparece error de tabla citas / schema cache.

create table if not exists public.citas (
  id_cita uuid primary key default gen_random_uuid(),
  id_alumna uuid not null references auth.users(id) on delete cascade,
  fecha_hora timestamptz not null,
  motivo text,
  estado text not null default 'solicitada' check (estado in ('solicitada', 'confirmada', 'cancelada')),
  created_at timestamptz not null default now()
);

create index if not exists idx_citas_alumna on public.citas (id_alumna);

alter table public.citas enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'citas' and policyname = 'anon_full_access_citas'
  ) then
    create policy anon_full_access_citas on public.citas for all to anon using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'citas' and policyname = 'authenticated_full_access_citas'
  ) then
    create policy authenticated_full_access_citas on public.citas for all to authenticated using (true) with check (true);
  end if;
end $$;
