-- Ejecuta en Supabase → SQL Editor si al guardar una alumna aparece error de columna inexistente.

alter table public.usuarios
  add column if not exists correo text,
  add column if not exists notas text;
