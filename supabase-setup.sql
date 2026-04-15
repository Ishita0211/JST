-- JALSETU DATABASE SETUP
-- RUN THIS IN THE SUPABASE SQL EDITOR

-- 1. Create Profiles Table (Stores roles and names)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('customer', 'vendor', 'admin')) DEFAULT 'customer',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Orders Table (The "Uber" Logic)
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id),
  vendor_id UUID REFERENCES auth.users(id),
  quantity INTEGER CHECK (quantity IN (10, 20, 40)),
  floor INTEGER DEFAULT 1,
  total_price DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Realtime (Crucial for the "Uber" experience)
-- This allows the app to listen for new orders and status updates instantly
alter publication supabase_realtime add table orders;

-- 4. Automated Profile Creation
-- This function runs every time a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function above
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Basic Security Policies (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
-- Allow all authenticated users to create orders
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
-- Allow vendors and customers to see orders they are involved in
CREATE POLICY "Users can view involved orders" ON orders FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = vendor_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vendor'));
