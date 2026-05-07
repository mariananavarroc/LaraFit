-- Si "Aceptar pago" no actualiza filas: suele ser RLS.
-- Ejecuta en SQL Editor (ajusta si ya tienes políticas propias).

alter table public.pagos enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'pagos' and policyname = 'anon_full_access_pagos'
  ) then
    create policy anon_full_access_pagos on public.pagos
      for all to anon
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'pagos' and policyname = 'authenticated_full_access_pagos'
  ) then
    create policy authenticated_full_access_pagos on public.pagos
      for all to authenticated
      using (true)
      with check (true);
  end if;
end $$;
