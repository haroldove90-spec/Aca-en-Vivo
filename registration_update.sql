-- 1. Agregar columnas adicionales a la tabla de perfiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_name TEXT;

-- 2. Actualizar la función que maneja nuevos usuarios para incluir los nuevos campos
-- y crear automáticamente el establecimiento si el rol es hotel o negocio
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    avatar_url, 
    role, 
    phone, 
    whatsapp, 
    address, 
    business_name
  )
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    COALESCE(new.raw_user_meta_data->>'role', 'cliente'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'whatsapp',
    new.raw_user_meta_data->>'address',
    new.raw_user_meta_data->>'business_name'
  );
  
  -- Crear entrada en establishments automáticamente para hoteles y negocios
  IF (new.raw_user_meta_data->>'role' = 'hotel' OR new.raw_user_meta_data->>'role' = 'negocio') THEN
    INSERT INTO public.establishments (
      owner_id, 
      nombre, 
      tipo, 
      direccion, 
      telefono, 
      whatsapp,
      image -- Imagen por defecto
    )
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'business_name', 'Nuevo Establecimiento'),
      new.raw_user_meta_data->>'role',
      new.raw_user_meta_data->>'address',
      new.raw_user_meta_data->>'phone',
      new.raw_user_meta_data->>'whatsapp',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800'
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
