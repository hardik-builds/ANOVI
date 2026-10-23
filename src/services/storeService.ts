import { JEWELRY_ITEMS, ARCHIVE_ITEMS, BESPOKE_ITEMS } from '../constants';
import { JewelryItem, BespokeItem, Order, BespokeInquiry, WebsiteSettings, IntegrationConfig } from '../types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  PRODUCTS: 'anovi_products_v5',
  ARCHIVE: 'anovi_archive_v4',
  ORDERS: 'anovi_orders_v2',
  INQUIRIES: 'anovi_inquiries_v2',
  SETTINGS: 'anovi_settings_v2',
  INTEGRATIONS: 'anovi_integrations_v2',
  ADMIN_AUTH: 'anovi_admin_authenticated',
};

const envSupabaseUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || '';
const envSupabaseKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || '';
const envRazorpayKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_RAZORPAY_KEY_ID) || '';
const isRazorpayPlaceholder = !envRazorpayKey || envRazorpayKey.includes('YOUR_KEY_ID') || envRazorpayKey.includes('ANOVIJewelsLive102');

let activeSupabaseClient: SupabaseClient | null = null;

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  announcementBarEnabled: true,
  announcementText: 'Complimentary Insured White-Glove Delivery on all commissions across Europe, US & India',
  announcementLinkText: 'Discover Atelier Services',
  brandPhilosophyTitle: 'Crafted for the Timeless Soul',
  brandPhilosophyQuote: 'At ANOVI, we believe that jewelry is more than an accessory; it is a silent language of elegance.',
  brandPhilosophyStory: 'Our artisans spend hundreds of hours on a single pair of earrings, ensuring every facet reflects a century of perfection handcrafted in our London and Paris ateliers.',
  contactEmail: 'concierge@anovi-jewels.com',
  contactPhone: '+44 (0) 20 7946 0912',
  atelierLocation: 'Mayfair, London & Place Vendôme, Paris',
  enableInternationalShipping: true,
  freeShippingThreshold: 5000,
};

export const DEFAULT_INTEGRATION_CONFIG: IntegrationConfig = {
  supabaseUrl: envSupabaseUrl,
  supabaseAnonKey: envSupabaseKey,
  supabaseConnected: Boolean(envSupabaseUrl && envSupabaseKey && envSupabaseUrl.startsWith('https://')),
  stripePublishableKey: '',
  stripeSecretKeyConfigured: false,
  razorpayKeyId: isRazorpayPlaceholder ? '' : envRazorpayKey,
  razorpayEnabled: !isRazorpayPlaceholder,
  stripeEnabled: false,
  codEnabled: true,
  bankWireEnabled: true,
  testMode: true,
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (activeSupabaseClient) return activeSupabaseClient;

  let url = envSupabaseUrl;
  let key = envSupabaseKey;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTEGRATIONS);
    if (raw) {
      const cfg = JSON.parse(raw);
      if (cfg.supabaseUrl) url = cfg.supabaseUrl;
      if (cfg.supabaseAnonKey) key = cfg.supabaseAnonKey;
    }
  } catch (e) {
    console.warn('Could not read integration config for Supabase:', e);
  }

  if (
    url &&
    key &&
    url.startsWith('https://') &&
    !url.includes('vklqfbmrtyuzxjwkmnop') &&
    key.length > 20
  ) {
    try {
      activeSupabaseClient = createClient(url, key);
      return activeSupabaseClient;
    } catch (err) {
      console.warn('Supabase client initialization error:', err);
    }
  }

  return null;
};

export const INITIAL_SAMPLE_ORDERS: Order[] = [
  {
    id: 'ord_1',
    orderNumber: 'ANOVI-8021',
    customerName: 'Countess Victoria Sterling',
    customerEmail: 'v.sterling@kensington.co.uk',
    customerPhone: '+44 7700 900421',
    shippingAddress: '14 Belgrave Square',
    city: 'London',
    country: 'United Kingdom',
    postalCode: 'SW1X 8PS',
    items: [
      {
        id: '1',
        name: 'Ethereal Pearl Drops',
        price: '$4,200',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
        collection: "L'Aurore",
      }
    ],
    subtotal: 4200,
    currency: 'USD',
    status: 'Shipped & Insured',
    trackingNumber: 'DHL-EX-9928104821',
    paymentMethod: 'Credit Card / Stripe',
    paymentStatus: 'Pending Verification',
    createdAt: '2026-03-28T14:22:00Z',
    notes: 'Gift wrapped in royal green velvet presentation box with handwritten wax-sealed certificate.'
  },
  {
    id: 'ord_2',
    orderNumber: 'ANOVI-8022',
    customerName: 'Ananya Singhania',
    customerEmail: 'ananya.s@singhaniagroup.in',
    customerPhone: '+91 98200 44102',
    shippingAddress: 'Altamount Road, Penthouse B',
    city: 'Mumbai',
    country: 'India',
    postalCode: '400026',
    items: [
      {
        id: '2',
        name: 'Celestial Sapphire Hoops',
        price: '$8,500',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&q=80&w=800',
        collection: 'Nocturne',
      }
    ],
    subtotal: 8500,
    currency: 'INR',
    status: 'Preparing Atelier',
    trackingNumber: 'PENDING_DISPATCH',
    paymentMethod: 'Razorpay',
    paymentStatus: 'Pending Verification',
    createdAt: '2026-04-01T09:15:00Z',
    notes: 'Requested custom engraving on inside clasp: "Always A&S 2026"'
  }
];

export const INITIAL_SAMPLE_INQUIRIES: BespokeInquiry[] = [
  {
    id: 'inq_1',
    name: 'Laurent de Bourbon',
    email: 'laurent@bourbon-heritage.fr',
    preferredDate: '2026-04-20',
    preferredTime: 'afternoon',
    description: 'We wish to redesign an emerald and diamond brooch from the 1890s into a contemporary drop pendant for our daughter’s graduation. Seeking platinum mounting with pavé halo.',
    status: 'Consultation Scheduled',
    createdAt: '2026-03-30T11:00:00Z',
    notes: 'Master Artisan Jean-Paul allocated for video consultation.'
  },
  {
    id: 'inq_2',
    name: 'Devika Patel',
    email: 'devika.patel@horizonventures.com',
    preferredDate: '2026-04-25',
    preferredTime: 'morning',
    description: 'Bespoke bridal choker set featuring unheated Burmese rubies and polki uncut diamonds in 22k yellow gold filigree.',
    status: 'New Inquiry',
    createdAt: '2026-04-02T16:45:00Z',
    notes: 'Follow up with private lookbook of raw stones.'
  }
];

export const storeService = {
  getProducts(): JewelryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading products from storage:', e);
    }
    // initialize
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(JEWELRY_ITEMS));
    return JEWELRY_ITEMS;
  },

  async fetchProducts(): Promise<JewelryItem[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: JewelryItem[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            collection: item.collection,
            category: item.category,
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
          this.saveProducts(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetch products error:', err);
      }
    }

    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          this.saveProducts(data);
          return data;
        }
      }
    } catch {
      // offline / standalone
    }

    return this.getProducts();
  },

  async fetchArchiveItems(): Promise<JewelryItem[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('archive_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: JewelryItem[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            collection: item.collection,
            category: item.category,
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
          this.saveArchiveItems(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetch archive items error:', err);
      }
    }

    try {
      const response = await fetch('/api/archive');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          this.saveArchiveItems(data);
          return data;
        }
      }
    } catch {
      // offline / standalone
    }

    return this.getArchiveItems();
  },

  saveProducts(products: JewelryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products:', e);
    }
  },

  addProduct(newProduct: Omit<JewelryItem, 'id'> & { id?: string }): JewelryItem {
    const products = this.getProducts();
    const product: JewelryItem = {
      ...newProduct,
      id: newProduct.id || `anov_${Date.now()}`,
      inStock: newProduct.inStock ?? true,
      stockCount: newProduct.stockCount ?? 1,
      createdAt: new Date().toISOString(),
    };
    const updated = [product, ...products];
    this.saveProducts(updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      const numericPrice = parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0;
      Promise.resolve(supabase.from('products').insert({
        id: product.id,
        name: product.name,
        collection: product.collection,
        category: product.category,
        sub_category: product.subCategory || null,
        gender: product.gender || 'Women',
        price: numericPrice,
        image: product.image,
        images: product.images || [product.image],
        description: product.description,
        materials: product.materials || null,
        details: product.details || [],
        in_stock: product.inStock,
        stock_count: product.stockCount,
        featured: Boolean(product.featured),
        is_archived: Boolean(product.isArchived),
        archive_story: product.archiveStory || null,
      })).catch((e: any) => console.warn('Supabase add product notice:', e));
    }

    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    }).catch(() => {});

    return product;
  },

  updateProduct(id: string, updates: Partial<JewelryItem>): JewelryItem[] {
    const products = this.getProducts();
    const updated = products.map((item) => (item.id === id ? { ...item, ...updates } : item));
    this.saveProducts(updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.collection !== undefined) dbUpdates.collection = updates.collection;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.subCategory !== undefined) dbUpdates.sub_category = updates.subCategory;
      if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
      if (updates.inStock !== undefined) dbUpdates.in_stock = updates.inStock;
      if (updates.isArchived !== undefined) dbUpdates.is_archived = updates.isArchived;
      if (updates.archiveStory !== undefined) dbUpdates.archive_story = updates.archiveStory;
      if (updates.price !== undefined) {
        dbUpdates.price = parseFloat(String(updates.price).replace(/[^0-9.]/g, '')) || 0;
      }
      dbUpdates.updated_at = new Date().toISOString();
      Promise.resolve(supabase.from('products').update(dbUpdates).eq('id', id)).catch((e: any) => console.warn('Supabase product sync notice:', e));
    }

    fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(() => {});

    return updated;
  },

  deleteProduct(id: string): JewelryItem[] {
    const products = this.getProducts();
    const updated = products.filter((item) => item.id !== id);
    this.saveProducts(updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      Promise.resolve(supabase.from('products').delete().eq('id', id)).catch((e: any) => console.warn('Supabase delete notice:', e));
    }
    fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(() => {});

    return updated;
  },

  getArchiveItems(): JewelryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ARCHIVE);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading archive:', e);
    }
    localStorage.setItem(STORAGE_KEYS.ARCHIVE, JSON.stringify(ARCHIVE_ITEMS));
    return ARCHIVE_ITEMS;
  },

  saveArchiveItems(items: JewelryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ARCHIVE, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving archive items:', e);
    }
  },

  addArchiveItem(newItem: Omit<JewelryItem, 'id'> & { id?: string }): JewelryItem {
    const items = this.getArchiveItems();
    const item: JewelryItem = {
      ...newItem,
      id: newItem.id || `arch_${Date.now()}`
    };
    const updated = [item, ...items];
    this.saveArchiveItems(updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      Promise.resolve(supabase.from('archive_items').insert({
        id: item.id,
        name: item.name,
        collection: item.collection,
        category: item.category,
        sub_category: item.subCategory || null,
        gender: item.gender || 'Women',
        price: item.price,
        image: item.image,
        description: item.description,
        archive_story: item.archiveStory || item.description,
      })).catch((e: any) => console.warn('Supabase archive item notice:', e));
    }

    fetch('/api/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    }).catch(() => {});

    return item;
  },

  deleteArchiveItem(id: string): JewelryItem[] {
    const items = this.getArchiveItems();
    const updated = items.filter(item => item.id !== id);
    this.saveArchiveItems(updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      Promise.resolve(supabase.from('archive_items').delete().eq('id', id)).catch((e: any) => console.warn('Supabase delete archive notice:', e));
    }

    fetch(`/api/archive/${id}`, { method: 'DELETE' }).catch(() => {});

    return updated;
  },

  getOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading orders:', e);
    }
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_SAMPLE_ORDERS));
    return INITIAL_SAMPLE_ORDERS;
  },

  saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving orders:', e);
    }
  },

  addOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}`,
      orderNumber: `ANOVI-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newOrder, ...orders];
    this.saveOrders(updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      Promise.resolve(
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
        })
      ).then(({ error }: any) => {
        if (error) console.warn('Supabase client order insert notice:', error.message);
      }).catch((e: any) => console.warn('Supabase client order insert error:', e));
    }

    return newOrder;
  },

  /**
   * Async server-backed order creation with server-side price recalculation
   */
  async createOrderOnServer(orderData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    city: string;
    country: string;
    postalCode: string;
    items: { id: string; quantity: number }[];
    paymentMethod: Order['paymentMethod'];
    currency: string;
    notes?: string;
  }): Promise<{ success: boolean; order: Order; razorpayOrderId?: string; razorpayKeyId?: string; warning?: string; error?: string }> {
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const data = await response.json();
        // Sync local storage with verified order from server
        const orders = this.getOrders();
        const existingIdx = orders.findIndex(o => o.id === data.order.id);
        if (existingIdx === -1) {
          this.saveOrders([data.order, ...orders]);
        }
        return {
          success: true,
          order: data.order,
          razorpayOrderId: data.razorpayOrderId,
          razorpayKeyId: data.razorpayKeyId,
          warning: data.warning
        };
      } else {
        const errJson = await response.json().catch(() => ({}));
        console.warn('Server order creation returned error:', errJson);
      }
    } catch (netErr) {
      console.warn('Network call to /api/orders/create failed, falling back to local order reservation:', netErr);
    }

    // Fallback to local persistent store if offline or standalone Vite dev server
    const localFallbackOrder = this.addOrder({
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      shippingAddress: orderData.shippingAddress,
      city: orderData.city,
      country: orderData.country,
      postalCode: orderData.postalCode,
      items: orderData.items.map(i => {
        const prod = this.getProducts().find(p => p.id === i.id);
        return {
          id: i.id,
          name: prod?.name || 'Jewelry Piece',
          price: prod?.price || '$0',
          quantity: i.quantity,
          image: prod?.image || '',
          collection: prod?.collection || 'Collection'
        };
      }),
      subtotal: 0,
      currency: orderData.currency,
      status: 'Preparing Atelier',
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'Pending Verification',
      notes: orderData.notes
    });

    return {
      success: true,
      order: localFallbackOrder,
      warning: 'Order saved in local atelier ledger (Offline/Local mode).'
    };
  },

  /**
   * Cryptographic signature verification with Express server
   */
  async verifyPaymentOnServer(verificationData: {
    orderId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      const response = await fetch('/api/orders/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        if (data.order) {
          const orders = this.getOrders().map(o => o.id === data.order.id ? data.order : o);
          this.saveOrders(orders);
        }
        return { success: true, order: data.order };
      } else {
        return { success: false, error: data.error || 'Payment signature verification failed on server.' };
      }
    } catch (e: any) {
      console.error('Failed to communicate with payment verification endpoint:', e);
      return { success: false, error: 'Payment verification service unreachable.' };
    }
  },

  /**
   * Submit bespoke inquiry to backend API
   */
  async submitInquiryOnServer(inquiryData: Omit<BespokeInquiry, 'id' | 'createdAt' | 'status'> & { phone?: string }): Promise<{ success: boolean; inquiry: BespokeInquiry; error?: string }> {
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryData)
      });

      if (response.ok) {
        const data = await response.json();
        const inquiries = this.getBespokeInquiries();
        this.saveBespokeInquiries([data.inquiry, ...inquiries.filter(i => i.id !== data.inquiry.id)]);
        return { success: true, inquiry: data.inquiry };
      }
    } catch (e) {
      console.warn('Network call to /api/inquiries failed, saving locally:', e);
    }

    const localInquiry = this.addBespokeInquiry(inquiryData);
    return { success: true, inquiry: localInquiry };
  },

  updateOrderStatus(orderId: string, status: Order['status'], trackingNumber?: string): Order[] {
    const orders = this.getOrders();
    const updated = orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status,
          trackingNumber: trackingNumber ?? order.trackingNumber
        };
      }
      return order;
    });
    this.saveOrders(updated);
    return updated;
  },

  getBespokeInquiries(): BespokeInquiry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading inquiries:', e);
    }
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(INITIAL_SAMPLE_INQUIRIES));
    return INITIAL_SAMPLE_INQUIRIES;
  },

  saveBespokeInquiries(inquiries: BespokeInquiry[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    } catch (e) {
      console.error('Error saving inquiries:', e);
    }
  },

  addBespokeInquiry(inquiryData: Omit<BespokeInquiry, 'id' | 'createdAt' | 'status'> & { phone?: string }): BespokeInquiry {
    const inquiries = this.getBespokeInquiries();
    const newInquiry: BespokeInquiry = {
      ...inquiryData,
      id: `inq_${Date.now()}`,
      status: 'New Inquiry',
      createdAt: new Date().toISOString()
    };
    const updated = [newInquiry, ...inquiries];
    this.saveBespokeInquiries(updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      Promise.resolve(
        supabase.from('inquiries').insert({
          id: newInquiry.id,
          customer_name: newInquiry.name,
          customer_email: newInquiry.email,
          phone: inquiryData.phone || '',
          preferred_date: newInquiry.preferredDate || null,
          preferred_time: newInquiry.preferredTime || null,
          message: newInquiry.description,
          status: 'New Inquiry',
          created_at: newInquiry.createdAt
        })
      ).then(({ error }: any) => {
        if (error) console.warn('Supabase client inquiry insert notice:', error.message);
      }).catch((e: any) => console.warn('Supabase client inquiry insert error:', e));
    }

    return newInquiry;
  },

  updateInquiryStatus(id: string, status: BespokeInquiry['status'], notes?: string): BespokeInquiry[] {
    const inquiries = this.getBespokeInquiries();
    const updated = inquiries.map(inq => {
      if (inq.id === id) {
        return { ...inq, status, notes: notes !== undefined ? notes : inq.notes };
      }
      return inq;
    });
    this.saveBespokeInquiries(updated);
    return updated;
  },

  getWebsiteSettings(): WebsiteSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading settings:', e);
    }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_WEBSITE_SETTINGS));
    return DEFAULT_WEBSITE_SETTINGS;
  },

  saveWebsiteSettings(settings: WebsiteSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  },

  getIntegrationConfig(): IntegrationConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INTEGRATIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading integrations config:', e);
    }
    localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify(DEFAULT_INTEGRATION_CONFIG));
    return DEFAULT_INTEGRATION_CONFIG;
  },

  saveIntegrationConfig(config: IntegrationConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify(config));
    } catch (e) {
      console.error('Error saving integrations config:', e);
    }
  },

  exportAllData(): string {
    const backup = {
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      archive: this.getArchiveItems(),
      orders: this.getOrders(),
      inquiries: this.getBespokeInquiries(),
      settings: this.getWebsiteSettings(),
      integrations: this.getIntegrationConfig(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importAllData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.products && Array.isArray(data.products)) {
        this.saveProducts(data.products);
      }
      if (data.archive && Array.isArray(data.archive)) {
        this.saveArchiveItems(data.archive);
      }
      if (data.orders && Array.isArray(data.orders)) {
        this.saveOrders(data.orders);
      }
      if (data.inquiries && Array.isArray(data.inquiries)) {
        this.saveBespokeInquiries(data.inquiries);
      }
      if (data.settings) {
        this.saveWebsiteSettings(data.settings);
      }
      if (data.integrations) {
        this.saveIntegrationConfig(data.integrations);
      }
      return true;
    } catch (e) {
      console.error('Failed to import backup data:', e);
      return false;
    }
  },

  resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(JEWELRY_ITEMS));
    localStorage.setItem(STORAGE_KEYS.ARCHIVE, JSON.stringify(ARCHIVE_ITEMS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_SAMPLE_ORDERS));
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(INITIAL_SAMPLE_INQUIRIES));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_WEBSITE_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify(DEFAULT_INTEGRATION_CONFIG));
  }
};
