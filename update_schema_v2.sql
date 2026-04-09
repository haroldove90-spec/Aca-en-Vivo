-- 1. Asegurar que la tabla entities existe y tiene los campos necesarios
CREATE TABLE IF NOT EXISTS entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL DEFAULT 0,
  zona TEXT,
  imagen TEXT,
  imagenes_secundarias JSONB DEFAULT '[]',
  status TEXT DEFAULT 'activo',
  tipo TEXT NOT NULL, -- 'hotel', 'negocio', 'clasificado'
  whatsapp TEXT,
  categoria TEXT,
  capacidad INTEGER DEFAULT 0,
  estrellas DECIMAL DEFAULT 0,
  afluencia TEXT DEFAULT 'baja',
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Asegurar que la tabla reservations existe
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  entity_id UUID REFERENCES entities(id),
  status TEXT DEFAULT 'pendiente',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Agregar columna imagenes_secundarias si no existe
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entities' AND column_name='imagenes_secundarias') THEN
    ALTER TABLE entities ADD COLUMN imagenes_secundarias JSONB DEFAULT '[]';
  END IF;
END $$;

-- 4. Cambiar el estado por defecto a 'activo'
ALTER TABLE entities ALTER COLUMN status SET DEFAULT 'activo';

-- 5. Actualizar todos los registros existentes a 'activo' (como pidió el usuario)
UPDATE entities SET status = 'activo';

-- 6. RLS Policies para permitir acceso total a admin/agencia
-- Asumiendo que ya existen, pero aseguramos que puedan ver todo
DROP POLICY IF EXISTS "Admins can view all entities" ON entities;
CREATE POLICY "Admins can view all entities" ON entities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage all entities" ON entities;
CREATE POLICY "Admins can manage all entities" ON entities FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'agencia'))
);

-- 7. Asegurar que el usuario haroldove90@gmail.com tenga el rol admin
UPDATE profiles SET role = 'admin' WHERE email = 'haroldove90@gmail.com';
