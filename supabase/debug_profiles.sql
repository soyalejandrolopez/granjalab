-- DIAGNÓSTICO DETALLADO DE PERFILES
-- Ejecuta este script línea por línea en Supabase SQL Editor

-- 1. Ver TODOS los usuarios en auth.users
SELECT
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- 2. Ver TODOS los perfiles
SELECT
  id,
  email,
  nombre,
  rol,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- 3. Verificar políticas RLS en profiles
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 4. Probar consulta directa (sin RLS) - SOLO PARA DEBUGGING
SET LOCAL ROLE postgres;
SELECT * FROM profiles;
RESET ROLE;

-- 5. Ver si hay usuarios sin perfil
SELECT
  u.id as user_id,
  u.email as user_email,
  p.id as profile_id,
  p.email as profile_email,
  CASE
    WHEN p.id IS NULL THEN '❌ Sin perfil'
    ELSE '✅ Con perfil'
  END as estado
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
