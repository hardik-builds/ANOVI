export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface JewelryItem {
  id: string;
  name: string;
  collection: string;
  category: 'Earrings' | 'Necklaces' | 'Rings' | 'Bracelets' | 'Pearls' | 'Silver' | 'Radiance' | 'The Singularities' | string;
  subCategory?: string;
  price: string;
  image: string;
  images?: string[];
  video?: string;
  description: string;
  materials?: string;
  shippingCost?: string;
  details?: string[];
  reviews?: Review[];
  inStock?: boolean;
  featured?: boolean;
  stockCount?: number;
  createdAt?: string;
}

export interface BespokeItem {
  id: string;
  name: string;
  description: string;
  beforeImage?: string;
  afterImage: string;
  story: string;
  date: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  image: string;
  collection: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  country: string;
  postalCode: string;
  items: OrderItem[];
  subtotal: number;
  currency: string;
  status: 'Pending' | 'Preparing Atelier' | 'Shipped & Insured' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
  paymentMethod: 'Credit Card / Stripe' | 'Razorpay' | 'Cash on Delivery' | 'Bank Wire';
  paymentStatus: 'Paid' | 'Pending Verification' | 'Authorized';
  createdAt: string;
  notes?: string;
}

export interface BespokeInquiry {
  id: string;
  name: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  description: string;
  status: 'New Inquiry' | 'Consultation Scheduled' | 'In Design' | 'Completed';
  createdAt: string;
  notes?: string;
}

export interface WebsiteSettings {
  announcementBarEnabled: boolean;
  announcementText: string;
  announcementLinkText: string;
  brandPhilosophyTitle: string;
  brandPhilosophyQuote: string;
  brandPhilosophyStory: string;
  contactEmail: string;
  contactPhone: string;
  atelierLocation: string;
  enableInternationalShipping: boolean;
  freeShippingThreshold: number;
}

export interface IntegrationConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseConnected: boolean;
  stripePublishableKey: string;
  stripeSecretKeyConfigured: boolean;
  razorpayKeyId: string;
  razorpayEnabled: boolean;
  stripeEnabled: boolean;
  codEnabled: boolean;
  bankWireEnabled: boolean;
  testMode: boolean;
}
