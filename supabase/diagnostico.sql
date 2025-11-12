-- SCRIPT DE DIAGNÓSTICO - Ejecutar primero para verificar el estado de la base de datos
-- Copia este script en Supabase SQL Editor y ejecútalo

-- 1. Verificar si las tablas existen
SELECT
  table_name,
  CASE
    WHEN table_name IN ('profiles', 'residuos', 'solicitudes', 'transacciones') THEN '✅ Existe'
    ELSE '❌ No existe'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'residuos', 'solicitudes', 'transacciones')
ORDER BY table_name;

-- 2. Ver cuántos usuarios existen en auth.users
SELECT COUNT(*) as total_usuarios_auth FROM auth.users;

-- 3. Ver cuántos perfiles existen
SELECT COUNT(*) as total_perfiles FROM profiles;

-- 4. Ver si el trigger existe
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
