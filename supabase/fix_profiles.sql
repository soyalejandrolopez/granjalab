-- SCRIPT PARA SOLUCIONAR PROBLEMAS DE RLS
-- Ejecuta este script en Supabase SQL Editor

-- 1. Verificar que las tablas existen
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'residuos', 'solicitudes', 'transacciones');

-- 2. Ver usuarios registrados en auth.users
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 3. Ver perfiles existentes
SELECT id, email, nombre, rol, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- 4. Contar usuarios sin perfil
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_usuarios_auth,
  (SELECT COUNT(*) FROM profiles) as total_perfiles,
  (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM profiles) as usuarios_sin_perfil;

-- 5. Ver usuarios que no tienen perfil
SELECT
  u.id,
  u.email,
  u.created_at,
  u.raw_user_meta_data->>'nombre' as nombre_metadata,
  u.raw_user_meta_data->>'rol' as rol_metadata
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 6. CREAR PERFILES FALTANTES MANUALMENTE
-- Si hay usuarios sin perfil, este script los crea
INSERT INTO profiles (id, email, nombre, rol)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'nombre', 'Usuario'),
  COALESCE(u.raw_user_meta_data->>'rol', 'productor')
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 7. Verificar que ahora todos los usuarios tienen perfil
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_usuarios_auth,
  (SELECT COUNT(*) FROM profiles) as total_perfiles,
  CASE
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM profiles)
    THEN '✅ Todos los usuarios tienen perfil'
    ELSE '❌ Hay usuarios sin perfil'
  END as estado;
