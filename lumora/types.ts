
export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PRODUCTION = 'IN_PRODUCTION',
  READY = 'READY',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum ChannelType {
  OFFLINE = 'OFFLINE',
  WHATSAPP = 'WHATSAPP',
  INSTAGRAM = 'INSTAGRAM',
  WEBSITE = 'WEBSITE'
}

export type ProductStatus = 'Available' | 'Reserved' | 'Sold' | 'Draft';

export interface ScreenSpec {
  id: string;
  name: string;
  purpose: string;
  actions: string[];
  entities: string[];
  module: string;
  platform: 'Web' | 'Mobile';
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  video?: string;
  material: string;
  status: ProductStatus;
  channels: ChannelType[];
  description?: string;
  grossWeight?: number;
  netWeight?: number;
  stoneDetails?: string;
  caratWeight?: number;
  craftsmanCost?: number;
  cost?: number;
  taggedCustomer?: string;
  allocationType?: 'stock' | 'customer';
  vaultLocation?: string;
}

export interface GoldCaratageRates {
  '24k': number; // 999 Fine Pure Gold
  '22k': number; // 916 Hallmark Standard
  '20k': number; // 833 Traditional
  '18k': number; // 750 Luxury Atelier Standard
  '14k': number; // 585 Modern Fine Jewelry
  '9k': number;  // 375 Entry Karat
}

export interface SilverPurityRates {
  '99.99': number; // 999 Fine Silver Bullion
  '92.5': number;  // 925 Sterling Silver
  '80.0'?: number; // 800 Coin Silver
}

export interface PlatinumPurityRates {
  'Pt950': number; // 950 Pure Platinum
  'Pt900': number; // 900 Commercial Platinum
  'Pt850'?: number;
}

export interface TitaniumGradeRates {
  'Grade5': number; // Ti-6Al-4V Aerospace / Luxury Horology Grade
  'CP2': number;    // Commercially Pure Grade 2
}

export interface DiamondCaratRates {
  baseCaratRate: number;      // General benchmark carat rate
  melee: number;              // 0.01 - 0.20 ct (Pave & Star Melee)
  pointers: number;           // 0.21 - 0.49 ct (Pointers)
  halves: number;             // 0.50 - 0.99 ct (Halves)
  solitaire1ct: number;       // 1.00 - 1.49 ct Solitaires
  solitaire2ct: number;       // 2.00+ ct Marquee / Investment
  vvsDef: number;             // Exceptional VVS Clarity / DEF Color
  vsGh: number;               // Fine Atelier VS Clarity / GH Color
  siIj: number;               // Commercial Fine SI Clarity / IJ Color
  labGrownSolitaire: number;  // Lab-Grown Solitaire (1.00+ ct)
  labGrownMelee: number;      // Lab-Grown Melee
}

export interface GemstoneCaratRates {
  naturalEmerald: number;
  naturalRuby: number;
  naturalSapphire: number;
}

export interface MarketDailyRates {
  currency: 'INR' | 'USD';
  unit: string;
  gold: GoldCaratageRates;
  silver: SilverPurityRates;
  platinum: PlatinumPurityRates;
  titanium: TitaniumGradeRates;
  diamond: DiamondCaratRates;
  gemstones?: GemstoneCaratRates;
}

export interface MetalRatesState {
  india: MarketDailyRates;
  global: MarketDailyRates;
  effectiveDate?: string;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'Stone' | 'Metal' | 'Packaging';
  quantity: number;
  unit: string;
  value: number;
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: 'craftsman_payment' | 'craftsman_advance' | 'customer_advance' | 'customer_final' | 'sale';
  amount: number;
  relatedId: string;
  relatedName: string;
  description: string;
  status: 'pending' | 'completed';
  category: 'Inflow' | 'Outflow';
}

export interface Reseller {
  id: string;
  name: string;
  type: 'Boutique' | 'Department Store' | 'Online Marketplace' | 'Private Agent';
  contact: string;
  email: string;
  location: string;
  status: 'Active' | 'Inactive';
  facebookUrl?: string;
  instagramUrl?: string;
}

export interface PartnerInventory {
  id: string;
  resellerId: string;
  productId: string;
  pricingModel: 'Commission' | 'Wholesale' | 'Consignment';
  partnerPrice: number;
  assignedDate: string;
  status: 'On Display' | 'Sold' | 'Returned';
}

export interface BespokeItem {
  id: string;
  name: string;
  weight: number;
  unit: 'ct' | 'g';
  unitCost: number;
  diamondType?: 'lab grown' | 'cubic zircon' | 'natural';
  gemstoneType?: 'lab grown' | 'zircon' | 'synthetic' | 'natural';
}

export interface BespokeOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  craftsmanId: string;
  craftsmanName: string;
  metalType: string;
  metalPurity: string;
  metalWeight: number;
  metalCostPerGram: number;
  stones: BespokeItem[];
  diamonds: BespokeItem[];
  makingCostPerGram: number;
  additionalExpenses: number;
  margins?: {
    metal: number;
    stones: number;
    diamonds: number;
    overheads: number;
  };
  specifications: string;
  samplePhotos: string[];
  totalAmount: number;
  advancePaid: number;
  status: 'Draft' | 'Sent to Craftsman' | 'In Progress' | 'Completed' | 'Delivered';
  createdAt: string;
  savedGoldRate?: number;
  savedSilverRate?: number;
  savedMarket?: 'india' | 'global';
  polishComments?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalSpend: number;
  lastOrder: string;
  status: string;
  area: string;
  location: string;
  leadSource: string;
  ageGroup: string;
  aliasName?: string;
  phone?: string;
  otherPhone?: string;
  country?: string;
  state?: string;
  city?: string;
  relationType?: string;
  notes?: string;
  shippingAddress?: string;
}

export interface ProductionStep {
  id: string;
  name: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  craftsmanId?: string;
  craftsmanName?: string;
  estimateCost?: number;
  estimateDays?: number;
  note?: string;
}

export interface ProductionJob {
  id: string;
  orderId: string;
  productName: string;
  productImage: string;
  steps: ProductionStep[];
  status: 'Draft' | 'Live' | 'Completed';
  updatedAt: string;
  samplePhotos?: string[];
}

export interface InventoryAuditLog {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  previousQuantity: number;
  newQuantity: number;
  variance: number;
  notes: string;
  auditor: string;
}

export interface RepairJob {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  itemDescription: string;
  repairDetails: string;
  costEstimate: number;
  status: 'Received' | 'In Repair' | 'Quality Check' | 'Ready for Pickup' | 'Completed' | 'Cancelled';
  assignedCraftsmanId?: string;
  assignedCraftsmanName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandConfig {
  brandName: string;
  brandSub: string;
  tagline: string;
  website: string;
  email: string;
  phone: string;
  manifestoTitle: string;
  manifestoParagraph1: string;
  manifestoParagraph2: string;
  manifestoParagraph3: string;
  certificateNote1: string;
  certificateNote2: string;
}

export type RecordMutationType = 'added' | 'updated' | 'deleted' | 'navigated' | 'viewed';

export interface FinalRecordState {
  entityType: 'Product' | 'Customer' | 'Payment Ledger' | 'Bespoke Order' | 'Repair Job' | 'Metal Rates' | 'System';
  mutationType: RecordMutationType;
  recordId?: string;
  recordName: string;
  statusBadge: string;
  finalSnapshot: Record<string, any>;
  persistedAt: string;
  syncStatus: string;
}

export interface PendingActionState {
  actionType: 'RECORD_PAYMENT' | 'ADD_CUSTOMER' | 'CREATE_BESPOKE_ORDER' | 'ADD_PRODUCT' | 'ADJUST_STOCK' | 'LOG_REPAIR' | 'UPDATE_METAL_RATES' | 'DELETE_PRODUCT' | 'DELETE_CUSTOMER' | 'DELETE_ORDER' | 'UPDATE_PRODUCT' | 'UPDATE_CUSTOMER';
  collectedFields: Record<string, any>;
  missingFields: string[];
  clarifyingQuestion: string;
  images?: string[];
  initiatedTimestamp?: string;
}

export type ProspectStatus = 
  | 'gathering_info' 
  | 'pending_confirmation' 
  | 'quote_sent' 
  | 'ready_to_order' 
  | 'converted_to_order' 
  | 'dropped';

export type PendingConfirmationKey = 
  | 'metal_purity' 
  | 'gemstone_selection' 
  | 'sizing_measurements' 
  | 'sketch_cad_approval' 
  | 'budget_quote_approval' 
  | 'advance_deposit' 
  | 'delivery_timeline';

export interface PendingConfirmationItem {
  key: PendingConfirmationKey;
  label: string;
  isConfirmed: boolean;
  details: string;
  confirmedAt?: string;
  confirmedBy?: string;
}

export interface ProspectActivityLog {
  id: string;
  date: string;
  type: 'note' | 'call' | 'whatsapp' | 'meeting' | 'quote_sent' | 'sketch_sent' | 'status_change' | 'confirmation_toggle';
  text: string;
  author: string;
}

export interface ProspectOrder {
  id: string;
  title: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerCity?: string;
  leadSource: string;
  priority: 'Urgent' | 'High' | 'Standard' | 'Low';
  category: 'Rings' | 'Necklaces' | 'Earrings' | 'Bracelets' | 'Bespoke' | 'Sets' | 'Pendants' | 'Other';
  status: ProspectStatus;
  targetBudget: number;
  estimatedQuote: number;
  advanceRequired: number;
  advanceReceived: number;
  advancePaymentMethod?: 'UPI' | 'Bank Transfer' | 'Credit Card' | 'Cash' | 'Cheque' | 'Pending';
  targetDeliveryDate?: string;
  occasion?: string;
  metalPreference: {
    type: string;
    purity: string;
    color: string;
    estWeightGrams: number;
    isConfirmed: boolean;
    notes?: string;
  };
  gemstoneDetails: {
    primaryStone: string;
    stoneType: 'natural' | 'lab grown' | 'synthetic' | 'none' | 'pending';
    caratWeight: number;
    cutShape: string;
    accentStones?: string;
    isConfirmed: boolean;
    notes?: string;
  };
  sizingDetails: {
    ringSize?: string;
    wristSize?: string;
    length?: string;
    isConfirmed: boolean;
    notes?: string;
  };
  designDetails: {
    sketchApproved: boolean;
    cadRenderApproved: boolean;
    engravingText?: string;
    specifications: string;
    samplePhotos: string[];
    notes?: string;
  };
  confirmations: PendingConfirmationItem[];
  nextFollowUpDate?: string;
  assignedCraftsmanId?: string;
  assignedCraftsmanName?: string;
  activityLog: ProspectActivityLog[];
  convertedOrderId?: string;
  convertedOrderType?: 'bespoke' | 'standard';
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
}




