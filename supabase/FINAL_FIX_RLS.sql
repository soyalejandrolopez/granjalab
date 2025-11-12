-- SCRIPT DEFINITIVO PARA ARREGLAR RLS
-- Este script resetea TODAS las políticas RLS y las recrea correctamente

-- ========================================
-- PASO 1: ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
-- ========================================

-- Eliminar políticas de profiles
DROP POLICY IF EXISTS "Los usuarios pueden ver todos los perfiles" ON profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Los admins pueden hacer todo en profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all_policy" ON profiles;

-- ========================================
-- PASO 2: DESHABILITAR RLS TEMPORALMENTE
-- ========================================

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ========================================
-- PASO 3: PROBAR QUE FUNCIONA SIN RLS
-- ========================================

-- Verificar que los perfiles son accesibles
SELECT id, email, nombre, rol FROM profiles LIMIT 5;

-- ========================================
-- PASO 4: HABILITAR RLS CON POLÍTICAS SIMPLES
-- ========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política SÚPER PERMISIVA para SELECT (debugging)
-- Permite a CUALQUIER usuario autenticado ver TODOS los perfiles
CREATE POLICY "allow_all_select"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Política para INSERT (solo el propio usuario o el trigger)
CREATE POLICY "allow_own_insert"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Política para UPDATE (solo el propio usuario)
CREATE POLICY "allow_own_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política para DELETE (solo el propio usuario)
CREATE POLICY "allow_own_delete"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ========================================
-- PASO 5: VERIFICAR LAS NUEVAS POLÍTICAS
-- ========================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ========================================
-- PASO 6: PROBAR UNA CONSULTA COMO USUARIO AUTENTICADO
-- ========================================

-- Esta consulta simula lo que hace tu aplicación
SELECT rol FROM profiles WHERE id = auth.uid();
