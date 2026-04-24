// Verificar estado de las tablas después de RLS
console.log('Verificando tablas en Supabase...');

// Como no podemos importar desde Node, vamos a dar instrucciones directas
console.log('Ejecuta estas consultas en SQL Editor de Supabase:');
console.log('');
console.log('1. Ver usuarios:');
console.log('SELECT id_alumna, nombre, rol, estado FROM usuarios LIMIT 5;');
console.log('');
console.log('2. Ver pagos:');
console.log('SELECT id_alumna, fecha, monto, estado FROM pagos LIMIT 5;');
console.log('');
console.log('3. Ver asistencia:');
console.log('SELECT id_alumna, fecha, clase, estado FROM asistencia LIMIT 5;');
console.log('');
console.log('4. Ver políticas RLS:');
console.log('SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = \'public\';');