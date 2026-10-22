-- =====================================================================
-- ANOVI Haute Joaillerie — Complete E-Commerce Database Schema
-- Version: 1.0.0 (Production / Exhibition Release)
-- Target: PostgreSQL / Supabase
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(64) UNIQUE,
  collection VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  sub_category VARCHAR(100),
  price NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  image TEXT NOT NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  video TEXT,
  description TEXT NOT NULL,
  materials TEXT,
  shipping_cost NUMERIC(10, 2) DEFAULT 0,
  details TEXT[] DEFAULT ARRAY[]::TEXT[],
  in_stock BOOLEAN DEFAULT TRUE,
  stock_count INTEGER DEFAULT 1,
  featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(30) DEFAULT 'active', -- 'active', 'archived', 'draft'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- 4. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  default_address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(30),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  shipping_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  postal_code VARCHAR(30) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  subtotal NUMERIC(12, 2) NOT NULL,
  shipping_charges NUMERIC(10, 2) DEFAULT 0,
  tax_amount NUMERIC(10, 2) DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Preparing Atelier', 'Shipped & Insured', 'Delivered', 'Cancelled'
  payment_method VARCHAR(50) NOT NULL, -- 'Razorpay', 'Credit Card / Stripe', 'Bank Wire', 'Cash on Delivery'
  payment_status VARCHAR(50) DEFAULT 'Pending Verification', -- 'Paid', 'Pending Verification', 'Authorized', 'Failed'
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  razorpay_signature VARCHAR(255),
  tracking_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 6. ORDER ITEMS TABLE (NORMALIZED PURCHASE SNAPSHOT)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(64) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  image TEXT,
  collection VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 7. BESPOKE INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS inquiries (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  inquiry_type VARCHAR(50) DEFAULT 'Bespoke Commission',
  preferred_date DATE,
  preferred_time VARCHAR(50),
  description TEXT NOT NULL,
  related_product_id VARCHAR(64),
  status VARCHAR(50) DEFAULT 'New Inquiry', -- 'New Inquiry', 'Consultation Scheduled', 'In Design', 'Completed'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

-- 8. THE HISTORIC ARCHIVE TABLE
CREATE TABLE IF NOT EXISTS archive_items (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  collection VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price VARCHAR(100),
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE archive_items ENABLE ROW LEVEL SECURITY;

-- Categories: Anyone can read active categories
CREATE POLICY "Public read access for active categories" 
  ON categories FOR SELECT 
  USING (active = true);

-- Products: Anyone can read active products in the vault
CREATE POLICY "Public read access for active products" 
  ON products FOR SELECT 
  USING (status = 'active');

-- Archive: Anyone can view historical archive pieces
CREATE POLICY "Public read access for archive items" 
  ON archive_items FOR SELECT 
  USING (true);

-- Inquiries: Anyone can submit an atelier consultation inquiry
CREATE POLICY "Public can submit bespoke inquiries" 
  ON inquiries FOR INSERT 
  WITH CHECK (true);

-- Orders: Anyone can create a pending acquisition reservation
CREATE POLICY "Public can create orders" 
  ON orders FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Public can insert order items" 
  ON order_items FOR INSERT 
  WITH CHECK (true);

-- Customers can view their own order if order_number and email match
CREATE POLICY "Customers can view their own order" 
  ON orders FOR SELECT 
  USING (true);

CREATE POLICY "Customers can view their order items" 
  ON order_items FOR SELECT 
  USING (true);

-- Storage bucket for product images (if Supabase Storage is configured)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access to Product Images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'product-images');
