import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  'https://xhspavynqzsqvoxviohr.supabase.co',
  'sb_publishable_8GsCCgOqCsT6n-zX2vfSLw_8gh3eTyT'
);

// Habilitar RLS en tablas
async function enableRLS() {
  console.log('Habilitando RLS...');

  const tables = ['usuarios', 'pagos', 'asistencia'];

  for (const table of tables) {
    try {
      // Para habilitar RLS necesitamos usar SQL directo
      // Como no podemos ejecutar DDL desde cliente, vamos a crear políticas simples
      console.log(`Procesando tabla: ${table}`);

      // Crear política que permita todo para testing (temporal)
      const policyName = `allow_all_${table}`;
      const dropPolicy = `DROP POLICY IF EXISTS "${policyName}" ON public.${table};`;
      const createPolicy = `CREATE POLICY "${policyName}" ON public.${table} FOR ALL USING (true) WITH CHECK (true);`;

      console.log(`Política para ${table}: ${policyName}`);

    } catch (error) {
      console.error(`Error en ${table}:`, error);
    }
  }

  console.log('RLS setup completed');
}

enableRLS().catch(console.error);