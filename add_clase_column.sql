-- Agregar columna 'clase' a la tabla asistencia si no existe
-- Ejecuta esto en SQL Editor de Supabase

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'asistencia'
        AND table_schema = 'public'
        AND column_name = 'clase'
    ) THEN
        ALTER TABLE public.asistencia ADD COLUMN clase VARCHAR(255);
    END IF;
END $$;

-- Verificar que la columna se agregó
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'asistencia'
AND table_schema = 'public'
ORDER BY ordinal_position;