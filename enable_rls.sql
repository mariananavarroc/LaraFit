-- Habilitar RLS en las tablas principales
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencia ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
DROP POLICY IF EXISTS "ver usuarios" ON public.usuarios;
CREATE POLICY "ver usuarios" ON public.usuarios
FOR SELECT USING (
  auth.uid() = id_alumna
  OR (SELECT rol FROM public.usuarios WHERE id_alumna = auth.uid()) = 1
);

DROP POLICY IF EXISTS "registrar usuario" ON public.usuarios;
CREATE POLICY "registrar usuario" ON public.usuarios
FOR INSERT WITH CHECK (true);

-- Políticas para pagos
DROP POLICY IF EXISTS "ver pagos" ON public.pagos;
CREATE POLICY "ver pagos" ON public.pagos
FOR SELECT USING (
  (SELECT rol FROM public.usuarios WHERE id_alumna = auth.uid()) = 1
  OR id_alumna = auth.uid()
);

DROP POLICY IF EXISTS "crear pagos" ON public.pagos;
CREATE POLICY "crear pagos" ON public.pagos
FOR INSERT WITH CHECK (
  (SELECT rol FROM public.usuarios WHERE id_alumna = auth.uid()) = 1
);

-- Políticas para asistencia
DROP POLICY IF EXISTS "ver asistencia" ON public.asistencia;
CREATE POLICY "ver asistencia" ON public.asistencia
FOR SELECT USING (
  (SELECT rol FROM public.usuarios WHERE id_alumna = auth.uid()) = 1
  OR id_alumna = auth.uid()
);

DROP POLICY IF EXISTS "crear asistencia" ON public.asistencia;
CREATE POLICY "crear asistencia" ON public.asistencia
FOR INSERT WITH CHECK (
  (SELECT rol FROM public.usuarios WHERE id_alumna = auth.uid()) = 1
);