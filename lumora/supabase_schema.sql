-- LUMORA MASTER SCHEMA - SUPABASE/POSTGRES
-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- ENABLE UUID EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  category TEXT,
  collection TEXT,
  materials JSONB, 
  purity TEXT,
  stones JSONB, 
  status TEXT DEFAULT 'Draft', 
  price DECIMAL(15,2),
  cost_price DECIMAL(15,2),
  images JSONB DEFAULT '[]',
  stock_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PRODUCTION JOBS
CREATE TABLE IF NOT EXISTS production_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT,
  product_name TEXT NOT NULL,
  product_image TEXT,
  status TEXT DEFAULT 'Live', 
  steps JSONB DEFAULT '[]', 
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  tier TEXT DEFAULT 'Silver',
  total_spend DECIMAL(15,2) DEFAULT 0,
  preferences JSONB DEFAULT '[]',
  last_purchase_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. FINANCE LEDGER
CREATE TABLE IF NOT EXISTS ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE DEFAULT CURRENT_DATE,
  type TEXT NOT NULL, 
  category TEXT, 
  amount DECIMAL(15,2) NOT NULL,
  note TEXT,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. BESPOKE ORDERS
CREATE TABLE IF NOT EXISTS bespoke_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  design_brief TEXT,
  sketches JSONB DEFAULT '[]',
  status TEXT DEFAULT 'Lead',
  budget_range TEXT,
  timeline_est TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. RESELLERS
CREATE TABLE IF NOT EXISTS resellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  store_name TEXT,
  region TEXT,
  performance_score DECIMAL(3,2),
  partner_inventory JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. REPAIR JOBS
CREATE TABLE IF NOT EXISTS repair_jobs (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  item_description TEXT NOT NULL,
  repair_details TEXT NOT NULL,
  cost_estimate DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'Received', 
  assigned_craftsman_id TEXT,
  assigned_craftsman_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES (Basic - allow all for now, refine later)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE bespoke_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE resellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read" ON production_jobs FOR SELECT USING (true);
CREATE POLICY "Public Read" ON customers FOR SELECT USING (true);
CREATE POLICY "Public Read" ON ledger FOR SELECT USING (true);
CREATE POLICY "Public Read" ON bespoke_orders FOR SELECT USING (true);
CREATE POLICY "Public Read" ON resellers FOR SELECT USING (true);
CREATE POLICY "Public Read" ON repair_jobs FOR SELECT USING (true);

-- Add write policies as needed
CREATE POLICY "Full Access" ON products FOR ALL USING (true);
CREATE POLICY "Full Access" ON production_jobs FOR ALL USING (true);
CREATE POLICY "Full Access" ON customers FOR ALL USING (true);
CREATE POLICY "Full Access" ON ledger FOR ALL USING (true);
CREATE POLICY "Full Access" ON bespoke_orders FOR ALL USING (true);
CREATE POLICY "Full Access" ON resellers FOR ALL USING (true);
CREATE POLICY "Full Access" ON repair_jobs FOR ALL USING (true);
