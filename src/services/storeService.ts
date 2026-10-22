import { JEWELRY_ITEMS, ARCHIVE_ITEMS, BESPOKE_ITEMS } from '../constants';
import { JewelryItem, BespokeItem, Order, BespokeInquiry, WebsiteSettings, IntegrationConfig } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'anovi_products_v3',
  ARCHIVE: 'anovi_archive_v2',
  ORDERS: 'anovi_orders_v2',
  INQUIRIES: 'anovi_inquiries_v2',
  SETTINGS: 'anovi_settings_v2',
  INTEGRATIONS: 'anovi_integrations_v2',
  ADMIN_AUTH: 'anovi_admin_authenticated',
};

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
  supabaseUrl: 'https://vklqfbmrtyuzxjwkmnop.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODg5ODgyMDB9',
  supabaseConnected: false,
  stripePublishableKey: 'pk_test_51MzANOVI_FineJewelry_789420000',
  stripeSecretKeyConfigured: true,
  razorpayKeyId: 'rzp_test_ANOVIJewelsLive102',
  razorpayEnabled: true,
  stripeEnabled: true,
  codEnabled: true,
  bankWireEnabled: true,
  testMode: true,
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
        image: 'https://images.unsplash.com/photo-1535633302704-c02fbc4d2282?auto=format&fit=crop&q=80&w=800',
        collection: "L'Aurore",
      }
    ],
    subtotal: 4200,
    currency: 'USD',
    status: 'Shipped & Insured',
    trackingNumber: 'DHL-EX-9928104821',
    paymentMethod: 'Credit Card / Stripe',
    paymentStatus: 'Paid',
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
        image: 'https://images.unsplash.com/photo-1635767790417-22e83b18dfbd?auto=format&fit=crop&q=80&w=800',
        collection: 'Nocturne',
      }
    ],
    subtotal: 8500,
    currency: 'INR',
    status: 'Preparing Atelier',
    trackingNumber: 'PENDING_DISPATCH',
    paymentMethod: 'Razorpay',
    paymentStatus: 'Paid',
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
    return product;
  },

  updateProduct(id: string, updates: Partial<JewelryItem>): JewelryItem[] {
    const products = this.getProducts();
    const updated = products.map((item) => (item.id === id ? { ...item, ...updates } : item));
    this.saveProducts(updated);
    return updated;
  },

  deleteProduct(id: string): JewelryItem[] {
    const products = this.getProducts();
    const updated = products.filter((item) => item.id !== id);
    this.saveProducts(updated);
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
    return item;
  },

  deleteArchiveItem(id: string): JewelryItem[] {
    const items = this.getArchiveItems();
    const updated = items.filter(item => item.id !== id);
    this.saveArchiveItems(updated);
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
    return newOrder;
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

  addBespokeInquiry(inquiryData: Omit<BespokeInquiry, 'id' | 'createdAt' | 'status'>): BespokeInquiry {
    const inquiries = this.getBespokeInquiries();
    const newInquiry: BespokeInquiry = {
      ...inquiryData,
      id: `inq_${Date.now()}`,
      status: 'New Inquiry',
      createdAt: new Date().toISOString()
    };
    const updated = [newInquiry, ...inquiries];
    this.saveBespokeInquiries(updated);
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
