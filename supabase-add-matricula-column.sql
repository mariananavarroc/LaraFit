-- Ejecuta esto en Supabase → SQL Editor si aparece:
-- "column usuarios.matricula does not exist"

alter table public.usuarios
  add column if not exists matricula text;
