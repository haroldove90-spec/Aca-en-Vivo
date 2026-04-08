-- 1. Profiles table (linked to Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'cliente' CHECK (role IN ('cliente', 'hotel', 'negocio', 'clasificados', 'admin', 'agencia')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Establishments table
CREATE TABLE establishments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'hotel', 'negocio', 'clasificados', 'yates', 'medicos'
  zona TEXT,
  estrellas DECIMAL DEFAULT 4.5,
  descripcion TEXT,
  direccion TEXT,
  telefono TEXT,
  whatsapp TEXT,
  image TEXT,
  galeria TEXT[],
  amenidades TEXT[],
  promocion TEXT,
  abierto BOOLEAN DEFAULT true,
  afluencia TEXT DEFAULT 'baja',
  premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Reservations table
CREATE TABLE reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  business_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  business_name TEXT,
  business_image TEXT,
  status TEXT DEFAULT 'pendiente',
  check_in DATE,
  check_out DATE,
  nights INTEGER,
  total_price DECIMAL,
  guests INTEGER,
  payment_status TEXT DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_name TEXT,
  user_photo TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  receiver_id TEXT, -- Can be admin-agencia-1 or user ID
  text TEXT NOT NULL,
  sender_name TEXT,
  sender_role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS POLICIES

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile, admins can view all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'agencia'))
);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Establishments: Everyone can view, owners can edit, admins can edit all
CREATE POLICY "Everyone can view establishments" ON establishments FOR SELECT USING (true);
CREATE POLICY "Owners can manage own establishments" ON establishments FOR ALL USING (
  owner_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'agencia'))
);

-- Reservations: Users can view own, owners can view their business's, admins all
CREATE POLICY "Users can view own reservations" ON reservations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Business owners can view their reservations" ON reservations FOR SELECT USING (
  EXISTS (SELECT 1 FROM establishments WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'agencia'))
);
CREATE POLICY "Users can create reservations" ON reservations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update reservation status" ON reservations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM establishments WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'agencia'))
);

-- Reviews: Everyone can view, users can create
CREATE POLICY "Everyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messages: Users can view their session, admins all
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (
  session_id = auth.uid()::text OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'agencia'))
);
CREATE POLICY "Users can insert messages" ON messages FOR INSERT WITH CHECK (
  session_id = auth.uid()::text OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'agencia'))
);

-- Hotel Inventory Table
CREATE TABLE IF NOT EXISTS inventario_hotel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  habitaciones_totales INTEGER DEFAULT 50,
  disponibles_ahora INTEGER DEFAULT 50,
  ultima_actualizacion TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for inventario_hotel
ALTER TABLE inventario_hotel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inventario visible para todos" ON inventario_hotel
  FOR SELECT USING (true);

CREATE POLICY "Solo dueños o admin pueden editar inventario" ON inventario_hotel
  FOR ALL USING (
    auth.uid() IN (
      SELECT owner_id FROM establishments WHERE id = establishment_id
    ) OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'agencia'))
  );

-- Trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'cliente');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
