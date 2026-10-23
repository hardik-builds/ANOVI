import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================================
// 1. MIDDLEWARE (Capture raw body for Razorpay Webhook Verification)
// =====================================================================
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// CORS headers for development flexibility
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key, x-razorpay-signature');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// =====================================================================
// 2. DATA STORAGE INITIALIZATION (HYBRID SUPABASE + DURABLE CACHE)
// =====================================================================
const DATA_DIR = path.join(__dirname, 'src', 'data');
const INITIAL_DATA_FILE = path.join(DATA_DIR, 'initialData.json');
const PERSISTENT_STORE_FILE = path.join(DATA_DIR, 'serverStore.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load baseline seed data
let seedData = { JEWELRY_ITEMS: [], ARCHIVE_ITEMS: [], BESPOKE_ITEMS: [] };
try {
  if (fs.existsSync(INITIAL_DATA_FILE)) {
    seedData = JSON.parse(fs.readFileSync(INITIAL_DATA_FILE, 'utf8'));
  }
} catch (e) {
  console.warn('Could not read initialData.json:', e.message);
}

// Load or initialize local server store
let serverStore = {
  products: seedData.JEWELRY_ITEMS || [],
  archive: seedData.ARCHIVE_ITEMS || [],
  orders: [],
  inquiries: [],
  settings: {
    announcementBarEnabled: true,
    announcementText: 'Complimentary Insured White-Glove Delivery on all commissions across Europe, US & India',
    brandPhilosophyTitle: 'Crafted for the Timeless Soul',
    contactEmail: 'concierge@anovi-jewels.com',
    contactPhone: '+44 (0) 20 7946 0912',
    atelierLocation: 'Mayfair, London & Place Vendôme, Paris',
    enableInternationalShipping: true,
    freeShippingThreshold: 5000,
  }
};

try {
  if (fs.existsSync(PERSISTENT_STORE_FILE)) {
    const existing = JSON.parse(fs.readFileSync(PERSISTENT_STORE_FILE, 'utf8'));
    serverStore = {
      ...serverStore,
      ...existing,
      // Ensure products array is never empty
      products: (existing.products && existing.products.length > 0) ? existing.products : serverStore.products,
    };
  } else {
    fs.writeFileSync(PERSISTENT_STORE_FILE, JSON.stringify(serverStore, null, 2));
  }
} catch (e) {
  console.warn('Could not read persistent store, using in-memory baseline:', e.message);
}

function saveStoreLocally() {
  try {
    fs.writeFileSync(PERSISTENT_STORE_FILE, JSON.stringify(serverStore, null, 2));
  } catch (err) {
    console.error('Failed to write to persistent store file:', err.message);
  }
}

// =====================================================================
// 3. SUPABASE CLIENT SETUP
// =====================================================================
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = () => {
  return (
    SUPABASE_URL.startsWith('https://') &&
    !SUPABASE_URL.includes('vklqfbmrtyuzxjwkmnop') && // skip invalid placeholder
    SUPABASE_KEY.length > 20
  );
};

let supabase = null;
let supabaseHealthy = false;

if (isSupabaseConfigured()) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
    // Test connectivity
    supabase.from('products').select('id', { count: 'exact', head: true })
      .then(({ error }) => {
        if (!error) {
          supabaseHealthy = true;
          console.log('✓ Successfully connected to live Supabase database.');
        } else {
          console.warn('! Supabase query returned error:', error.message);
        }
      })
      .catch((err) => {
        console.warn('! Supabase connection error:', err.message);
      });
  } catch (err) {
    console.warn('! Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ Supabase not configured or using placeholder credentials. Operating in resilient local persistent store mode.');
}

// =====================================================================
// 4. RAZORPAY HELPERS
// =====================================================================
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

const isRazorpayConfigured = () => {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) return false;
  if (RAZORPAY_KEY_ID.includes('YOUR_KEY_ID') || RAZORPAY_KEY_ID.includes('ANOVIJewelsLive102')) return false;
  return (RAZORPAY_KEY_ID.startsWith('rzp_test_') || RAZORPAY_KEY_ID.startsWith('rzp_live_'));
};

// =====================================================================
// 5. PUBLIC & SYSTEM API ENDPOINTS
// =====================================================================

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: {
      type: supabaseHealthy ? 'Supabase PostgreSQL' : 'Resilient File Cache',
      connected: supabaseHealthy,
    },
    paymentGateway: {
      provider: 'Razorpay',
      configured: isRazorpayConfigured(),
      keyIdPublic: isRazorpayConfigured() ? RAZORPAY_KEY_ID : null,
      mode: RAZORPAY_KEY_ID.startsWith('rzp_live_') ? 'live' : 'test',
    },
    version: '1.0.0-exhibition'
  });
});

// Safe frontend config (Never leaks secrets)
app.get('/api/config', (_req, res) => {
  res.json({
    razorpayKeyId: isRazorpayConfigured() ? RAZORPAY_KEY_ID : '',
    razorpayConfigured: isRazorpayConfigured(),
    supabaseConnected: supabaseHealthy,
    currency: 'USD',
    shipping: {
      freeShippingThreshold: serverStore.settings.freeShippingThreshold || 5000,
      internationalEnabled: true,
    }
  });
});

// =====================================================================
// 6. PRODUCT CATALOG API
// =====================================================================

// Get all products
app.get('/api/products', async (_req, res) => {
  try {
    if (supabaseHealthy && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Map database fields to frontend structure
        const mapped = data.map(item => ({
          id: item.id,
          name: item.name,
          collection: item.collection,
          category: item.category,
          gemType: item.gem_type || null,
          subCategory: item.sub_category,
          gender: item.gender || 'Women',
          price: typeof item.price === 'number' ? `$${item.price.toLocaleString()}` : item.price,
          image: item.image,
          images: item.images || [item.image],
          video: item.video,
          description: item.description,
          materials: item.materials,
          shippingCost: item.shipping_cost ? `$${item.shipping_cost}` : '$0',
          details: item.details || [],
          inStock: item.in_stock,
          stockCount: item.stock_count,
          featured: item.featured,
          isArchived: item.is_archived || false,
          archiveStory: item.archive_story,
          createdAt: item.created_at,
        }));
        return res.json(mapped);
      }
    }
  } catch (err) {
    console.warn('Supabase product query failed, serving cache:', err.message);
  }

  // Resilient fallback
  res.json(serverStore.products);
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (supabaseHealthy && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return res.json({
          id: data.id,
          name: data.name,
          collection: data.collection,
          category: data.category,
          subCategory: data.sub_category,
          gender: data.gender || 'Women',
          price: typeof data.price === 'number' ? `$${data.price.toLocaleString()}` : data.price,
          image: data.image,
          images: data.images || [data.image],
          video: data.video,
          description: data.description,
          materials: data.materials,
          shippingCost: data.shipping_cost ? `$${data.shipping_cost}` : '$0',
          details: data.details || [],
          inStock: data.in_stock,
          stockCount: data.stock_count,
          featured: data.featured,
          isArchived: data.is_archived || false,
          archiveStory: data.archive_story,
          createdAt: data.created_at,
        });
      }
    }
  } catch (err) {
    console.warn(`Product query error for ${id}:`, err.message);
  }

  const found = serverStore.products.find(p => p.id === id);
  if (!found) {
    return res.status(404).json({ error: 'Jewelry piece not found' });
  }
  res.json(found);
});

// Create product (Admin)
app.post('/api/products', async (req, res) => {
  const productData = req.body;
  if (!productData.name || !productData.price) {
    return res.status(400).json({ error: 'Product name and price are required.' });
  }

  const newProduct = {
    ...productData,
    id: productData.id || `anov_${Date.now()}`,
    inStock: productData.inStock ?? true,
    stockCount: productData.stockCount ?? 1,
    createdAt: new Date().toISOString(),
  };

  serverStore.products.unshift(newProduct);
  saveStoreLocally();

  // Async persist to Supabase if available
  if (supabaseHealthy && supabase) {
    const numericPrice = parseFloat(String(newProduct.price).replace(/[^0-9.]/g, '')) || 0;
    supabase.from('products').insert({
      id: newProduct.id,
      name: newProduct.name,
      collection: newProduct.collection || 'High Jewelry',
      category: newProduct.category || 'Jewelry',
      gem_type: newProduct.gemType || null,
      sub_category: newProduct.subCategory || null,
      gender: newProduct.gender || 'Women',
      price: numericPrice,
      image: newProduct.image,
      images: newProduct.images || [newProduct.image],
      description: newProduct.description || '',
      materials: newProduct.materials || null,
      details: newProduct.details || [],
      in_stock: newProduct.inStock,
      stock_count: newProduct.stockCount,
      featured: Boolean(newProduct.featured),
      is_archived: Boolean(newProduct.isArchived),
      archive_story: newProduct.archiveStory || null,
    }).catch(e => console.warn('Supabase product insert error:', e.message));
  }

  res.status(201).json(newProduct);
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const index = serverStore.products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  serverStore.products[index] = {
    ...serverStore.products[index],
    ...req.body,
    id // preserve immutable ID
  };
  saveStoreLocally();

  if (supabaseHealthy && supabase) {
    const numericPrice = req.body.price 
      ? parseFloat(String(req.body.price).replace(/[^0-9.]/g, '')) 
      : undefined;

    supabase.from('products').update({
      name: req.body.name,
      collection: req.body.collection,
      category: req.body.category,
      sub_category: req.body.subCategory,
      gender: req.body.gender,
      price: numericPrice,
      image: req.body.image,
      images: req.body.images,
      description: req.body.description,
      materials: req.body.materials,
      in_stock: req.body.inStock,
      stock_count: req.body.stockCount,
      featured: req.body.featured,
      is_archived: req.body.isArchived,
      archive_story: req.body.archiveStory,
      updated_at: new Date().toISOString()
    }).eq('id', id).catch(e => console.warn('Supabase product update error:', e.message));
  }

  res.json(serverStore.products[index]);
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  serverStore.products = serverStore.products.filter(p => p.id !== id);
  saveStoreLocally();

  if (supabaseHealthy && supabase) {
    supabase.from('products').delete().eq('id', id).catch(e => console.warn('Supabase product delete error:', e.message));
  }
  res.json({ success: true, id });
});

// =====================================================================
// ARCHIVE ENDPOINTS (DYNAMIC SYNC WITH SUPABASE)
// =====================================================================
app.get('/api/archive', async (_req, res) => {
  try {
    if (supabaseHealthy && supabase) {
      const { data, error } = await supabase
        .from('archive_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map(item => ({
          id: item.id,
          name: item.name,
          collection: item.collection,
          category: item.category,
          gemType: item.gem_type || null,
          subCategory: item.sub_category,
          gender: item.gender || 'Women',
          price: item.price,
          image: item.image,
          description: item.description,
          archiveStory: item.archive_story || item.description,
          inStock: false,
          isArchived: true,
          createdAt: item.created_at,
        }));
        return res.json(mapped);
      }
    }
  } catch (err) {
    console.warn('Supabase archive query error:', err.message);
  }

  res.json(serverStore.archive || []);
});

app.post('/api/archive', async (req, res) => {
  const itemData = req.body;
  const newItem = {
    ...itemData,
    id: itemData.id || `arch_${Date.now()}`,
    inStock: false,
    isArchived: true,
    createdAt: new Date().toISOString(),
  };

  serverStore.archive = [newItem, ...(serverStore.archive || [])];
  saveStoreLocally();

  if (supabaseHealthy && supabase) {
    supabase.from('archive_items').insert({
      id: newItem.id,
      name: newItem.name,
      collection: newItem.collection || 'Archive',
      category: newItem.category || 'Jewelry',
      sub_category: newItem.subCategory || null,
      gender: newItem.gender || 'Women',
      price: newItem.price || null,
      image: newItem.image,
      description: newItem.description || '',
      archive_story: newItem.archiveStory || newItem.description || null,
    }).catch(e => console.warn('Supabase archive insert notice:', e.message));
  }

  res.status(201).json(newItem);
});

app.delete('/api/archive/:id', (req, res) => {
  const { id } = req.params;
  serverStore.archive = (serverStore.archive || []).filter(item => item.id !== id);
  saveStoreLocally();

  if (supabaseHealthy && supabase) {
    supabase.from('archive_items').delete().eq('id', id).catch(e => console.warn('Supabase archive delete notice:', e.message));
  }

  res.json({ success: true, id });
});

// =====================================================================
// 7. ORDER CREATION & TRUSTED PRICE RECALCULATION (SECURITY-CRITICAL)
// =====================================================================
app.post('/api/orders/create', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      country,
      postalCode,
      items,
      paymentMethod,
      currency = 'USD',
      notes = ''
    } = req.body;

    // 1. Validation
    if (!customerEmail || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid order request: customerEmail and items array are required.' });
    }

    // 2. SERVER-SIDE PRICE RECALCULATION
    // Retrieve product catalog from store or database to ensure untampered pricing
    let verifiedSubtotal = 0;
    const verifiedOrderItems = [];

    for (const item of items) {
      const catalogItem = serverStore.products.find(p => p.id === item.id);
      if (!catalogItem) {
        return res.status(400).json({ error: `Jewelry item with ID "${item.id}" is not found in the official catalog.` });
      }

      const rawPriceStr = String(catalogItem.price).replace(/[^0-9.]/g, '');
      const unitPrice = parseFloat(rawPriceStr) || 0;
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

      verifiedSubtotal += unitPrice * quantity;
      verifiedOrderItems.push({
        id: catalogItem.id,
        name: catalogItem.name,
        price: catalogItem.price,
        unitPriceNumeric: unitPrice,
        quantity,
        image: catalogItem.image,
        collection: catalogItem.collection || 'High Jewelry'
      });
    }

    const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const orderNumber = `ANOVI-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: orderId,
      orderNumber,
      customerName: customerName || 'Private Patron',
      customerEmail,
      customerPhone: customerPhone || '',
      shippingAddress: shippingAddress || 'Confidential Private Address',
      city: city || '',
      country: country || 'United States',
      postalCode: postalCode || '',
      items: verifiedOrderItems,
      subtotal: verifiedSubtotal,
      currency: currency.toUpperCase(),
      status: 'Preparing Atelier',
      trackingNumber: 'PENDING_ATELIER_DISPATCH',
      paymentMethod: paymentMethod || 'Bank Wire',
      // Strict rule: Default to 'Pending Verification'. NEVER mark 'Paid' without cryptographic verification.
      paymentStatus: 'Pending Verification',
      createdAt: new Date().toISOString(),
      notes: notes || 'Private client acquisition awaiting insured white-glove dispatch schedule.'
    };

    // 3. Razorpay Orders API Integration (If selected and credentials configured)
    let razorpayOrderId = null;
    let rzpWarning = null;

    if (paymentMethod === 'Razorpay') {
      if (isRazorpayConfigured()) {
        try {
          const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
          // Razorpay takes amount in subunits (e.g. cents/paise)
          const amountSubunits = Math.round(verifiedSubtotal * 100);

          const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              amount: amountSubunits,
              currency: newOrder.currency === 'INR' ? 'INR' : 'USD',
              receipt: orderNumber,
              notes: {
                orderId: newOrder.id,
                customerEmail: newOrder.customerEmail,
                patron: newOrder.customerName
              }
            })
          });

          if (rzpResponse.ok) {
            const rzpData = await rzpResponse.json();
            razorpayOrderId = rzpData.id;
            newOrder.razorpayOrderId = rzpData.id;
          } else {
            const errBody = await rzpResponse.text();
            console.warn('Razorpay API returned error:', rzpResponse.status, errBody);
            rzpWarning = 'Live Razorpay API call returned error. Order registered in Pending Verification mode.';
          }
        } catch (gatewayErr) {
          console.error('Razorpay API request error:', gatewayErr.message);
          rzpWarning = 'Gateway communication error. Order reserved in Pending Verification mode.';
        }
      } else {
        rzpWarning = 'Razorpay merchant credentials not configured. Order reserved in Pending Verification mode.';
      }
    }

    // 4. Save order to persistent store
    serverStore.orders.unshift(newOrder);
    saveStoreLocally();

    // 5. Asynchronously persist to Supabase if connected
    if (supabaseHealthy && supabase) {
      supabase.from('orders').insert({
        id: newOrder.id,
        order_number: newOrder.orderNumber,
        customer_name: newOrder.customerName,
        customer_email: newOrder.customerEmail,
        customer_phone: newOrder.customerPhone,
        shipping_address: newOrder.shippingAddress,
        city: newOrder.city,
        country: newOrder.country,
        postal_code: newOrder.postalCode,
        currency: newOrder.currency,
        subtotal: newOrder.subtotal,
        total_amount: newOrder.subtotal,
        payment_method: newOrder.paymentMethod,
        payment_status: newOrder.paymentStatus,
        status: newOrder.status,
        notes: newOrder.notes,
        created_at: newOrder.createdAt
      }).then(({ error }) => {
        if (error) console.warn('Supabase order insert warning:', error.message);
      }).catch(e => console.warn('Supabase order insert error:', e.message));
    }

    res.status(201).json({
      success: true,
      order: newOrder,
      razorpayOrderId,
      razorpayKeyId: isRazorpayConfigured() ? RAZORPAY_KEY_ID : null,
      amount: Math.round(verifiedSubtotal * 100),
      currency: newOrder.currency,
      warning: rzpWarning
    });
  } catch (err) {
    console.error('Order creation internal error:', err);
    res.status(500).json({ error: 'Failed to process acquisition order.' });
  }
});

// =====================================================================
// 8. PAYMENT SIGNATURE VERIFICATION (SECURITY-CRITICAL)
// =====================================================================
app.post('/api/orders/verify', async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        error: 'Incomplete verification parameters: orderId, razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.' 
      });
    }

    if (!isRazorpayConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Razorpay secret key is not configured on the production server. Cannot verify cryptographic signature.'
      });
    }

    // Cryptographic signature check: HMAC-SHA256(order_id + "|" + payment_id, secret)
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const receivedBuffer = Buffer.from(razorpay_signature, 'utf8');

    const isMatch = (expectedBuffer.length === receivedBuffer.length) &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isMatch) {
      console.warn(`! Tampered payment signature rejected for order ${orderId}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature. Verification rejected by atelier security.'
      });
    }

    // Locate order in local store
    const orderIndex = serverStore.orders.findIndex(o => o.id === orderId || o.orderNumber === orderId);
    let updatedOrder = null;

    if (orderIndex !== -1) {
      serverStore.orders[orderIndex].paymentStatus = 'Paid';
      serverStore.orders[orderIndex].razorpayPaymentId = razorpay_payment_id;
      serverStore.orders[orderIndex].notes = `Verified Razorpay payment ID: ${razorpay_payment_id}. Signature verified on ${new Date().toISOString()}`;
      updatedOrder = serverStore.orders[orderIndex];
      saveStoreLocally();
    }

    // Update in Supabase if active
    if (supabaseHealthy && supabase) {
      supabase.from('orders').update({
        payment_status: 'Paid',
        gateway_payment_reference: razorpay_payment_id,
        updated_at: new Date().toISOString()
      }).eq('id', orderId).catch(e => console.warn('Supabase order status update error:', e.message));
    }

    res.json({
      success: true,
      message: 'Cryptographic signature verified successfully. Order marked as Paid.',
      order: updatedOrder
    });
  } catch (err) {
    console.error('Signature verification error:', err);
    res.status(500).json({ success: false, error: 'Internal error during payment verification.' });
  }
});

// =====================================================================
// 9. RAZORPAY WEBHOOK HANDLER
// =====================================================================
app.post('/api/webhooks/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = RAZORPAY_WEBHOOK_SECRET || RAZORPAY_KEY_SECRET;

    if (!secret || !signature || !req.rawBody) {
      return res.status(400).json({ error: 'Webhook signature verification missing.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(req.rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const receivedBuffer = Buffer.from(String(signature), 'utf8');

    const isMatch = (expectedBuffer.length === receivedBuffer.length) &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isMatch) {
      console.warn('! Unauthorized Razorpay webhook signature');
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }

    const event = req.body;
    console.log(`✓ Received verified Razorpay webhook event: ${event.event}`);

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (rzpOrderId) {
        const order = serverStore.orders.find(o => o.razorpayOrderId === rzpOrderId);
        if (order) {
          order.paymentStatus = 'Paid';
          order.razorpayPaymentId = paymentId;
          saveStoreLocally();
          console.log(`✓ Webhook updated order ${order.orderNumber} to Paid.`);
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed.' });
  }
});

// =====================================================================
// 10. BESPOKE INQUIRIES API
// =====================================================================
app.get('/api/inquiries', (_req, res) => {
  res.json(serverStore.inquiries);
});

app.post('/api/inquiries', async (req, res) => {
  const { name, email, preferredDate, preferredTime, description, phone } = req.body;

  if (!name || !email || !description) {
    return res.status(400).json({ error: 'Name, email, and bespoke project description are required.' });
  }

  const newInquiry = {
    id: `inq_${Date.now()}`,
    name,
    email,
    phone: phone || '',
    preferredDate: preferredDate || '',
    preferredTime: preferredTime || '',
    description,
    status: 'New Inquiry',
    createdAt: new Date().toISOString(),
    notes: 'Submitted via bespoke consultation portal.'
  };

  serverStore.inquiries.unshift(newInquiry);
  saveStoreLocally();

  if (supabaseHealthy && supabase) {
    supabase.from('inquiries').insert({
      id: newInquiry.id,
      customer_name: newInquiry.name,
      customer_email: newInquiry.email,
      phone: newInquiry.phone,
      preferred_date: newInquiry.preferredDate || null,
      preferred_time: newInquiry.preferredTime || null,
      message: newInquiry.description,
      status: 'New Inquiry',
      created_at: newInquiry.createdAt
    }).catch(e => console.warn('Supabase inquiry insert error:', e.message));
  }

  res.status(201).json({ success: true, inquiry: newInquiry });
});

app.patch('/api/inquiries/:id', (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const inquiry = serverStore.inquiries.find(inq => inq.id === id);
  if (!inquiry) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }

  if (status) inquiry.status = status;
  if (notes !== undefined) inquiry.notes = notes;
  saveStoreLocally();

  if (supabaseHealthy && supabase) {
    supabase.from('inquiries').update({
      status: inquiry.status,
      notes: inquiry.notes,
      updated_at: new Date().toISOString()
    }).eq('id', id).catch(e => console.warn('Supabase inquiry update error:', e.message));
  }

  res.json({ success: true, inquiry });
});

// =====================================================================
// 11. ORDERS MANAGEMENT API (ADMIN)
// =====================================================================
app.get('/api/orders', (_req, res) => {
  res.json(serverStore.orders);
});

app.patch('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status, trackingNumber, paymentStatus, notes } = req.body;

  const order = serverStore.orders.find(o => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (status) order.status = status;
  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (notes !== undefined) order.notes = notes;
  saveStoreLocally();

  if (supabaseHealthy && supabase) {
    supabase.from('orders').update({
      status: order.status,
      tracking_number: order.trackingNumber,
      payment_status: order.paymentStatus,
      notes: order.notes,
      updated_at: new Date().toISOString()
    }).eq('id', order.id).catch(e => console.warn('Supabase order update error:', e.message));
  }

  res.json({ success: true, order });
});

// =====================================================================
// 12. STATIC ASSETS & SPA ROUTING FALLBACK
// =====================================================================
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (_req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>ANOVI Haute Joaillerie</title></head>
        <body style="background:#0a0a0a; color:#fdfbf7; font-family:serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
          <div style="text-align:center; padding:2rem;">
            <h1 style="color:#D4AF37; letter-spacing:0.3em; text-transform:uppercase; font-size:1.5rem;">ANOVI Haute Joaillerie</h1>
            <p style="color:#aaa; font-size:0.9rem; margin-top:1rem;">Production API Server is Active. Build storefront with <code>npm run build</code>.</p>
          </div>
        </body>
      </html>
    `);
  }
});

// =====================================================================
// 13. START SERVER
// =====================================================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================================`);
  console.log(`ANOVI Haute Joaillerie Production Server`);
  console.log(`Port: ${PORT}`);
  console.log(`Razorpay Gateway: ${isRazorpayConfigured() ? 'CONFIGURED (' + RAZORPAY_KEY_ID + ')' : 'PENDING MERCHANT CREDENTIALS (Secure Pending Mode Active)'}`);
  console.log(`Database: ${supabaseHealthy ? 'Supabase Connected' : 'Resilient File Cache (Offline/Exhibition Safe)'}`);
  console.log(`=================================================================`);
});
