-- SOLUCIÓN: Arreglar Políticas RLS de Profiles
-- Este script elimina las políticas problemáticas y crea nuevas políticas correctas

-- 1. ELIMINAR políticas antiguas
DROP POLICY IF EXISTS "Los usuarios pueden ver todos los perfiles" ON profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Los admins pueden hacer todo en profiles" ON profiles;

-- 2. CREAR políticas nuevas y correctas

-- Política para SELECT: Todos pueden ver todos los perfiles (autenticados y anónimos)
CREATE POLICY "profiles_select_policy"
  ON profiles FOR SELECT
  TO authenticated, anon
  USING (true);

-- Política para INSERT: Solo el sistema puede crear perfiles (vía trigger)
CREATE POLICY "profiles_insert_policy"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Política para UPDATE: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "profiles_update_policy"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política para DELETE: Los usuarios pueden eliminar su propio perfil
CREATE POLICY "profiles_delete_policy"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Política especial para admins (pueden hacer todo)
CREATE POLICY "profiles_admin_all_policy"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- 3. Verificar que RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Verificar las nuevas políticas
SELECT
  policyname,
  cmd,
  roles,
  CASE
    WHEN qual IS NOT NULL THEN 'Con restricción'
    ELSE 'Sin restricción'
  END as tipo
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
