-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('productor', 'reciclador', 'gestor', 'admin')),
  telefono TEXT,
  direccion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabla de residuos
CREATE TABLE IF NOT EXISTS residuos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  productor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  cantidad_kg NUMERIC(10, 2) NOT NULL CHECK (cantidad_kg > 0),
  descripcion TEXT,
  disponible BOOLEAN DEFAULT TRUE,
  fecha_generacion DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabla de solicitudes
CREATE TABLE IF NOT EXISTS solicitudes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residuo_id UUID NOT NULL REFERENCES residuos(id) ON DELETE CASCADE,
  solicitante_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  productor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aceptada', 'rechazada', 'completada')),
  mensaje TEXT,
  fecha_recoleccion DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabla de transacciones
CREATE TABLE IF NOT EXISTS transacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
  cantidad_procesada_kg NUMERIC(10, 2) NOT NULL CHECK (cantidad_procesada_kg > 0),
  notas TEXT,
  fecha_completado DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_residuos_productor ON residuos(productor_id);
CREATE INDEX IF NOT EXISTS idx_residuos_disponible ON residuos(disponible);
CREATE INDEX IF NOT EXISTS idx_solicitudes_residuo ON solicitudes(residuo_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_solicitante ON solicitudes(solicitante_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_productor ON solicitudes(productor_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_status ON solicitudes(status);
CREATE INDEX IF NOT EXISTS idx_transacciones_solicitud ON transacciones(solicitud_id);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_residuos_updated_at
  BEFORE UPDATE ON residuos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_solicitudes_updated_at
  BEFORE UPDATE ON solicitudes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'productor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ===========================
-- ROW LEVEL SECURITY (RLS)
-- ===========================

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE residuos ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Los usuarios pueden ver todos los perfiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Los admins pueden hacer todo en profiles"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Políticas para residuos
CREATE POLICY "Todos pueden ver residuos disponibles"
  ON residuos FOR SELECT
  USING (disponible = true OR productor_id = auth.uid());

CREATE POLICY "Los productores pueden crear residuos"
  ON residuos FOR INSERT
  WITH CHECK (
    productor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'productor'
    )
  );

CREATE POLICY "Los productores pueden actualizar sus residuos"
  ON residuos FOR UPDATE
  USING (productor_id = auth.uid());

CREATE POLICY "Los productores pueden eliminar sus residuos"
  ON residuos FOR DELETE
  USING (productor_id = auth.uid());

CREATE POLICY "Los admins pueden hacer todo en residuos"
  ON residuos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Políticas para solicitudes
CREATE POLICY "Los usuarios pueden ver sus solicitudes"
  ON solicitudes FOR SELECT
  USING (
    solicitante_id = auth.uid() OR
    productor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Recicladores y gestores pueden crear solicitudes"
  ON solicitudes FOR INSERT
  WITH CHECK (
    solicitante_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol IN ('reciclador', 'gestor')
    )
  );

CREATE POLICY "Productores pueden actualizar solicitudes de sus residuos"
  ON solicitudes FOR UPDATE
  USING (productor_id = auth.uid());

CREATE POLICY "Solicitantes pueden actualizar sus solicitudes"
  ON solicitudes FOR UPDATE
  USING (solicitante_id = auth.uid());

CREATE POLICY "Los admins pueden hacer todo en solicitudes"
  ON solicitudes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Políticas para transacciones
CREATE POLICY "Los usuarios pueden ver transacciones relacionadas"
  ON transacciones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM solicitudes s
      WHERE s.id = transacciones.solicitud_id
      AND (s.solicitante_id = auth.uid() OR s.productor_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Recicladores y gestores pueden crear transacciones"
  ON transacciones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM solicitudes s
      JOIN profiles p ON p.id = auth.uid()
      WHERE s.id = transacciones.solicitud_id
      AND s.solicitante_id = auth.uid()
      AND p.rol IN ('reciclador', 'gestor')
      AND s.status = 'aceptada'
    )
  );

CREATE POLICY "Los admins pueden hacer todo en transacciones"
  ON transacciones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
