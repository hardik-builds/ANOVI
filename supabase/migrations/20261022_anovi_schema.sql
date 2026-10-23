-- =====================================================================
-- ANOVI Haute Joaillerie — Complete E-Commerce Database Schema
-- Version: 2.0.0 (Luxury Pillar & Dynamic Archive Release)
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
  gender VARCHAR(20) DEFAULT 'Women',
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
  is_archived BOOLEAN DEFAULT FALSE,
  archive_story TEXT,
  status VARCHAR(30) DEFAULT 'active', -- 'active', 'archived', 'draft'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sub_category ON products(sub_category);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_is_archived ON products(is_archived);
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
  status VARCHAR(50) DEFAULT 'Pending',
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'Pending Verification',
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

-- 6. ORDER ITEMS TABLE
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
  status VARCHAR(50) DEFAULT 'New Inquiry',
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
  sub_category VARCHAR(100),
  gender VARCHAR(20) DEFAULT 'Women',
  price VARCHAR(100),
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  archive_story TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE archive_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for active categories" 
  ON categories FOR SELECT USING (active = true);

CREATE POLICY "Public read access for products" 
  ON products FOR SELECT USING (true);

CREATE POLICY "Public read access for archive items" 
  ON archive_items FOR SELECT USING (true);

CREATE POLICY "Public can submit bespoke inquiries" 
  ON inquiries FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can create orders" 
  ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can insert order items" 
  ON order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Customers can view their own order" 
  ON orders FOR SELECT USING (true);

CREATE POLICY "Customers can view their order items" 
  ON order_items FOR SELECT USING (true);

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access to Product Images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'product-images');

-- =====================================================================
-- 10. SEED DATA (INITIAL HAUTE JOAILLERIE CATALOG)
-- =====================================================================
INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Stones', 'stones', 'Precious gemstones, labgrown minerals and semi-precious masterworks', 1),
  ('Diamonds', 'diamonds', 'Natural brilliance, cultivated labgrown solitaires and refractive zircon cuts', 2),
  ('Pearls', 'pearls', 'Imperial South-Sea, Japanese-Akoya, Tahitian and fresh water cultured pearls', 3)
ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  'sov-1',
  'The Emerald Sovereign Pearl Collar',
  'Sovereign',
  'Pearls',
  'South-Sea',
  'Women',
  18400,
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200',
  ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=1200'],
  'An imperial double-strand of lustrous Akoya pearls crowned with an archival floral medallion. Centered around a luminous natural cabochon emerald encased in rose-cut diamond lotus petals, culminating in three suspended South Sea teardrop pearls.',
  '18k White Gold, Natural Cabochon Emerald (4.8ct), Akoya & South Sea Pearls, 2.15ct Rose-Cut Diamonds',
  120,
  ARRAY['Hand-matched double-strand Akoya cultured pearls with mirror luster','Rare Colombian cabochon emerald center stone with deep verdant glow','Artisan openwork floral halo set with rose-cut and brilliant diamonds','Trio of detachable South Sea teardrop pearl drops with diamond articulated caps'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  '1',
  'Ethereal Pearl Drops',
  'L''Aurore',
  'Pearls',
  'South-Sea',
  'Women',
  4200,
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200'],
  'Hand-selected South Sea pearls suspended from 18k white gold and pavé diamonds.',
  '18k White Gold, South Sea Pearls, 0.45ct Pavé Diamonds',
  50,
  ARRAY['Hand-selected 12mm South Sea pearls','G-H color, VS clarity diamonds','Signature ANOVI hallmark','Handcrafted in our London atelier'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  '9',
  'Akoya Moonlight Studs',
  'L''Aurore',
  'Pearls',
  'Japanese-Akoya',
  'Women',
  1800,
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&q=80&w=1200'],
  'Classic 8mm Akoya pearls with exceptional luster, set in 18k white gold.',
  '8mm Akoya Pearls, 18k White Gold',
  30,
  ARRAY['AAA quality Akoya pearls','Mirror-like luster','18k white gold posts','Elegant minimalist design'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  '10',
  'Tahitian Night Pendant',
  'Nocturne',
  'Pearls',
  'Tahitian',
  'Women',
  3500,
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200'],
  'A single, dark Tahitian pearl with peacock overtones, suspended from a diamond-set bail.',
  '11mm Tahitian Pearl, 18k White Gold, 0.15ct Diamonds',
  45,
  ARRAY['Naturally dark Tahitian pearl','Peacock green overtones','Brilliant-cut diamond bail','18-inch white gold chain'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  '11',
  'Fresh Water Blossom Necklace',
  'Heritage',
  'Pearls',
  'Fresh Water Pearls',
  'Women',
  1200,
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200'],
  'A delicate strand of hand-knotted fresh water pearls with a floral gold clasp.',
  'Fresh Water Pearls, 14k Yellow Gold',
  25,
  ARRAY['Hand-knotted silk thread','Lustrous fresh water pearls','Floral motif 14k gold clasp','Timeless bridal accessory'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  'snw-3',
  'Étoile Polaire Diamond Snowflakes',
  'Lumière',
  'Diamonds',
  'Natural',
  'Women',
  9800,
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200',
  ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=1200'],
  'A pair of sculptural floral snowflake stud earrings radiating celestial brilliance. Each piece features a central brilliant-cut solitaire diamond surrounded by eight delicate petals of prong-set round diamonds in two-tone white and yellow gold.',
  '18k Two-Tone Gold, 3.60ct F/VVS Brilliant-Cut Diamonds',
  60,
  ARRAY['Handcrafted eight-point celestial snowflake motif with scalloped depth','Precision-matched F color, VVS clarity round brilliant diamonds','Two-tone 18k gold setting optimizing diamond fire and warm golden undertones','Secure screw-back atelier posts for high jewelry comfort'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  'byz-5',
  'Aurelia Byzantine Filigree Cuff',
  'Heritage',
  'Diamonds',
  'Natural',
  'Women',
  16800,
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200',
  ARRAY['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=1200'],
  'A masterwork of historical goldsmithing, this wide 22k yellow gold hinged bangle features dual milgrain beaded borders, twisted cord filigree, and a continuous openwork floral vine set with diamond-encrusted flower clusters and square station centerpieces.',
  '22k Yellow Gold, Black Rhodium Accents, 2.85ct Brilliant-Cut Diamonds',
  100,
  ARRAY['Hand-chiseled 22k gold with granular beaded milgrain rims','Botanical vine motif with black rhodium-dipped diamond settings for antique contrast','Concealed pressure clasp with dual safety catches','Over 120 hours of individual goldsmith artisan engraving'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  '5',
  'Lumière Diamond Choker',
  'Lumière',
  'Diamonds',
  'Natural',
  'Women',
  24000,
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200'],
  'A breathtaking arrangement of pear-shaped diamonds totaling 12 carats.',
  'Platinum, 12ct Pear-Shaped Diamonds',
  150,
  ARRAY['GIA certified pear-shaped diamonds','Platinum setting for maximum brilliance','Adjustable length for perfect fit','Comes with a certificate of authenticity'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  '3',
  'Solstice Diamond Solitaire',
  'Lumière',
  'Diamonds',
  'Natural',
  'Women',
  12000,
  'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200'],
  'Two-carat total weight GIA certified diamonds in our signature minimalist setting.',
  '18k White Gold, 2.0ct GIA Diamond',
  80,
  ARRAY['GIA certified center diamond','Excellent cut, symmetry, and polish','Minimalist four-prong setting','Complimentary resizing included'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  '8',
  'Infinity Diamond Cuff',
  'Nocturne',
  'Diamonds',
  'Natural',
  'Women',
  18000,
  'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200'],
  'A sculptural masterpiece featuring interlaced bands of white gold and diamonds.',
  '18k White Gold, 5.0ct Diamonds',
  120,
  ARRAY['Interlaced infinity design','5 carats of brilliant-cut diamonds','Secure double-lock clasp','Statement piece for any occasion'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  '15',
  'Silver Link Chain',
  'Heritage',
  'Diamonds',
  'Natural',
  'Men',
  580,
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200'],
  'A substantial sterling silver link chain with subtle diamond-set clasp accents.',
  '925 Sterling Silver, Natural Diamond Accent',
  15,
  ARRAY['925 Sterling Silver hallmark','High-polish finish with diamond-accented toggle','Toggle clasp','Handcrafted in our London atelier'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  '12',
  'Sterling Silver Ribbed Bangle',
  'Heritage',
  'Diamonds',
  'Natural',
  'Men',
  850,
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200'],
  'A bold, sculptural bangle in high-polish sterling silver with an inset flush-set diamond.',
  '925 Sterling Silver, Natural Brilliant Diamond',
  20,
  ARRAY['925 Sterling Silver hallmark','Hand-finished ribbed architectural texture','Flush-mounted diamond signature hallmark','Modern architectural masculine style'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  'ovl-4',
  'Lumière Oval Diamond Solitaires',
  'Lumière',
  'Diamonds',
  'Labgrown',
  'Women',
  14200,
  'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=1200',
  ARRAY['https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200'],
  'Timeless oval-cut diamond solitaire stud earrings of breathtaking clarity and proportions. Set in minimalist four-prong platinum baskets designed to capture and amplify maximum natural light from every perspective.',
  '950 Platinum, 4.02ct Total Weight Oval-Cut Labgrown Diamonds (D-E / VS1)',
  90,
  ARRAY['Matched pair of 2.01ct certified oval brilliant labgrown diamonds','Minimalist low-profile four-prong platinum settings','Hand-finished in Mayfair atelier with signature ANOVI hallmark','Exceptional symmetry with brilliant fire and ice dispersion'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  '19',
  'Glimmering Tennis Bracelet',
  'Lumière',
  'Diamonds',
  'Labgrown',
  'Women',
  3800,
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200'],
  'A continuous line of brilliant labgrown stones, creating a never-ending shimmer on the wrist.',
  '18k White Gold, Brilliant-Cut Labgrown Diamonds',
  40,
  ARRAY['Secure box clasp with safety latch','18k white gold setting','Modern classic','Handcrafted in our London atelier'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  '16',
  'Starlight Brilliance Studs',
  'Lumière',
  'Diamonds',
  'Zircon',
  'Women',
  1200,
  'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=1200'],
  'Brilliant-cut zircon stones set in 18k white gold, radiating a celestial celestial fire.',
  '18k White Gold, Brilliant-Cut High-Refractive Zircon',
  25,
  ARRAY['High-dispersion optical brilliance','18k white gold posts','Elegant minimalist design','Handcrafted in our London atelier'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  '18',
  'Radiant Halo Necklace',
  'Lumière',
  'Diamonds',
  'Zircon',
  'Women',
  2500,
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200'],
  'A stunning halo pendant with a central brilliant zircon stone surrounded by a circle of light.',
  '18k White Gold, Brilliant-Cut Zircon Gems',
  30,
  ARRAY['Halo setting for maximum sparkle','18k white gold chain','Timeless elegance','Handcrafted in our London atelier'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  '13',
  'Lunar Silver Drops',
  'Heritage',
  'Diamonds',
  'Zircon',
  'Women',
  450,
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200'],
  'Cascading sterling silver discs adorned with sparkling zircon stars reflecting the moon.',
  '925 Sterling Silver, Natural White Zircons',
  15,
  ARRAY['925 Sterling Silver','High-polish finish','Lightweight design','Handcrafted in our London atelier'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  '6',
  'Seraphina Emerald Pendant',
  'L''Aurore',
  'Stones',
  'Gemstones',
  'Women',
  15500,
  'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200'],
  'A deep green Zambian emerald surrounded by a halo of micro-pavé diamonds.',
  '18k Yellow Gold, 4.5ct Zambian Emerald, 0.8ct Diamonds',
  100,
  ARRAY['Vivid green Zambian emerald','Classic halo design','18-inch 18k yellow gold chain','Signature emerald cut'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  '7',
  'Eternal Ruby Band',
  'Heritage',
  'Stones',
  'Gemstones',
  'Women',
  6200,
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200'],
  'A continuous line of pigeon-blood rubies set in 18k rose gold.',
  '18k Rose Gold, 2.5ct Pigeon-Blood Rubies',
  60,
  ARRAY['Natural pigeon-blood rubies','Eternity band style','Hand-engraved side details','Symbol of eternal love'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  '2',
  'Celestial Sapphire Hoops',
  'Nocturne',
  'Stones',
  'Gemstones',
  'Women',
  8500,
  'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200'],
  'Deep blue Ceylon sapphires set in a continuous circle of brilliant-cut diamonds.',
  '18k White Gold, 3.2ct Ceylon Sapphires, 1.1ct Diamonds',
  75,
  ARRAY['Ethically sourced Ceylon sapphires','Continuous pavé setting','Internal hinge for seamless look','Available in limited quantities'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  '17',
  'The Azure Singularity',
  'One-of-a-Kind',
  'Stones',
  'Gemstones',
  'Women',
  45000,
  'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=1200'],
  'A rare, deep blue sapphire of exceptional size and clarity, set in a unique platinum mounting.',
  'Platinum, 8.5ct Deep Blue Sapphire, 1.2ct Diamonds',
  250,
  ARRAY['One-of-a-kind piece','GIA certified sapphire','Platinum setting','Handcrafted in our London atelier'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  'lab-1',
  'L''Aurore Labgrown Paraiba Ring',
  'L''Aurore',
  'Stones',
  'Labgrown',
  'Women',
  7800,
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200',
  ARRAY['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=1200'],
  'An extraordinary neon-electric labgrown Paraiba tourmaline encased in pavé lab-cultivated diamonds and 18k white gold.',
  '18k White Gold, 3.8ct Labgrown Paraiba Tourmaline, 1.2ct Labgrown Diamonds',
  60,
  ARRAY['Ethically synthesized neon cyan-blue tourmaline crystal','Precision-faceted cushion cut with electric fire','Signature ANOVI hallmark','Eco-conscious certified haute joaillerie'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  'fnd-2',
  'Foundation Crimson Radiance Demi-Parure',
  'Heritage',
  'Stones',
  'Semi precious',
  'Women',
  21500,
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200',
  ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200'],
  'A multi-strand woven seed pearl collar anchoring a radiant cushion-cut vivid red tourmaline pendant. Encircled by a halo of brilliant pavé and geometric triangle baguettes with an Akoya baroque pearl drop, accompanied by matching floral ruby ear studs.',
  '18k Rose Gold, Vivid Cushion-Cut Rubellite / Tourmaline (5.2ct), Natural Seed Pearls, 3.4ct Diamonds',
  150,
  ARRAY['Multi-strand hand-strung natural seed pearl choker necklace','Pendant centered with a vivid cushion-cut gemstone with fiery crimson depth','Geometric starburst diamond halo with tapered baguette facets','Includes matching pair of floral halo ear clips for an opulent suite'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  '4',
  'Aurelia Gold Cascades',
  'Heritage',
  'Stones',
  'Semi precious',
  'Women',
  3800,
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=1200'],
  'Fluid 22k yellow gold links accented with carved smoky quartz drops that catch the light with every movement.',
  '22k Yellow Gold, Natural Smoky Quartz',
  40,
  ARRAY['High-polish 22k gold finish','Hand-faceted smoky quartz drops','Lightweight for all-day comfort','Inspired by ancient Roman metalwork'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO products (id, name, collection, category, sub_category, gender, price, image, images, description, materials, shipping_cost, details, in_stock, stock_count, featured, is_archived, status)
VALUES (
  '14',
  'Silver Serpent Ring',
  'Nocturne',
  'Stones',
  'Semi precious',
  'Men',
  320,
  'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=1200'],
  'A coiled serpent ring in oxidized sterling silver with semi-precious tsavorite garnet eyes.',
  'Oxidized Sterling Silver, Semi-Precious Tsavorite Garnets',
  10,
  ARRAY['Oxidized finish for vintage look','Hand-carved scale details','Adjustable masculine fit','Signature Nocturne collection piece'],
  true,
  1,
  false,
  false,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  details = EXCLUDED.details,
  in_stock = EXCLUDED.in_stock,
  is_archived = EXCLUDED.is_archived,
  updated_at = NOW();

INSERT INTO archive_items (id, name, collection, category, sub_category, gender, price, image, description, archive_story)
VALUES (
  'a1',
  'Vintage Rose Quartz Amulet',
  'Heritage Archive',
  'Stones',
  'Semi precious',
  'Women',
  '$2,800 (Original Price)',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800',
  'A rare rose quartz cabochon set in hand-engraved 18k rose gold. Circa 2018.',
  'Commissioned in our Mayfair atelier, this piece celebrated the golden dawn of modern romanticism.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  description = EXCLUDED.description,
  archive_story = EXCLUDED.archive_story;

INSERT INTO archive_items (id, name, collection, category, sub_category, gender, price, image, description, archive_story)
VALUES (
  'a2',
  'Midnight Onyx Signet',
  'Nocturne Archive',
  'Stones',
  'Semi precious',
  'Men',
  '$3,500 (Original Price)',
  'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=800',
  'A bold onyx statement ring with hidden diamond details. Circa 2019.',
  'Carved from deep Black Sea onyx, this signet embodied masculine quiet luxury.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  description = EXCLUDED.description,
  archive_story = EXCLUDED.archive_story;

INSERT INTO archive_items (id, name, collection, category, sub_category, gender, price, image, description, archive_story)
VALUES (
  'a3',
  'Starlight Silver Bangle',
  'Lumière Archive',
  'Diamonds',
  'Zircon',
  'Women',
  '$1,200 (Original Price)',
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
  'Hammered sterling silver with embedded moissanite stars. Circa 2017.',
  'An early experiment in celestial texture, handcrafted with raw lunar silver.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  description = EXCLUDED.description,
  archive_story = EXCLUDED.archive_story;

INSERT INTO archive_items (id, name, collection, category, sub_category, gender, price, image, description, archive_story)
VALUES (
  'a4',
  'Gilded Leaf Ear-Climbers',
  'Heritage Archive',
  'Stones',
  'Semi precious',
  'Women',
  '$2,100 (Original Price)',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
  'Intricate 22k gold leaf patterns that gracefully follow the ear''s curve. Circa 2020.',
  'Inspired by the botanical courtyards of Place Vendôme during autumn.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  collection = EXCLUDED.collection,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  gender = EXCLUDED.gender,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  description = EXCLUDED.description,
  archive_story = EXCLUDED.archive_story;

