
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, Gem, FileText, Package, ShoppingCart, Users, Handshake, 
  CreditCard, Globe, Search, Plus, TrendingUp, ChevronRight, 
  Monitor, Bell, MoreVertical, Activity, ArrowUpRight, Layers, 
  ChevronLeft, Instagram, MessageCircle, Share2, Lock, Play, 
  CheckCircle2, ExternalLink, Zap, Diamond, Filter, Eye, Edit3, 
  UserPlus, Tag, Sparkles, Wand2, Video, Maximize, Loader2, Send, 
  Download, RefreshCw, Smartphone, Image as LucideImage, Trash2, FileSpreadsheet,
  Facebook, Pin, X, Upload, Calendar, Megaphone, Globe2, Target,
  Calculator, Check, ClipboardList, RotateCcw, Sliders, Crown, Copy, Receipt,
  Coins, Table, Grid, QrCode, Scan
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";
import { GoogleGenAI, Modality, Type } from "@google/genai";
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { supabase } from './supabase';
import { WEB_ADMIN_SCREENS, MOBILE_APP_SCREENS } from './constants';
import { Product, ChannelType, ProductStatus, LedgerEntry, Reseller, PartnerInventory, BespokeOrder, BespokeItem, Customer, ProductionJob, ProductionStep, InventoryItem, InventoryAuditLog, RepairJob, BrandConfig, ProspectOrder, MetalRatesState } from './types';
import { MOCK_PROSPECT_ORDERS } from './mockProspects';
import { ProspectsPipeline } from './ProspectsPipeline';
import { AiVoiceConcierge } from './AiVoiceConcierge';
import { PaymentsView } from './PaymentsView';
import { ProductModal } from './ProductModal';
import { DailyRatesMaster } from './DailyRatesMaster';
import { JewelryTagScanner } from './JewelryTagScanner';
import { Mic, MicOff } from 'lucide-react';

// --- MOCK DATA ---
const MOCK_SALES_TREND = [
  { month: 'Jan', revenue: 145000 }, { month: 'Feb', revenue: 168000 },
  { month: 'Mar', revenue: 312000 }, { month: 'Apr', revenue: 245000 },
  { month: 'May', revenue: 290000 }, { month: 'Jun', revenue: 340000 },
];

const MOCK_CHANNEL_DATA = [
  { name: 'WhatsApp', value: 35, color: '#C5A059' },
  { name: 'Website', value: 30, color: '#2D2D2D' },
  { name: 'Instagram', value: 25, color: '#8E8279' },
  { name: 'Offline', value: 10, color: '#D1CDC9' },
];

const MOCK_CATEGORY_SALES = [
  { category: 'Necklaces', sales: 45, growth: '+12%', demand: 'High', production: 'Increase' },
  { category: 'Rings', sales: 38, growth: '+25%', demand: 'Very High', production: 'Aggressive' },
  { category: 'Earrings', sales: 22, growth: '+5%', demand: 'Stable', production: 'Maintain' },
  { category: 'Bracelets', sales: 15, growth: '-2%', demand: 'Low', production: 'Reduce' },
];

const RECENT_ACTIVITY = [
  { id: 1, type: 'sale', title: 'Emerald Cascade Necklace sold', detail: 'Via Website • $42,000', time: '24m ago', status: 'completed' },
  { id: 2, type: 'order', title: 'New Bespoke Request: Rose Gold Band', detail: 'Client: Sarah J. • Offline', time: '1h ago', status: 'pending' },
];

const MOCK_ORDERS = [
  { 
    id: 'ORD-7721', 
    customer: 'Eleanor Rigby', 
    total: 12400, 
    status: 'In Production', 
    channel: 'Website', 
    date: 'Mar 10, 2026',
    craftsmanId: 'CRF-02',
    craftsmanName: 'Elena Rossi',
    specifications: 'Diamond Halo Engagement Ring, 18k White Gold, Round Brilliant Center Diamond (1.2 ct). Rhodium polish recommended.',
    samplePhotos: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800']
  },
  { 
    id: 'ORD-7722', 
    customer: 'Julian Casablancas', 
    total: 8500, 
    status: 'Pending', 
    channel: 'Instagram', 
    date: 'Mar 11, 2026',
    craftsmanId: 'CRF-03',
    craftsmanName: 'Marcus Thorne',
    specifications: 'Classic Platinum Wedding Band, 22k Gold, Intricate hand-carved floral engravings.',
    samplePhotos: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800']
  },
  { 
    id: 'ORD-7723', 
    customer: 'Sofia Coppola', 
    total: 45000, 
    status: 'Ready', 
    channel: 'Offline', 
    date: 'Mar 09, 2026',
    craftsmanId: 'CRF-01',
    craftsmanName: 'Master Hiroshi',
    specifications: 'Bespoke-grade Emerald drop earrings, 18k Yellow Gold, Natural Emerald Accents.',
    samplePhotos: ['https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&q=80&w=800']
  },
];

const MOCK_CRAFTSMEN = [
  { id: 'CRF-01', name: 'Master Hiroshi', specialty: 'Stone Setting', load: 'High', rating: 4.9, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400&h=400&auto=format&fit=crop' },
  { id: 'CRF-02', name: 'Elena Rossi', specialty: 'Filigree & Gold Work', load: 'Medium', rating: 4.8, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&h=400&auto=format&fit=crop' },
  { id: 'CRF-03', name: 'Marcus Thorne', specialty: 'Platinum Casting', load: 'Low', rating: 5.0, image: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?q=80&w=400&h=400&auto=format&fit=crop' },
];

const MOCK_MASTER_INVENTORY = [
  { id: 'RM-001', name: 'D-Color Round Diamonds (0.5ct)', type: 'Stone', quantity: 42, unit: 'pcs', value: 84000 },
  { id: 'RM-002', name: '18K Rose Gold Grain', type: 'Metal', quantity: 500, unit: 'grams', value: 32500 },
  { id: 'RM-003', name: 'Platinum 950 Casting Grain', type: 'Metal', quantity: 250, unit: 'grams', value: 18750 },
];

const MOCK_CUSTOMERS: Customer[] = [
  { id: 'CUS-001', name: 'Eleanor Rigby', email: 'eleanor@abbeyroad.com', totalSpend: 152000, lastOrder: 'Mar 10, 2026', status: 'VIP', area: 'South Mumbai', location: 'Mumbai', leadSource: 'Instagram', ageGroup: '35-45', country: 'India', phone: '+44 7700 900122' },
  { id: 'CUS-002', name: 'Julian Casablancas', email: 'julian@thestrokes.com', totalSpend: 42500, lastOrder: 'Feb 15, 2026', status: 'Regular', area: 'Bandra', location: 'Mumbai', leadSource: 'Website', ageGroup: '25-35', country: 'India', phone: '+91 98201 11223' },
  { id: 'CUS-003', name: 'Sofia Coppola', email: 'sofia@lostintranslation.com', totalSpend: 285000, lastOrder: 'Mar 01, 2026', status: 'VVIP', area: 'Jumeirah', location: 'Dubai', leadSource: 'Referral', ageGroup: '45-60', country: 'UAE', phone: '+971 50 123 4567' },
  { id: 'CUS-004', name: 'Sarah Jenkins', email: 'sarah.j@bespoke.com', totalSpend: 12000, lastOrder: 'Jan 20, 2026', status: 'New', area: 'Chelsea', location: 'London', leadSource: 'Offline Event', ageGroup: '25-35', country: 'United Kingdom', phone: '+44 20 7946 0991' },
  { id: 'CUS-005', name: 'Maharani Gayatri Singhania', email: 'gayatri.singhania@heritagecorp.in', totalSpend: 840000, lastOrder: 'Feb 28, 2026', status: 'VVIP', area: 'Udaipur / South Mumbai', location: 'Mumbai', leadSource: 'Private Atelier VIP Consultation', ageGroup: '45-60', country: 'India', phone: '+91 98200 44881' },
  { id: 'CUS-006', name: 'Aarav Mehta', email: 'aarav.mehta@solventures.com', totalSpend: 310000, lastOrder: 'Jan 15, 2026', status: 'VIP', area: 'Bandra', location: 'Mumbai', leadSource: 'Instagram DM Inquiry', ageGroup: '25-35', country: 'India', phone: '+91 98331 92840' },
  { id: 'CUS-007', name: 'Priya Narang', email: 'priya.narang@narangestate.com', totalSpend: 195000, lastOrder: 'Feb 10, 2026', status: 'VIP', area: 'Golf Links', location: 'New Delhi', leadSource: 'Referral by Mrs. Singhania', ageGroup: '35-45', country: 'India', phone: '+91 99870 11233' },
];

const MOCK_LEDGER: LedgerEntry[] = [
  { id: 'TXN-001', date: '2026-03-10', type: 'customer_advance', amount: 5000, relatedId: 'ORD-7721', relatedName: 'Eleanor Rigby', description: 'Advance for Celestial Empress Necklace', status: 'completed', category: 'Inflow' },
  { id: 'TXN-002', date: '2026-03-11', type: 'craftsman_advance', amount: 2000, relatedId: 'CRF-01', relatedName: 'Master Hiroshi', description: 'Advance to Master Hiroshi for ORD-7721', status: 'completed', category: 'Outflow' },
  { id: 'TXN-003', date: '2026-03-12', type: 'sale', amount: 12400, relatedId: 'ORD-7721', relatedName: 'Eleanor Rigby', description: 'Final Payment for ORD-7721', status: 'completed', category: 'Inflow' },
  { id: 'TXN-004', date: '2026-03-12', type: 'craftsman_payment', amount: 3000, relatedId: 'CRF-01', relatedName: 'Master Hiroshi', description: 'Final Payment to Master Hiroshi for ORD-7721', status: 'pending', category: 'Outflow' },
];

const MOCK_RESELLERS: Reseller[] = [
  { id: 'RES-001', name: 'Avenue Montaigne Luxury', type: 'Boutique', contact: '+33 1 42 25 05 15', email: 'contact@montaigne.fr', location: 'Paris, France', status: 'Active' },
  { id: 'RES-002', name: 'Harrods Fine Jewellery', type: 'Department Store', contact: '+44 20 7730 1234', email: 'partners@harrods.com', location: 'London, UK', status: 'Active' },
];

const MOCK_PARTNER_INVENTORY: PartnerInventory[] = [
  { id: 'PI-001', resellerId: 'RES-001', productId: 'lp-001', pricingModel: 'Consignment', partnerPrice: 110000, assignedDate: '2026-03-01', status: 'On Display' },
];

const INITIAL_METAL_RATES: MetalRatesState = {
  india: {
    currency: 'INR',
    unit: 'g',
    gold: {
      '24k': 7819.36,
      '22k': 7167.75,
      '20k': 6516.13,
      '18k': 5864.52,
      '14k': 4561.29,
      '9k': 2932.26,
    },
    silver: {
      '99.99': 93.15,
      '92.5': 86.16,
      '80.0': 74.52,
    },
    platinum: {
      'Pt950': 3850,
      'Pt900': 3550,
      'Pt850': 3320,
    },
    titanium: {
      'Grade5': 145,
      'CP2': 95,
    },
    diamond: {
      baseCaratRate: 95000,
      melee: 45000,
      pointers: 72000,
      halves: 110000,
      solitaire1ct: 175000,
      solitaire2ct: 390000,
      vvsDef: 165000,
      vsGh: 105000,
      siIj: 68000,
      labGrownSolitaire: 28000,
      labGrownMelee: 14000,
    },
    gemstones: {
      naturalEmerald: 28000,
      naturalRuby: 24000,
      naturalSapphire: 26000,
    }
  },
  global: {
    currency: 'USD',
    unit: 'g',
    gold: {
      '24k': 82.40,
      '22k': 75.54,
      '20k': 70.42,
      '18k': 61.80,
      '14k': 48.06,
      '9k': 30.90,
    },
    silver: {
      '99.99': 3.10,
      '92.5': 2.86,
      '80.0': 2.48,
    },
    platinum: {
      'Pt950': 42.50,
      'Pt900': 39.20,
      'Pt850': 36.80,
    },
    titanium: {
      'Grade5': 1.65,
      'CP2': 1.10,
    },
    diamond: {
      baseCaratRate: 1150,
      melee: 550,
      pointers: 880,
      halves: 1350,
      solitaire1ct: 2150,
      solitaire2ct: 4800,
      vvsDef: 1950,
      vsGh: 1250,
      siIj: 820,
      labGrownSolitaire: 340,
      labGrownMelee: 165,
    },
    gemstones: {
      naturalEmerald: 350,
      naturalRuby: 300,
      naturalSapphire: 320,
    }
  },
  effectiveDate: new Date().toISOString().split('T')[0],
  lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  trend: 'up' as 'up' | 'down' | 'stable'
};

const mergeMetalRatesWithDefaults = (saved: any, defaults: MetalRatesState): MetalRatesState => {
  if (!saved || typeof saved !== 'object') return defaults;
  return {
    ...defaults,
    ...saved,
    india: {
      ...defaults.india,
      ...(saved.india || {}),
      gold: { ...defaults.india.gold, ...(saved.india?.gold || {}) },
      silver: { ...defaults.india.silver, ...(saved.india?.silver || {}) },
      platinum: { ...defaults.india.platinum, ...(saved.india?.platinum || {}) },
      titanium: { ...defaults.india.titanium, ...(saved.india?.titanium || {}) },
      diamond: { ...defaults.india.diamond, ...(saved.india?.diamond || {}) },
      gemstones: { ...defaults.india.gemstones, ...(saved.india?.gemstones || {}) }
    },
    global: {
      ...defaults.global,
      ...(saved.global || {}),
      gold: { ...defaults.global.gold, ...(saved.global?.gold || {}) },
      silver: { ...defaults.global.silver, ...(saved.global?.silver || {}) },
      platinum: { ...defaults.global.platinum, ...(saved.global?.platinum || {}) },
      titanium: { ...defaults.global.titanium, ...(saved.global?.titanium || {}) },
      diamond: { ...defaults.global.diamond, ...(saved.global?.diamond || {}) },
      gemstones: { ...defaults.global.gemstones, ...(saved.global?.gemstones || {}) }
    }
  };
};

const MOCK_BESPOKE_ORDERS: BespokeOrder[] = [
  {
    id: 'BSK-001',
    customerName: 'Eleanor Rigby',
    customerEmail: 'eleanor@abbeyroad.com',
    customerPhone: '+919876543210',
    craftsmanId: 'CRF-01',
    craftsmanName: 'Master Hiroshi',
    metalType: 'Gold',
    metalPurity: '18k',
    metalWeight: 12.5,
    metalCostPerGram: 5887,
    stones: [
      { id: 's1', name: 'Emerald', weight: 1.2, unit: 'ct', unitCost: 5000 }
    ],
    diamonds: [
      { id: 'd1', name: 'VS-H Round', weight: 0.8, unit: 'ct', unitCost: 3500 }
    ],
    makingCostPerGram: 850,
    additionalExpenses: 200,
    specifications: 'Custom engagement ring with 2ct oval diamond and halo setting.',
    samplePhotos: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800'],
    totalAmount: 15000,
    advancePaid: 5000,
    status: 'In Progress',
    createdAt: '2026-03-10'
  }
];

const MOCK_PRODUCTION_JOBS: ProductionJob[] = [
  {
    id: 'JOB-001',
    orderId: 'ORD-7721',
    productName: 'Celestial Empress Necklace',
    productImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
    status: 'Live',
    updatedAt: '2026-03-15',
    samplePhotos: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800'],
    steps: [
      { id: 'step-1', name: 'Design & CAD', status: 'Completed', craftsmanName: 'Elena Rossi', estimateCost: 500, estimateDays: 3 },
      { id: 'step-2', name: 'Metal Casting', status: 'In Progress', craftsmanName: 'Marcus Thorne', estimateCost: 1200, estimateDays: 5 },
      { id: 'step-3', name: 'Stone Setting', status: 'Pending', craftsmanName: 'Master Hiroshi' },
      { id: 'step-4', name: 'Polishing & Finishing', status: 'Pending' },
      { id: 'step-5', name: 'Quality Assay', status: 'Pending' }
    ]
  }
];

const MOCK_REPAIR_JOBS: RepairJob[] = [
  {
    id: 'REP-1001',
    customerName: 'Sarah Jenkins',
    customerPhone: '+44 7911 123456',
    customerEmail: 'sarah.j@bespoke.com',
    itemDescription: '18K Rose Gold Diamond Eternity Ring',
    repairDetails: 'Resecure 2 loose pave diamonds on outer band and professionally polish metal.',
    costEstimate: 250,
    status: 'In Repair',
    assignedCraftsmanId: 'CRF-01',
    assignedCraftsmanName: 'Master Hiroshi',
    notes: 'Prongs are extremely thin; handle with caution during re-tipping.',
    createdAt: '2026-03-12',
    updatedAt: '2026-03-14'
  },
  {
    id: 'REP-1002',
    customerName: 'Julian Casablancas',
    customerPhone: '+919876543210',
    customerEmail: 'julian@thestrokes.com',
    itemDescription: 'Platinum Heavy Link Men\'s Bracelet',
    repairDetails: 'Repair broken box clasp safety latch and laser weld joint.',
    costEstimate: 450,
    status: 'Received',
    assignedCraftsmanId: 'CRF-03',
    assignedCraftsmanName: 'Marcus Thorne',
    notes: 'Client requests priority turnaround for upcoming private gala.',
    createdAt: '2026-03-14',
    updatedAt: '2026-03-14'
  },
  {
    id: 'REP-1003',
    customerName: 'Eleanor Rigby',
    customerPhone: '+919999988888',
    customerEmail: 'eleanor@abbeyroad.com',
    itemDescription: 'Heritage Emerald Pendant in 22K Gold Filigree',
    repairDetails: 'Steam deep clean, ultrasonic bath, and micro-probe inspection of setting.',
    costEstimate: 120,
    status: 'Ready for Pickup',
    assignedCraftsmanId: 'CRF-02',
    assignedCraftsmanName: 'Elena Rossi',
    notes: 'Emerald is oil-treated; do not expose to high temperatures.',
    createdAt: '2026-03-10',
    updatedAt: '2026-03-13'
  }
];

const MOCK_INVENTORY: Product[] = [
  {
    id: 'lp-001',
    name: 'Celestial Empress Necklace',
    sku: 'LMR-N-001-PLAT',
    price: 124500,
    status: 'Available',
    category: 'Necklaces',
    material: 'Platinum 950',
    stock: 1,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=800'
    ],
    video: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    channels: [ChannelType.WEBSITE, ChannelType.INSTAGRAM, ChannelType.WHATSAPP, ChannelType.OFFLINE],
    description: 'A breathtaking masterpiece featuring a cascade of celestial-grade diamonds set in pure Platinum 950. Designed for the modern empress.'
  },
  {
    id: 'lp-002',
    name: 'Solitaire Royal Ring',
    sku: 'LMR-R-002-GOLD',
    price: 18500,
    status: 'Available',
    category: 'Rings',
    material: '18k Yellow Gold',
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800'
    ],
    channels: [ChannelType.WEBSITE, ChannelType.OFFLINE],
    description: 'An exquisite classic Solitaire diamond ring, featuring a flawless round brilliant diamond mounted on a solid 18k yellow gold band.'
  },
  {
    id: 'lp-003',
    name: 'Eternal Flame Earrings',
    sku: 'LMR-E-003-ROSE',
    price: 32000,
    status: 'Available',
    category: 'Earrings',
    material: '18k Rose Gold',
    stock: 2,
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800'
    ],
    channels: [ChannelType.INSTAGRAM, ChannelType.WHATSAPP, ChannelType.OFFLINE],
    description: 'Sophisticated tear-drop diamond earrings radiating brilliant flashes of fiery warmth, set in deluxe 18k Rose Gold.'
  },
  {
    id: 'lp-004',
    name: 'Emerald Serenade Bracelet',
    sku: 'LMR-B-004-WHT',
    price: 54000,
    status: 'Available',
    category: 'Bracelets',
    material: '18k White Gold',
    stock: 1,
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800'
    ],
    channels: [ChannelType.WEBSITE, ChannelType.OFFLINE],
    description: 'A stunning continuous line of luxury green natural emeralds surrounded by a double halo of sparkling micro-pave diamonds.'
  },
  {
    id: 'lp-005',
    name: 'Aura Diamond Band',
    sku: 'LMR-R-005-PLAT',
    price: 12000,
    status: 'Available',
    category: 'Rings',
    material: 'Platinum 950',
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=800'
    ],
    channels: [ChannelType.WEBSITE, ChannelType.INSTAGRAM, ChannelType.WHATSAPP],
    description: 'An elegant eternity band stacked with flawless princess-cut diamonds set flush in deep, polished Platinum.'
  },
  {
    id: 'lp-006',
    name: 'Bespoke Empress Tiara',
    sku: 'LMR-H-006-PLAT',
    price: 245000,
    status: 'Available',
    category: 'Necklaces',
    material: 'Platinum 950',
    stock: 0,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800'
    ],
    channels: [ChannelType.OFFLINE],
    description: 'A sovereign heirloom tiara custom-ordered for royal events, adorned with rare marquise diamonds and rare pearls.'
  },
  {
    id: 'lp-007',
    name: 'Luminous Drop Earrings',
    sku: 'LMR-E-007-GOLD',
    price: 8500,
    status: 'Available',
    category: 'Earrings',
    material: '18k Yellow Gold',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800'
    ],
    channels: [ChannelType.WEBSITE, ChannelType.INSTAGRAM],
    description: 'Dainty and charming drop earrings crafted with polished yellow gold spheres and miniature brilliant diamonds.'
  },
  {
    id: 'lp-008',
    name: 'Rose Gold Chevron Ring',
    sku: 'LMR-R-008-ROSE',
    price: 4200,
    status: 'Available',
    category: 'Rings',
    material: '18k Rose Gold',
    stock: 3,
    images: [
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=800'
    ],
    channels: [ChannelType.WEBSITE, ChannelType.INSTAGRAM, ChannelType.WHATSAPP],
    description: 'A stylish and sleek geometric chevron ring crafted in highly reflective 18k rose gold, studded with pave diamonds.'
  }
];

const PRODUCT_STATS_INFO: Record<string, { salesCount: number; margin: number }> = {
  'lp-001': { salesCount: 14, margin: 0.45 },
  'lp-002': { salesCount: 45, margin: 0.55 },
  'lp-003': { salesCount: 18, margin: 0.50 },
  'lp-004': { salesCount: 9, margin: 0.60 },
  'lp-005': { salesCount: 64, margin: 0.40 },
  'lp-006': { salesCount: 2, margin: 0.65 },
  'lp-007': { salesCount: 30, margin: 0.50 },
  'lp-008': { salesCount: 52, margin: 0.48 },
};

// --- UTILS ---
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const imageUrlToBase64 = async (url: string): Promise<string> => {
  if (url.startsWith('data:')) {
    return url.split(',')[1];
  }
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('Network response was not ok');
    const blob = await response.blob();
    return blobToBase64(blob);
  } catch (e) {
    console.warn("Failed to fetch image via CORS, trying anonymous img tag", e);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL.split(',')[1]);
          } else {
            reject(new Error('Failed to get canvas context'));
          }
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image: ' + url));
      img.src = url;
    });
  }
};

const getImageDimensions = (base64Str: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ 
        width: img.naturalWidth || img.width || 400, 
        height: img.naturalHeight || img.height || 400 
      });
    };
    img.onerror = () => {
      resolve({ width: 400, height: 400 });
    };
    img.src = `data:image/png;base64,${base64Str}`;
  });
};

// --- AI SERVICE ---
const ensurePaidKey = async () => {
  // @ts-ignore
  if (typeof window.aistudio !== 'undefined') {
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
  }
};

const getApiKey = () => {
  try {
    return process.env.API_KEY || process.env.GEMINI_API_KEY || '';
  } catch (e) {
    return '';
  }
};

// --- COMPONENTS ---

const StatCard: React.FC<{ label: string; value: string; trend?: string; icon: React.ReactNode; onClick?: () => void }> = ({ label, value, trend, icon, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white border border-black/[0.03] p-8 rounded-sm hover:shadow-lg transition-all group ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-lumora-bone rounded-sm text-lumora-taupe group-hover:text-lumora-gold transition-colors">
        {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { size: 20, strokeWidth: 1.5 })}
      </div>
      {trend && (
        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
          <ArrowUpRight size={10} />
          {trend}
        </span>
      )}
    </div>
    <p className="text-[10px] text-lumora-taupe uppercase font-bold tracking-[0.2em] mb-1">{label}</p>
    <p className="text-2xl font-serif font-bold text-lumora-charcoal">{value}</p>
  </div>
);

const AIAssistantModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  products: Product[];
  ledger: LedgerEntry[];
  bespokeOrders: BespokeOrder[];
  repairJobs: RepairJob[];
  metalRates: any;
  marketView: 'india' | 'global';
  onRecordPayment: (paymentData: any) => any;
  onAddCustomer: (customerData: any) => any;
  onAdjustStock: (data: any) => any;
  onCreateBespokeOrder: (data: any) => any;
  onUpdateMetalRates: (data: any) => any;
  onLogRepair: (data: any) => any;
  onAddProduct?: (data: any) => any;
  onNavigateTab: (tab: any) => void;
}> = (props) => {
  if (!props.isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 z-[100] animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[85vh] bg-[#FAF9F5] rounded-xl shadow-2xl border border-lumora-gold/30 flex flex-col overflow-hidden relative">
        <AiVoiceConcierge
          {...props}
          isFloatingView={true}
          onCloseFloating={props.onClose}
        />
      </div>
    </div>
  );
};

const ProductionWorkflowView: React.FC<{ 
  jobs: ProductionJob[]; 
  craftsmen: any[];
  onUpdateJob: (job: ProductionJob) => void;
  orders: any[];
  bespokeOrders: BespokeOrder[];
  onInitiateJob: (newJob: ProductionJob) => void;
  initiateOrderId: string | null;
  onClearInitiateOrderId: () => void;
  highlightedJobId: string | null;
  onClearHighlightedJobId: () => void;
  products?: any[];
  repairJobs: RepairJob[];
  onUpdateRepairJob: (job: RepairJob) => void;
  onAddRepairJob: (job: RepairJob) => void;
  onDeleteRepairJob: (id: string) => void;
  onOpenJobCard?: (mappedOrder: any) => void;
}> = ({ 
  jobs, 
  craftsmen, 
  onUpdateJob, 
  orders, 
  bespokeOrders, 
  onInitiateJob, 
  initiateOrderId, 
  onClearInitiateOrderId,
  highlightedJobId,
  onClearHighlightedJobId,
  products = [],
  repairJobs = [],
  onUpdateRepairJob,
  onAddRepairJob,
  onDeleteRepairJob,
  onOpenJobCard
}) => {
  const [editingStep, setEditingStep] = useState<{ jobId: string; stepId: string; data?: ProductionStep } | null>(null);
  
  // Connect production modal state
  const [isInitiateModalOpen, setIsInitiateModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<'bespoke' | 'standard' | 'stock'>('bespoke');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [customProductName, setCustomProductName] = useState('');
  const [customProductImage, setCustomProductImage] = useState('');

  // Repair Management states
  const [activeSubTab, setActiveSubTab] = useState<'production' | 'repairs'>('production');
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [editingRepairJob, setEditingRepairJob] = useState<RepairJob | null>(null);
  const [repairSearch, setRepairSearch] = useState('');
  const [repairStatusFilter, setRepairStatusFilter] = useState<string>('all');
  const [repairCraftsmanFilter, setRepairCraftsmanFilter] = useState<string>('all');

  const handleSaveRepair = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customerName = formData.get('customerName') as string;
    const customerPhone = formData.get('customerPhone') as string;
    const customerEmail = formData.get('customerEmail') as string;
    const itemDescription = formData.get('itemDescription') as string;
    const repairDetails = formData.get('repairDetails') as string;
    const costEstimate = Number(formData.get('costEstimate') || 0);
    const status = formData.get('status') as RepairJob['status'];
    const assignedCraftsmanId = formData.get('assignedCraftsmanId') as string;
    const notes = formData.get('notes') as string;

    const selectedCraftsman = craftsmen.find(c => c.id === assignedCraftsmanId);

    if (editingRepairJob) {
      const updated: RepairJob = {
        ...editingRepairJob,
        customerName,
        customerPhone,
        customerEmail,
        itemDescription,
        repairDetails,
        costEstimate,
        status,
        assignedCraftsmanId,
        assignedCraftsmanName: selectedCraftsman ? selectedCraftsman.name : '',
        notes,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      onUpdateRepairJob(updated);
    } else {
      const newJob: RepairJob = {
        id: `REP-${1000 + repairJobs.length + 1}`,
        customerName,
        customerPhone,
        customerEmail,
        itemDescription,
        repairDetails,
        costEstimate,
        status,
        assignedCraftsmanId,
        assignedCraftsmanName: selectedCraftsman ? selectedCraftsman.name : '',
        notes,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      onAddRepairJob(newJob);
    }
    setIsRepairModalOpen(false);
    setEditingRepairJob(null);
  };

  const filteredRepairJobs = repairJobs.filter(rj => {
    const searchLower = repairSearch.toLowerCase();
    const matchesSearch = 
      rj.customerName.toLowerCase().includes(searchLower) ||
      (rj.customerEmail && rj.customerEmail.toLowerCase().includes(searchLower)) ||
      rj.itemDescription.toLowerCase().includes(searchLower) ||
      rj.repairDetails.toLowerCase().includes(searchLower) ||
      rj.id.toLowerCase().includes(searchLower);

    const matchesStatus = repairStatusFilter === 'all' || rj.status === repairStatusFilter;
    const matchesCraftsman = repairCraftsmanFilter === 'all' || rj.assignedCraftsmanId === repairCraftsmanFilter;

    return matchesSearch && matchesStatus && matchesCraftsman;
  });

  // Handle auto-scroll and highlight
  useEffect(() => {
    if (highlightedJobId) {
      const element = document.getElementById(`job-card-${highlightedJobId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
        const timer = setTimeout(() => {
          onClearHighlightedJobId();
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [highlightedJobId]);

  // When initiateOrderId is passed from outer parent, open the modal and pre-fill!
  useEffect(() => {
    if (initiateOrderId) {
      const isBespoke = bespokeOrders.some(bo => bo.id === initiateOrderId);
      setSelectedSource(isBespoke ? 'bespoke' : 'standard');
      setSelectedOrderId(initiateOrderId);
      setIsInitiateModalOpen(true);

      if (isBespoke) {
        const bo = bespokeOrders.find(b => b.id === initiateOrderId);
        if (bo) {
          setCustomProductName(`Bespoke Commission: ${bo.customerName} - ${bo.metalType} Piece`);
          setCustomProductImage(bo.samplePhotos[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800');
        }
      } else {
        const o = orders.find(ord => ord.id === initiateOrderId);
        if (o) {
          setCustomProductName(`Standard Order: Premium Piece for ${o.customer}`);
          setCustomProductImage(o.samplePhotos && o.samplePhotos[0] ? o.samplePhotos[0] : 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800');
        }
      }
    }
  }, [initiateOrderId, bespokeOrders, orders]);

  const handleOrderChange = (orderId: string, source: 'bespoke' | 'standard') => {
    setSelectedOrderId(orderId);
    if (!orderId) {
      setCustomProductName('');
      setCustomProductImage('');
      return;
    }

    if (source === 'bespoke') {
      const bo = bespokeOrders.find(b => b.id === orderId);
      if (bo) {
        setCustomProductName(`Bespoke Commission: ${bo.customerName} - ${bo.metalType} Piece`);
        setCustomProductImage(bo.samplePhotos[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800');
      }
    } else {
      const o = orders.find(ord => ord.id === orderId);
      if (o) {
        setCustomProductName(`Standard Order: Premium Piece for ${o.customer}`);
        setCustomProductImage(o.samplePhotos && o.samplePhotos[0] ? o.samplePhotos[0] : 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800');
      }
    }
  };

  const handleInitiateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId && selectedSource !== 'stock') return;

    const finalOrderId = selectedSource === 'stock' 
      ? `STOCK-${Math.floor(Math.random() * 9000) + 1000}` 
      : selectedOrderId;

    let stoneSetterName = 'Master Hiroshi';
    let jobSamplePhotos: string[] = [];

    if (selectedSource === 'bespoke') {
      const bo = bespokeOrders.find(b => b.id === selectedOrderId);
      if (bo) {
        if (bo.craftsmanName) {
          stoneSetterName = bo.craftsmanName;
        }
        jobSamplePhotos = bo.samplePhotos || [];
      }
    } else if (selectedSource === 'standard') {
      const o = orders.find(ord => ord.id === selectedOrderId);
      if (o) {
        if (o.craftsmanName) {
          stoneSetterName = o.craftsmanName;
        }
        jobSamplePhotos = o.samplePhotos || [];
      }
    }

    const defaultSteps: ProductionStep[] = [
      { id: 'step-1', name: 'Design & CAD', status: 'In Progress', craftsmanName: 'Elena Rossi', estimateCost: 500, estimateDays: 3 },
      { id: 'step-2', name: 'Metal Casting', status: 'Pending', craftsmanName: 'Marcus Thorne', estimateCost: 1200, estimateDays: 5 },
      { id: 'step-3', name: 'Stone Setting', status: 'Pending', craftsmanName: stoneSetterName, estimateCost: 1500, estimateDays: 4 },
      { id: 'step-4', name: 'Polishing & Finishing', status: 'Pending' },
      { id: 'step-5', name: 'Quality Assay & Hallmarking', status: 'Pending' }
    ];

    const newJob: ProductionJob = {
      id: `JOB-${Math.floor(Math.random() * 9000) + 1000}`,
      orderId: finalOrderId,
      productName: customProductName || (selectedSource === 'stock' ? 'Internal Stock Production' : `Production for ${finalOrderId}`),
      productImage: customProductImage || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
      steps: defaultSteps,
      status: 'Live',
      updatedAt: new Date().toISOString().split('T')[0],
      samplePhotos: jobSamplePhotos.length > 0 ? jobSamplePhotos : (customProductImage ? [customProductImage] : [])
    };

    onInitiateJob(newJob);
    setIsInitiateModalOpen(false);
    onClearInitiateOrderId();
    setSelectedOrderId('');
    setCustomProductName('');
    setCustomProductImage('');
  };

  const handleUpdateStep = (jobId: string, stepId: string, data: Partial<ProductionStep>) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    const newSteps = job.steps.map(s => s.id === stepId ? { ...s, ...data } : s);
    
    // Auto-update overall job status
    const allCompleted = newSteps.every(s => s.status === 'Completed');
    const anyInProgress = newSteps.some(s => s.status === 'In Progress' || s.status === 'Completed');
    let newStatus = job.status;
    if (allCompleted) newStatus = 'Completed';
    else if (anyInProgress && job.status === 'Draft') newStatus = 'Live';

    onUpdateJob({ 
      ...job, 
      steps: newSteps, 
      status: newStatus,
      updatedAt: new Date().toISOString().split('T')[0] 
    });
    setEditingStep(null);
  };

  const calculateTotals = (steps: ProductionStep[]) => {
    return steps.reduce((acc, s) => ({
      cost: acc.cost + (s.estimateCost || 0),
      days: acc.days + (s.estimateDays || 0)
    }), { cost: 0, days: 0 });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Sub-tab Switcher capsule */}
      <div className="flex justify-center border-b border-black/5 pb-6">
        <div className="bg-white border border-black/5 p-1 rounded-full flex gap-1 shadow-sm">
          <button 
            onClick={() => setActiveSubTab('production')}
            className={`px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${activeSubTab === 'production' ? 'bg-lumora-charcoal text-white shadow-xs' : 'text-lumora-taupe hover:text-lumora-charcoal'}`}
          >
            Active Production
          </button>
          <button 
            onClick={() => setActiveSubTab('repairs')}
            className={`px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${activeSubTab === 'repairs' ? 'bg-lumora-charcoal text-white shadow-xs' : 'text-lumora-taupe hover:text-lumora-charcoal'}`}
          >
            Client Maintenance & Repairs
          </button>
        </div>
      </div>

      {activeSubTab === 'production' ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-black/5 pb-8 gap-6">
        <div className="space-y-2">
          <h3 className="text-3xl font-serif font-bold text-lumora-charcoal">Atelier Execution Hub</h3>
          <p className="text-[10px] text-lumora-taupe uppercase tracking-[0.2em] font-bold">Lifecycle Monitoring & Artisan Logistics</p>
        </div>
        <div className="flex flex-wrap items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex gap-10">
            <div className="text-right">
              <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe mb-1">Active Production</p>
              <p className="text-xl font-serif font-bold text-lumora-charcoal">{jobs.filter(j => j.status === 'Live').length}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe mb-1">Completed Units</p>
              <p className="text-xl font-serif font-bold text-green-600">{jobs.filter(j => j.status === 'Completed').length}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setSelectedOrderId('');
              setCustomProductName('');
              setCustomProductImage('');
              setIsInitiateModalOpen(true);
            }}
            className="bg-lumora-charcoal text-white hover:bg-lumora-gold px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 shadow-sm rounded-sm"
          >
            <Plus size={14} /> Track New Production
          </button>
        </div>
      </div>

      <div className="space-y-12">
        {jobs.map(job => {
          const totals = calculateTotals(job.steps);
          const isHighlighted = highlightedJobId === job.orderId;
          return (
            <div 
              key={job.id} 
              id={`job-card-${job.orderId}`}
              className={`bg-white border shadow-sm overflow-hidden group transition-all duration-1000 ${
                isHighlighted 
                  ? 'border-lumora-gold ring-4 ring-lumora-gold/25 scale-[1.01] shadow-2xl bg-lumora-bone/20' 
                  : 'border-black/5'
              }`}
            >
              <div className="p-10 bg-lumora-bone flex flex-col md:flex-row justify-between items-center gap-8 border-b border-black/5">
                <div className="flex items-center gap-8 flex-1">
                  <div className="w-24 h-24 bg-white border border-black/5 overflow-hidden shadow-inner">
                    <img src={job.productImage} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-bold text-lumora-gold uppercase tracking-[0.3em]">{job.orderId}</span>
                      <span className={`text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                        job.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-lumora-charcoal text-white border-transparent'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <h4 className="text-2xl font-serif font-bold text-lumora-charcoal">{job.productName}</h4>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <p className="text-[10px] text-lumora-taupe flex items-center gap-2 font-mono">
                        <Calendar size={12} /> Last movement: {job.updatedAt}
                      </p>
                      {onOpenJobCard && (
                        <button 
                          onClick={() => {
                            const mappedOrder = {
                              id: job.orderId,
                              customerName: job.productName.includes('for ') ? job.productName.split('for ')[1] : 'Internal Stock',
                              customerEmail: '',
                              customerPhone: '',
                              craftsmanId: '',
                              craftsmanName: job.steps.find(s => s.name === 'Stone Setting')?.craftsmanName || 'Elena Rossi',
                              metalType: 'Gold',
                              metalPurity: '18k',
                              metalWeight: 0,
                              metalCostPerGram: 0,
                              stones: [],
                              diamonds: [],
                              makingCostPerGram: 0,
                              additionalExpenses: 0,
                              specifications: `Production job specifications for ${job.productName}. Check active phase details for individual artisan instructions.`,
                              samplePhotos: job.samplePhotos || [job.productImage],
                              totalAmount: totals.cost,
                              advancePaid: 0,
                              status: job.status,
                              createdAt: job.updatedAt
                            };
                            onOpenJobCard(mappedOrder);
                          }}
                          className="text-[9px] font-bold uppercase tracking-widest text-lumora-gold hover:text-lumora-charcoal transition-colors flex items-center gap-1.5 border border-lumora-gold/20 px-2.5 py-1 bg-lumora-gold/5 rounded-sm"
                          title="Open Artisan Job Card with reference imagery"
                        >
                          <ClipboardList size={11} /> Artisan Job Card
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-12 border-l border-black/10 pl-12">
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe mb-1 font-mono">Total Estimated Cost</p>
                    <p className="text-2xl font-serif font-bold text-lumora-charcoal">${totals.cost.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe mb-1 font-mono">Est. Lead Time</p>
                    <p className="text-2xl font-serif font-bold text-lumora-charcoal">{totals.days} Days</p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-lumora-bone/25 border-t border-black/[0.03] grid grid-cols-1 md:grid-cols-5 gap-6">
                {job.steps.map((step, idx) => (
                  <div key={step.id} className="relative animate-in fade-in duration-300 flex flex-col">
                    <div className={`p-6 border-x border-b border-t-2 transition-all duration-300 h-full flex flex-col justify-between group/step ${
                      step.status === 'Completed' ? 'border-t-emerald-600 border-x-black/[0.04] border-b-black/[0.04] bg-emerald-50/[0.03]' : 
                      step.status === 'In Progress' ? 'border-t-lumora-gold border-x-lumora-gold/20 border-b-lumora-gold/20 bg-lumora-gold/[0.02] shadow-md ring-1 ring-lumora-gold/10 z-10 scale-[1.01]' : 
                      'border-t-slate-300 border-x-black/[0.03] border-b-black/[0.03] bg-white'
                    }`}>
                      
                      {/* Phase & Status Badge */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[9px] font-bold text-lumora-taupe tracking-wider font-mono">PHASE {idx + 1}</span>
                          {step.status === 'Completed' ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] tracking-wider uppercase font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 shrink-0">
                              <Check size={10} strokeWidth={3} /> Done
                            </span>
                          ) : step.status === 'In Progress' ? (
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[8px] tracking-wider uppercase font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 animate-pulse shrink-0">
                              <Zap size={10} className="fill-amber-500 text-amber-500" /> Active
                            </span>
                          ) : (
                            <span className="bg-slate-50 text-slate-500 border border-slate-200 text-[8px] tracking-wider uppercase font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 shrink-0">
                              <Diamond size={8} /> Pending
                            </span>
                          )}
                        </div>

                        {/* Step Name (with fixed minimum height for vertical alignment across columns) */}
                        <h5 className="text-[11px] font-bold text-lumora-charcoal uppercase tracking-[0.12em] mb-4 font-sans line-clamp-2 min-h-[36px] flex items-center border-b border-black/[0.03] pb-2">
                          {step.name}
                        </h5>
                        
                        {/* Details Stack */}
                        <div className="space-y-3">
                          {/* Assigned Artisan */}
                          <div 
                            className={`space-y-1 p-2.5 rounded-sm transition-all ${
                              step.status !== 'Completed' 
                                ? 'hover:bg-lumora-bone cursor-pointer border border-transparent hover:border-black/5' 
                                : 'bg-black/[0.01]'
                            }`}
                            onClick={() => step.status !== 'Completed' && setEditingStep({ jobId: job.id, stepId: step.id, data: step })}
                          >
                            <span className="text-[7.5px] uppercase tracking-widest text-lumora-taupe font-bold block">Assigned Artisan</span>
                            <p className="text-[10px] font-bold text-lumora-charcoal group-hover/step:text-lumora-gold transition-colors truncate">
                              {step.craftsmanName || 'Click to Assign'}
                            </p>
                          </div>

                          {/* Cost & Lead Time estimate fields */}
                          {step.estimateCost ? (
                            <div 
                              className={`grid grid-cols-2 gap-2 border-t border-black/[0.04] pt-2.5 p-2.5 rounded-sm transition-all ${
                                step.status !== 'Completed' 
                                  ? 'hover:bg-lumora-bone cursor-pointer border border-transparent hover:border-black/5' 
                                  : 'bg-black/[0.01]'
                              }`}
                              onClick={() => step.status !== 'Completed' && setEditingStep({ jobId: job.id, stepId: step.id, data: step })}
                            >
                              <div>
                                <span className="text-[7.5px] uppercase tracking-widest text-lumora-taupe font-bold block">Estimate Cost</span>
                                <p className="text-[10px] font-mono font-bold text-lumora-gold">${step.estimateCost}</p>
                              </div>
                              <div className="text-right border-l border-black/[0.04] pl-2">
                                <span className="text-[7.5px] uppercase tracking-widest text-lumora-taupe font-bold block">Lead Time</span>
                                <p className="text-[10px] font-mono font-bold text-lumora-charcoal">{step.estimateDays} Days</p>
                              </div>
                            </div>
                          ) : (
                            <div className="pt-1">
                              {step.status !== 'Completed' ? (
                                <button 
                                  onClick={() => setEditingStep({ jobId: job.id, stepId: step.id })}
                                  className="w-full py-2.5 bg-lumora-bone/60 text-lumora-taupe text-[8.5px] font-bold uppercase tracking-widest hover:bg-lumora-gold hover:text-white transition-all border border-dashed border-black/10 flex items-center justify-center gap-1 rounded-sm"
                                >
                                  <Plus size={11} /> Setup Estimate
                                </button>
                              ) : (
                                <div className="p-2.5 bg-black/[0.01] rounded-sm text-[9px] text-lumora-taupe italic">
                                  No estimate captured.
                                </div>
                              )}
                            </div>
                          )}

                          {/* Logistics Notes Box (fixed height block to keep cards perfectly aligned) */}
                          <div className="min-h-[50px] flex flex-col justify-center mt-3 pt-3 border-t border-black/[0.03]">
                            {step.note ? (
                              <div className="p-2 bg-lumora-bone/50 border border-black/[0.03] rounded-sm">
                                <span className="text-[7px] uppercase tracking-widest text-lumora-taupe block font-bold mb-0.5">Artisan Note</span>
                                <p className="text-[9px] text-lumora-charcoal italic line-clamp-2 leading-tight">"{step.note}"</p>
                              </div>
                            ) : (
                              <div className="p-2 bg-black/[0.01] border border-dashed border-black/[0.03] rounded-sm text-center">
                                <span className="text-[7.5px] text-lumora-taupe/50 italic font-serif">Standard atelier protocol</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons section at absolute bottom of equal height cards */}
                      <div className="mt-5 pt-3 border-t border-black/[0.03]">
                        {step.status === 'Completed' ? (
                          <div className="w-full py-2.5 bg-emerald-50/50 border border-emerald-100 text-emerald-700 text-[8.5px] font-bold uppercase tracking-widest text-center rounded-sm flex items-center justify-center gap-1.5 cursor-not-allowed">
                            <Check size={11} strokeWidth={3} /> Stage Finalized
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleUpdateStep(job.id, step.id, { status: step.status === 'Pending' ? 'In Progress' : 'Completed' })}
                            className={`w-full py-2.5 text-[8.5px] font-bold uppercase tracking-widest transition-all rounded-sm shadow-xs ${
                              step.status === 'Pending' 
                                ? 'bg-lumora-bone text-lumora-charcoal hover:bg-lumora-gold hover:text-white border border-black/10' 
                                : 'bg-lumora-charcoal text-white hover:bg-lumora-gold shadow-sm'
                            }`}
                          >
                            {step.status === 'Pending' ? 'Initiate Phase' : 'Mark Completed'}
                          </button>
                        )}
                      </div>

                    </div>
                    {/* Pipeline Connector Chevron */}
                    {idx < job.steps.length - 1 && (
                      <div className="hidden md:block absolute top-[65px] -right-3.5 transform -translate-y-1/2 z-20">
                        <div className="bg-white rounded-full p-1 shadow-md border border-black/5 text-lumora-gold">
                          <ChevronRight size={12} strokeWidth={3} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Track New Production Modal */}
      {isInitiateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[110] p-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 bg-lumora-bone border-b border-black/5 flex justify-between items-center">
              <div>
                <h4 className="text-xl font-serif font-bold text-lumora-charcoal">Track Order in Production</h4>
                <p className="text-[10px] text-lumora-taupe uppercase tracking-widest font-bold font-mono">Connect execution hub to pending sales</p>
              </div>
              <button 
                onClick={() => {
                  setIsInitiateModalOpen(false);
                  onClearInitiateOrderId();
                  setSelectedOrderId('');
                  setCustomProductName('');
                  setCustomProductImage('');
                }} 
                className="text-lumora-taupe hover:text-black transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleInitiateSubmit} className="p-10 space-y-6 overflow-y-auto flex-1">
              {/* Source Tabs */}
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-lumora-taupe">Order Source Category</label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-lumora-bone rounded-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSource('bespoke');
                      setSelectedOrderId('');
                      setCustomProductName('');
                      setCustomProductImage('');
                    }}
                    className={`py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      selectedSource === 'bespoke' 
                        ? 'bg-white text-lumora-charcoal shadow-sm border border-black/5' 
                        : 'text-lumora-taupe hover:text-lumora-charcoal'
                    }`}
                  >
                    Bespoke Workshop
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSource('standard');
                      setSelectedOrderId('');
                      setCustomProductName('');
                      setCustomProductImage('');
                    }}
                    className={`py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      selectedSource === 'standard' 
                        ? 'bg-white text-lumora-charcoal shadow-sm border border-black/5' 
                        : 'text-lumora-taupe hover:text-lumora-charcoal'
                    }`}
                  >
                    Standard Sales
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSource('stock');
                      setSelectedOrderId('');
                      setCustomProductName('');
                      setCustomProductImage('');
                    }}
                    className={`py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      selectedSource === 'stock' 
                        ? 'bg-white text-lumora-charcoal shadow-sm border border-black/5' 
                        : 'text-lumora-taupe hover:text-lumora-charcoal'
                    }`}
                  >
                    Made for Stock
                  </button>
                </div>
              </div>

              {/* Order Select Dropdown or Product Selection */}
              {selectedSource !== 'stock' ? (
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-lumora-taupe">Select Pending Order</label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => handleOrderChange(e.target.value, selectedSource as 'bespoke' | 'standard')}
                    required
                    className="w-full bg-lumora-bone border-none text-xs p-4 focus:ring-1 focus:ring-lumora-gold"
                  >
                    <option value="">-- Choose Order / Commission --</option>
                    {selectedSource === 'bespoke' ? (
                      bespokeOrders
                        .filter(bo => !jobs.some(j => j.orderId === bo.id))
                        .map(bo => (
                          <option key={bo.id} value={bo.id}>
                            {bo.id} - {bo.customerName} (${bo.metalType}) - ${bo.totalAmount.toLocaleString()}
                          </option>
                        ))
                    ) : (
                      orders
                        .filter(o => !jobs.some(j => j.orderId === o.id))
                        .map(o => (
                          <option key={o.id} value={o.id}>
                            {o.id} - {o.customer} - ${o.total.toLocaleString()}
                          </option>
                        ))
                    )}
                  </select>
                  {selectedSource === 'bespoke' && bespokeOrders.filter(bo => !jobs.some(j => j.orderId === bo.id)).length === 0 && (
                    <p className="text-[9px] text-amber-600 font-bold tracking-wide mt-1">
                      No pending bespoke commissions found without active production.
                    </p>
                  )}
                  {selectedSource === 'standard' && orders.filter(o => !jobs.some(j => j.orderId === o.id)).length === 0 && (
                    <p className="text-[9px] text-amber-600 font-bold tracking-wide mt-1">
                      No pending standard orders found without active production.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-lumora-taupe">Base Product Template (Optional)</label>
                  <select
                    onChange={(e) => {
                      const prodId = e.target.value;
                      if (!prodId) {
                        setCustomProductName('');
                        setCustomProductImage('');
                        return;
                      }
                      const prod = products.find(p => p.id === prodId);
                      if (prod) {
                        setCustomProductName(`${prod.name} (Stock Replenishment)`);
                        setCustomProductImage(prod.images?.[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800');
                      }
                    }}
                    className="w-full bg-lumora-bone border-none text-xs p-4 focus:ring-1 focus:ring-lumora-gold"
                  >
                    <option value="">-- Create completely custom piece --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {p.category}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Product/Design Details */}
              {(selectedOrderId || selectedSource === 'stock') && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-lumora-taupe">Product Name / Title</label>
                    <input 
                      type="text"
                      value={customProductName}
                      onChange={(e) => setCustomProductName(e.target.value)}
                      required
                      placeholder={selectedSource === 'stock' ? "e.g. Stock Replenishment: Solitaire Gold Ring" : "e.g. Bespoke Solitaire Gold Ring"}
                      className="w-full bg-lumora-bone border-none text-xs p-4 focus:ring-1 focus:ring-lumora-gold"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-lumora-taupe">Reference Image</label>
                    <div className="flex flex-col gap-4">
                      {customProductImage ? (
                        <div className="relative w-32 h-32 bg-lumora-bone border border-black/5 rounded-sm overflow-hidden group">
                          <img src={customProductImage} alt="Reference" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => setCustomProductImage('')} 
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-wider"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="w-full h-24 bg-lumora-bone border border-dashed border-black/10 flex flex-col items-center justify-center cursor-pointer hover:bg-lumora-gold/5 transition-all group rounded-sm">
                          <Upload size={18} className="text-lumora-taupe group-hover:text-lumora-gold mb-2" />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-lumora-taupe">Upload Reference Image</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const base64 = await blobToBase64(file);
                                setCustomProductImage(`data:${file.type};base64,${base64}`);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-lumora-bone space-y-3">
                    <p className="text-[8px] uppercase font-bold tracking-[0.15em] text-lumora-taupe border-b border-black/5 pb-2">Auto-Configured Stages</p>
                    <ul className="text-[10px] text-lumora-charcoal space-y-1.5 font-serif italic">
                      <li>• Phase 1: Design & CAD <span className="text-lumora-taupe not-italic text-[9px] font-sans font-bold">(Elena Rossi)</span></li>
                      <li>• Phase 2: Metal Casting <span className="text-lumora-taupe not-italic text-[9px] font-sans font-bold">(Marcus Thorne)</span></li>
                      <li>• Phase 3: Stone Setting <span className="text-lumora-taupe not-italic text-[9px] font-sans font-bold">({
                        selectedSource === 'bespoke' 
                          ? (bespokeOrders.find(bo => bo.id === selectedOrderId)?.craftsmanName || 'Master Hiroshi')
                          : 'Master Hiroshi'
                      })</span></li>
                      <li>• Phase 4: Polishing & Finishing</li>
                      <li>• Phase 5: Quality Assay & Hallmarking</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-black/5 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsInitiateModalOpen(false);
                    onClearInitiateOrderId();
                    setSelectedOrderId('');
                    setCustomProductName('');
                    setCustomProductImage('');
                  }}
                  className="flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.3em] border border-black/10 hover:bg-black/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!selectedOrderId && selectedSource !== 'stock'}
                  className="flex-1 bg-lumora-charcoal text-white py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-lumora-gold transition-all disabled:opacity-50 disabled:hover:bg-lumora-charcoal"
                >
                  Start Production
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingStep && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[110] p-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white w-full max-w-md rounded-sm shadow-2xl overflow-hidden">
            <div className="p-8 bg-lumora-bone border-b border-black/5 flex justify-between items-center">
              <div>
                <h4 className="text-xl font-serif font-bold text-lumora-charcoal">Artisan Commitment</h4>
                <p className="text-[10px] text-lumora-taupe uppercase tracking-widest font-bold">Record official estimate & logistics</p>
              </div>
              <button onClick={() => setEditingStep(null)} className="text-lumora-taupe hover:text-black transition-colors"><X size={24} /></button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateStep(editingStep.jobId, editingStep.stepId, {
                  craftsmanName: formData.get('craftsman') as string,
                  estimateCost: Number(formData.get('cost')),
                  estimateDays: Number(formData.get('days')),
                  note: formData.get('note') as string,
                  status: editingStep.data?.status || 'Pending'
                });
              }}
              className="p-10 space-y-8"
            >
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-lumora-taupe">Assigned Craftsman</label>
                <select name="craftsman" required defaultValue={editingStep.data?.craftsmanName} className="w-full bg-lumora-bone border-none text-xs p-4 focus:ring-1 focus:ring-lumora-gold">
                  <option value="">Select Atelier Partner...</option>
                  {craftsmen.map(c => <option key={c.id} value={c.name}>{c.name} ({c.specialty})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-lumora-taupe">Estimated Cost ($)</label>
                  <input name="cost" type="number" required defaultValue={editingStep.data?.estimateCost} className="w-full bg-lumora-bone border-none text-xs p-4 focus:ring-1 focus:ring-lumora-gold" placeholder="0.00" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-lumora-taupe">Lead Time (Days)</label>
                  <input name="days" type="number" required defaultValue={editingStep.data?.estimateDays} className="w-full bg-lumora-bone border-none text-xs p-4 focus:ring-1 focus:ring-lumora-gold" placeholder="Working days" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-lumora-taupe">Artisan Logistics Notes</label>
                <textarea name="note" defaultValue={editingStep.data?.note} className="w-full bg-lumora-bone border-none text-xs p-4 focus:ring-1 focus:ring-lumora-gold min-h-[100px]" placeholder="Specific requirements or constraints..." />
              </div>
              <button type="submit" className="w-full bg-lumora-charcoal text-white py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-lumora-gold shadow-2xl transition-all">
                {editingStep.data ? 'Update Commitment' : 'Submit Commitment'}
              </button>
            </form>
          </div>
        </div>
      )}
        </>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Repairs Stats Panel */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white border border-black/5 p-6 rounded-sm shadow-sm">
            <div className="border-r border-black/5 pr-4 last:border-none">
              <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe mb-1">Active Repairs</p>
              <p className="text-2xl font-serif font-bold text-lumora-charcoal">
                {repairJobs.filter(r => r.status !== 'Completed' && r.status !== 'Cancelled').length}
              </p>
              <p className="text-[9px] text-lumora-gold font-bold mt-0.5">In process at Atelier</p>
            </div>
            <div className="border-r border-black/5 pr-4 last:border-none lg:pl-4">
              <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe mb-1">Ready for Pickup</p>
              <p className="text-2xl font-serif font-bold text-emerald-600">
                {repairJobs.filter(r => r.status === 'Ready for Pickup').length}
              </p>
              <p className="text-[9px] text-emerald-600/80 font-bold mt-0.5">Awaiting client pick-up</p>
            </div>
            <div className="border-r border-black/5 pr-4 last:border-none lg:pl-4">
              <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe mb-1">Completed (All Time)</p>
              <p className="text-2xl font-serif font-bold text-lumora-charcoal">
                {repairJobs.filter(r => r.status === 'Completed').length}
              </p>
              <p className="text-[9px] text-lumora-taupe mt-0.5">Successfully serviced</p>
            </div>
            <div className="lg:pl-4">
              <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe mb-1">Est. Maintenance Revenue</p>
              <p className="text-2xl font-serif font-bold text-lumora-gold">
                ${repairJobs.filter(r => r.status !== 'Cancelled').reduce((sum, r) => sum + r.costEstimate, 0).toLocaleString()}
              </p>
              <p className="text-[9px] text-lumora-gold/80 font-bold mt-0.5">Post-sale service billing</p>
            </div>
          </div>

          {/* Filter & Control Bar */}
          <div className="bg-white border border-black/5 p-6 rounded-sm shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-lumora-taupe/60" size={14} />
                <input 
                  type="text"
                  placeholder="Search repairs (e.g. Jenkins, emerald)..."
                  value={repairSearch}
                  onChange={e => setRepairSearch(e.target.value)}
                  className="w-full bg-lumora-bone border-none text-xs pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-lumora-gold focus:outline-none rounded-xs placeholder-lumora-taupe/50"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={repairStatusFilter}
                  onChange={e => setRepairStatusFilter(e.target.value)}
                  className="bg-lumora-bone border-none text-[10px] py-2.5 px-3 uppercase font-bold tracking-wider text-lumora-charcoal rounded-none focus:outline-none focus:ring-1 focus:ring-lumora-gold"
                >
                  <option value="all">All Statuses</option>
                  <option value="Received">Received</option>
                  <option value="In Repair">In Repair</option>
                  <option value="Quality Check">Quality Check</option>
                  <option value="Ready for Pickup">Ready for Pickup</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <select
                  value={repairCraftsmanFilter}
                  onChange={e => setRepairCraftsmanFilter(e.target.value)}
                  className="bg-lumora-bone border-none text-[10px] py-2.5 px-3 uppercase font-bold tracking-wider text-lumora-charcoal rounded-none focus:outline-none focus:ring-1 focus:ring-lumora-gold"
                >
                  <option value="all">All Artisans</option>
                  {craftsmen.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={() => {
                setEditingRepairJob(null);
                setIsRepairModalOpen(true);
              }}
              className="w-full md:w-auto bg-lumora-charcoal hover:bg-lumora-gold text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3 transition-colors flex items-center justify-center gap-2 rounded-xs"
            >
              <Plus size={14} /> Record Repair Job
            </button>
          </div>

          {/* Repairs Listing Grid */}
          {filteredRepairJobs.length === 0 ? (
            <div className="bg-white border border-black/5 p-16 text-center rounded-sm">
              <p className="text-sm text-lumora-taupe">No repair jobs found matching the selection criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredRepairJobs.map(rj => {
                const statusColors = {
                  'Received': 'bg-neutral-100 text-neutral-600 border-neutral-200',
                  'In Repair': 'bg-amber-50 text-amber-600 border-amber-200',
                  'Quality Check': 'bg-purple-50 text-purple-600 border-purple-200',
                  'Ready for Pickup': 'bg-blue-50 text-blue-600 border-blue-200',
                  'Completed': 'bg-emerald-50 text-emerald-600 border-emerald-200',
                  'Cancelled': 'bg-rose-50 text-rose-600 border-rose-200'
                };

                return (
                  <div key={rj.id} className="bg-white border border-black/5 p-8 rounded-sm shadow-xs space-y-6 flex flex-col justify-between group hover:border-lumora-gold/30 transition-all duration-300">
                    <div className="space-y-4">
                      {/* Repair Card Header */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-lumora-gold uppercase tracking-widest">{rj.id}</span>
                            <span className={`text-[8px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${statusColors[rj.status] || 'bg-neutral-50 text-neutral-600'}`}>
                              {rj.status}
                            </span>
                          </div>
                          <h4 className="text-xl font-serif font-bold text-lumora-charcoal">{rj.customerName}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe mb-0.5">Cost Estimate</p>
                          <p className="text-lg font-serif font-bold text-lumora-charcoal">${rj.costEstimate.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Contact details */}
                      <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-lumora-taupe border-y border-black/5 py-3">
                        <div>
                          <span className="block text-[7px] uppercase tracking-widest font-bold">Email</span>
                          <span className="block truncate">{rj.customerEmail || '—'}</span>
                        </div>
                        <div>
                          <span className="block text-[7px] uppercase tracking-widest font-bold">Phone</span>
                          <span className="block truncate">{rj.customerPhone || '—'}</span>
                        </div>
                      </div>

                      {/* Item Description & Specs */}
                      <div className="space-y-3">
                        <div>
                          <span className="text-[8px] uppercase tracking-widest font-bold text-lumora-taupe block mb-1">Item Description</span>
                          <p className="text-xs text-lumora-charcoal font-sans font-medium">{rj.itemDescription}</p>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-widest font-bold text-lumora-taupe block mb-1">Repair Instructions</span>
                          <p className="text-xs text-lumora-taupe font-sans leading-relaxed italic bg-lumora-bone/40 p-3 border border-black/[0.01] rounded-xs">
                            "{rj.repairDetails}"
                          </p>
                        </div>
                        {rj.notes && (
                          <div>
                            <span className="text-[8px] uppercase tracking-widest font-bold text-lumora-taupe block mb-1">Artisan Warning/Notes</span>
                            <p className="text-[11px] text-amber-700 bg-amber-50/40 p-3 border border-amber-100 rounded-xs">
                              ⚠️ {rj.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-black/5 space-y-4">
                      {/* Assigned Artisan details & Status Updater */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[7px] uppercase tracking-widest font-bold text-lumora-taupe block mb-1">Assigned Artisan</span>
                          <select
                            value={rj.assignedCraftsmanId || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const c = craftsmen.find(x => x.id === val);
                              onUpdateRepairJob({
                                ...rj,
                                assignedCraftsmanId: val,
                                assignedCraftsmanName: c ? c.name : '',
                                updatedAt: new Date().toISOString().split('T')[0]
                              });
                            }}
                            className="w-full bg-lumora-bone text-[10px] font-bold uppercase tracking-wider py-1.5 px-2 focus:ring-1 focus:ring-lumora-gold border-none focus:outline-none"
                          >
                            <option value="">Unassigned</option>
                            {craftsmen.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <span className="text-[7px] uppercase tracking-widest font-bold text-lumora-taupe block mb-1">Quick Status Update</span>
                          <select
                            value={rj.status}
                            onChange={(e) => {
                              onUpdateRepairJob({
                                ...rj,
                                status: e.target.value as RepairJob['status'],
                                updatedAt: new Date().toISOString().split('T')[0]
                              });
                            }}
                            className="w-full bg-lumora-bone text-[10px] font-bold uppercase tracking-wider py-1.5 px-2 focus:ring-1 focus:ring-lumora-gold border-none focus:outline-none"
                          >
                            {['Received', 'In Repair', 'Quality Check', 'Ready for Pickup', 'Completed', 'Cancelled'].map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex justify-end gap-2 pt-2">
                        <button 
                          onClick={() => {
                            setEditingRepairJob(rj);
                            setIsRepairModalOpen(true);
                          }}
                          className="py-2 px-3 text-[9px] uppercase tracking-widest font-bold text-lumora-taupe hover:text-lumora-charcoal border border-black/10 hover:border-black/30 transition-all rounded-xs flex items-center gap-1"
                        >
                          <Edit3 size={10} /> Edit Job Specs
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete repair job ${rj.id}?`)) {
                              onDeleteRepairJob(rj.id);
                            }
                          }}
                          className="py-2 px-3 text-[9px] uppercase tracking-widest font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all rounded-xs flex items-center gap-1"
                        >
                          <Trash2 size={10} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Repair Job Modal */}
          {isRepairModalOpen && (
            <div className="fixed inset-0 bg-lumora-charcoal/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
              <div className="bg-white max-w-xl w-full border border-black/5 shadow-2xl p-8 rounded-sm animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center border-b border-black/5 pb-4 mb-6">
                  <div>
                    <h4 className="text-xl font-serif font-bold text-lumora-charcoal">
                      {editingRepairJob ? 'Edit Repair Job Specs' : 'Record New Repair Job'}
                    </h4>
                    <p className="text-[9px] text-lumora-taupe uppercase font-bold tracking-widest mt-1">Post-Sale Customer Maintenance</p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsRepairModalOpen(false);
                      setEditingRepairJob(null);
                    }}
                    className="text-lumora-taupe hover:text-lumora-charcoal transition-colors p-1"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSaveRepair} className="space-y-5">
                  {/* Customer Info Section */}
                  <div className="space-y-3">
                    <p className="text-[8px] uppercase tracking-[0.2em] text-lumora-gold font-bold border-b border-black/5 pb-1">Customer Details</p>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Customer Name *</label>
                      <input 
                        name="customerName" 
                        type="text" 
                        required 
                        defaultValue={editingRepairJob?.customerName || ''} 
                        className="w-full bg-lumora-bone border-none text-xs p-3 focus:ring-1 focus:ring-lumora-gold focus:outline-none rounded-xs" 
                        placeholder="Sarah Jenkins" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Phone Number</label>
                        <input 
                          name="customerPhone" 
                          type="text" 
                          defaultValue={editingRepairJob?.customerPhone || ''} 
                          className="w-full bg-lumora-bone border-none text-xs p-3 focus:ring-1 focus:ring-lumora-gold focus:outline-none rounded-xs" 
                          placeholder="+44 7911 123456" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Email Address</label>
                        <input 
                          name="customerEmail" 
                          type="email" 
                          defaultValue={editingRepairJob?.customerEmail || ''} 
                          className="w-full bg-lumora-bone border-none text-xs p-3 focus:ring-1 focus:ring-lumora-gold focus:outline-none rounded-xs" 
                          placeholder="sarah.j@bespoke.com" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Repair Specs Section */}
                  <div className="space-y-3 pt-2">
                    <p className="text-[8px] uppercase tracking-[0.2em] text-lumora-gold font-bold border-b border-black/5 pb-1">Repair Specifications</p>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Item Description *</label>
                      <input 
                        name="itemDescription" 
                        type="text" 
                        required 
                        defaultValue={editingRepairJob?.itemDescription || ''} 
                        className="w-full bg-lumora-bone border-none text-xs p-3 focus:ring-1 focus:ring-lumora-gold focus:outline-none rounded-xs" 
                        placeholder="e.g. 18K Rose Gold Diamond Eternity Ring" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Repair details / instructions *</label>
                      <textarea 
                        name="repairDetails" 
                        required 
                        defaultValue={editingRepairJob?.repairDetails || ''} 
                        className="w-full bg-lumora-bone border-none text-xs p-3 focus:ring-1 focus:ring-lumora-gold focus:outline-none rounded-xs min-h-[80px] resize-none" 
                        placeholder="e.g. Resecure 2 loose pave diamonds on outer band and professionally polish metal." 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Cost Estimate ($) *</label>
                        <input 
                          name="costEstimate" 
                          type="number" 
                          required 
                          defaultValue={editingRepairJob?.costEstimate || 0} 
                          className="w-full bg-lumora-bone border-none text-xs p-3 focus:ring-1 focus:ring-lumora-gold focus:outline-none rounded-xs" 
                          placeholder="0" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Initial Status *</label>
                        <select 
                          name="status" 
                          defaultValue={editingRepairJob?.status || 'Received'} 
                          className="w-full bg-lumora-bone border-none text-xs p-3 focus:ring-1 focus:ring-lumora-gold focus:outline-none rounded-xs uppercase font-bold tracking-wider"
                        >
                          {['Received', 'In Repair', 'Quality Check', 'Ready for Pickup', 'Completed', 'Cancelled'].map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Assignment & Notes Section */}
                  <div className="space-y-3 pt-2">
                    <p className="text-[8px] uppercase tracking-[0.2em] text-lumora-gold font-bold border-b border-black/5 pb-1">Artisan Logistics & Notes</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Assign Craftsman</label>
                        <select 
                          name="assignedCraftsmanId" 
                          defaultValue={editingRepairJob?.assignedCraftsmanId || ''} 
                          className="w-full bg-lumora-bone border-none text-xs p-3 focus:ring-1 focus:ring-lumora-gold focus:outline-none rounded-xs uppercase font-bold tracking-wider"
                        >
                          <option value="">Unassigned</option>
                          {craftsmen.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Artisan Warnings / Notes</label>
                        <input 
                          name="notes" 
                          type="text" 
                          defaultValue={editingRepairJob?.notes || ''} 
                          className="w-full bg-lumora-bone border-none text-xs p-3 focus:ring-1 focus:ring-lumora-gold focus:outline-none rounded-xs" 
                          placeholder="e.g. Emerald is oil-treated; do not heat" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsRepairModalOpen(false);
                        setEditingRepairJob(null);
                      }}
                      className="flex-1 py-3 bg-white hover:bg-black/[0.02] text-lumora-taupe border border-black/10 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xs"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 py-3 bg-lumora-charcoal hover:bg-lumora-gold text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-xs shadow-md"
                    >
                      {editingRepairJob ? 'Save Repair Specs' : 'Record Repair Job'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SettingsView: React.FC<{ 
  isAccountConnected: Record<string, boolean>; 
  setIsAccountConnected: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  accountLinks: Record<string, string>;
  setAccountLinks: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  socialCredentials: Record<string, { token: string; accountId?: string; additionalConfig?: string }>;
  setSocialCredentials: React.Dispatch<React.SetStateAction<Record<string, { token: string; accountId?: string; additionalConfig?: string }>>>;
  socialPublishHistory: Array<{ id: string; productName: string; platform: string; message: string; timestamp: string; status: 'Success' | 'Failed'; txId: string }>;
  onConnect: (platform: string) => void;
  brandConfig: BrandConfig;
  setBrandConfig: React.Dispatch<React.SetStateAction<BrandConfig>>;
}> = ({ 
  isAccountConnected, 
  setIsAccountConnected, 
  accountLinks, 
  setAccountLinks, 
  socialCredentials, 
  setSocialCredentials, 
  socialPublishHistory, 
  onConnect,
  brandConfig,
  setBrandConfig
}) => {
  const toggleConnection = (platform: string) => {
    if (isAccountConnected[platform]) {
      setIsAccountConnected(prev => ({ ...prev, [platform]: false }));
      setSocialCredentials(prev => ({ ...prev, [platform]: { token: '', accountId: '' } }));
    } else {
      onConnect(platform);
    }
  };

  const handleLinkChange = (platform: string, link: string) => {
    setAccountLinks(prev => ({ ...prev, [platform]: link }));
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="space-y-2">
        <h3 className="text-2xl font-serif font-bold text-lumora-charcoal">Global Settings</h3>
        <div className="flex gap-2 items-center">
          <p className="text-[10px] text-lumora-taupe uppercase tracking-widest font-bold">Platform Configuration & Integrations</p>
          <span className="w-1 h-1 bg-lumora-gold rounded-full"></span>
          <p className="text-[10px] text-lumora-gold uppercase tracking-widest font-bold">Account Verification Enabled</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="bg-white border border-black/5 p-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-lumora-bone rounded-full text-lumora-gold">
                <Globe size={20} />
              </div>
              <div>
                <h4 className="text-lg font-serif font-bold text-lumora-charcoal">Social Media Connections</h4>
                <p className="text-[10px] text-lumora-taupe uppercase tracking-widest">Master publishing credentials</p>
              </div>
            </div>

            <div className="bg-lumora-bone/20 p-6 border-l-2 border-lumora-gold space-y-3">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-lumora-charcoal flex items-center gap-2">
                <Sparkles size={12} className="text-lumora-gold" />
                Connection Protocol
              </h5>
              <p className="text-[10px] text-lumora-taupe leading-relaxed">
                Accounts connected here are used as secure destination nodes for AI-generated marketing content. When a campaign is approved in the Marketing module, it is dispatched via official developer API keys and secure credentials.
              </p>
            </div>

            <div className="space-y-6">
              {Object.entries(isAccountConnected).map(([platform, connected]) => (
                <div key={platform} className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-lumora-bone/50 border border-black/5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${connected ? 'bg-green-50 text-green-600' : 'bg-lumora-bone text-lumora-taupe'}`}>
                        {platform === 'Instagram' && <Instagram size={18} />}
                        {platform === 'Facebook' && <Facebook size={18} />}
                        {platform === 'Pinterest' && <Pin size={18} />}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-lumora-charcoal">{platform}</p>
                        <p className="text-[9px] text-lumora-taupe uppercase tracking-widest">{connected ? 'Secure API Key Configured' : 'Authentication Required'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleConnection(platform)}
                      className={`px-6 py-2 text-[9px] font-bold uppercase tracking-widest transition-all ${connected ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-lumora-charcoal text-white hover:bg-lumora-gold'}`}
                    >
                      {connected ? 'Revoke Access' : 'Connect Account'}
                    </button>
                  </div>
                  
                  {connected && (
                    <div className="pl-14 pr-4 pb-2 space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div>
                        <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe block mb-1">Developer API Access Token (Encrypted)</label>
                        <input 
                          type="password"
                          value={socialCredentials[platform]?.token || '••••••••••••••••••••••••••••'}
                          disabled
                          className="w-full bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold cursor-not-allowed select-none text-lumora-taupe"
                        />
                      </div>

                      {socialCredentials[platform]?.accountId && (
                        <div>
                          <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe block mb-1">Connected ID ({platform === 'Pinterest' ? 'Board ID' : 'Page ID'})</label>
                          <input 
                            type="text"
                            value={socialCredentials[platform]?.accountId || ''}
                            disabled
                            className="w-full bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold cursor-not-allowed select-none text-lumora-charcoal font-mono"
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe block mb-2">Publishing Profile URL</label>
                        <div className="flex gap-2">
                          <input 
                            type="url"
                            value={accountLinks[platform] || ''}
                            onChange={(e) => handleLinkChange(platform, e.target.value)}
                            className="flex-1 bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold"
                            placeholder={`Enter ${platform} profile URL...`}
                          />
                          <button className="px-3 bg-lumora-gold text-white text-[8px] font-bold uppercase tracking-widest hover:brightness-110 transition-all">
                            Verify
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* ATELIER BRAND CONFIGURATION CARD */}
          <div className="bg-white border border-black/5 p-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-lumora-bone rounded-full text-lumora-gold">
                <Crown size={20} />
              </div>
              <div>
                <h4 className="text-lg font-serif font-bold text-lumora-charcoal">Atelier Brand Identity</h4>
                <p className="text-[10px] text-lumora-taupe uppercase tracking-widest">White-label branding & lookbook setup</p>
              </div>
            </div>

            <div className="bg-lumora-bone/20 p-6 border-l-2 border-lumora-gold space-y-3">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-lumora-charcoal flex items-center gap-2">
                <Sparkles size={12} className="text-lumora-gold" />
                Custom Brand Engine
              </h5>
              <p className="text-[10px] text-lumora-taupe leading-relaxed">
                Configure your bespoke business details. All generated PDF lookbooks, catalogs, and shared customer messages (such as WhatsApp outreach) will automatically compile using your configured brand attributes instead of LUMORA.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe block mb-1">Brand Name</label>
                <input 
                  type="text"
                  value={brandConfig.brandName}
                  onChange={(e) => setBrandConfig(prev => ({ ...prev, brandName: e.target.value }))}
                  className="w-full bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold font-bold text-lumora-charcoal"
                  placeholder="e.g., LORENZO FINE JEWELRY"
                />
              </div>

              <div>
                <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe block mb-1">Brand Subtitle / Est.</label>
                <input 
                  type="text"
                  value={brandConfig.brandSub}
                  onChange={(e) => setBrandConfig(prev => ({ ...prev, brandSub: e.target.value }))}
                  className="w-full bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold text-lumora-charcoal"
                  placeholder="e.g., PRIVATE ATELIER • EST. 1994"
                />
              </div>

              <div>
                <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe block mb-1">Official Website</label>
                <input 
                  type="text"
                  value={brandConfig.website}
                  onChange={(e) => setBrandConfig(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold text-lumora-charcoal"
                  placeholder="e.g., www.lorenzo.com"
                />
              </div>

              <div>
                <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe block mb-1">Atelier Contact Email</label>
                <input 
                  type="email"
                  value={brandConfig.email}
                  onChange={(e) => setBrandConfig(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold text-lumora-charcoal"
                  placeholder="e.g., atelier@lorenzo.com"
                />
              </div>

              <div>
                <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe block mb-1">Contact Phone</label>
                <input 
                  type="text"
                  value={brandConfig.phone}
                  onChange={(e) => setBrandConfig(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold text-lumora-charcoal"
                  placeholder="e.g., +1 (800) LORENZO"
                />
              </div>

              <div>
                <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe block mb-1">Lookbook Tagline</label>
                <input 
                  type="text"
                  value={brandConfig.tagline}
                  onChange={(e) => setBrandConfig(prev => ({ ...prev, tagline: e.target.value }))}
                  className="w-full bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold text-lumora-charcoal"
                  placeholder="e.g., The Masterpiece Collection"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-black/5">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-lumora-charcoal">Lookbook Philosophy & Manifesto</h5>
              
              <div>
                <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe block mb-1">Manifesto Title</label>
                <input 
                  type="text"
                  value={brandConfig.manifestoTitle}
                  onChange={(e) => setBrandConfig(prev => ({ ...prev, manifestoTitle: e.target.value }))}
                  className="w-full bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold text-lumora-charcoal font-serif font-bold italic"
                  placeholder="The Philosophy of Craft"
                />
              </div>

              <div>
                <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe block mb-1">Manifesto Paragraph 1</label>
                <textarea 
                  value={brandConfig.manifestoParagraph1}
                  onChange={(e) => setBrandConfig(prev => ({ ...prev, manifestoParagraph1: e.target.value }))}
                  className="w-full bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold text-lumora-charcoal h-20 resize-none leading-relaxed"
                  placeholder="At our studio, we believe that..."
                />
              </div>

              <div>
                <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe block mb-1">Manifesto Paragraph 2</label>
                <textarea 
                  value={brandConfig.manifestoParagraph2}
                  onChange={(e) => setBrandConfig(prev => ({ ...prev, manifestoParagraph2: e.target.value }))}
                  className="w-full bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold text-lumora-charcoal h-20 resize-none leading-relaxed"
                  placeholder="Each piece in this collection has been..."
                />
              </div>

              <div>
                <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe block mb-1">Manifesto Paragraph 3</label>
                <textarea 
                  value={brandConfig.manifestoParagraph3}
                  onChange={(e) => setBrandConfig(prev => ({ ...prev, manifestoParagraph3: e.target.value }))}
                  className="w-full bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold text-lumora-charcoal h-20 resize-none leading-relaxed"
                  placeholder="From the initial spark of inspiration..."
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-black/5">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-lumora-charcoal">Certificate of Authenticity Note</h5>
              
              <div>
                <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe block mb-1">Certification Statement</label>
                <input 
                  type="text"
                  value={brandConfig.certificateNote1}
                  onChange={(e) => setBrandConfig(prev => ({ ...prev, certificateNote1: e.target.value }))}
                  className="w-full bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold text-lumora-charcoal"
                  placeholder="All pieces featured in this catalog are accompanied by a Certificate of Authenticity"
                />
              </div>

              <div>
                <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe block mb-1">Terms Statement</label>
                <input 
                  type="text"
                  value={brandConfig.certificateNote2}
                  onChange={(e) => setBrandConfig(prev => ({ ...prev, certificateNote2: e.target.value }))}
                  className="w-full bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold text-lumora-charcoal"
                  placeholder="and are subject to the Atelier's standard terms of bespoke craftsmanship."
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-black/5 p-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-lumora-bone rounded-full text-lumora-gold">
                <Lock size={20} />
              </div>
              <div>
                <h4 className="text-lg font-serif font-bold text-lumora-charcoal">Security & AI Engine</h4>
                <p className="text-[10px] text-lumora-taupe uppercase tracking-widest">Core intelligence controls</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-lumora-bone/50 border border-black/5 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-lumora-charcoal uppercase tracking-widest">Gemini AI Protocol</p>
                  <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 bg-green-50 text-green-600 rounded-full flex items-center gap-1">
                    <Check size={8} /> Active
                  </span>
                </div>
                <p className="text-[10px] text-lumora-taupe leading-relaxed">
                  Lumora's design and marketing intelligence is powered by Gemini 3 Flash. This engine processes visual assets and trends to generate bespoke narratives.
                </p>
                <div className="pt-4 border-t border-black/5">
                  <button 
                    onClick={async () => {
                      // @ts-ignore
                      if (typeof window.aistudio !== 'undefined') {
                        // @ts-ignore
                        await window.aistudio.openSelectKey();
                      }
                    }}
                    className="w-full py-4 bg-white text-lumora-charcoal text-[9px] font-bold uppercase tracking-widest border border-black/10 hover:bg-black/5 transition-all shadow-sm"
                  >
                    Rekey AI Engine
                  </button>
                </div>
              </div>

              <div className="p-6 border border-black/5 space-y-4">
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-lumora-charcoal">Account Configuration Audit</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-lumora-taupe">Last Security Audit</span>
                    <span className="text-[10px] font-bold text-lumora-charcoal">Apr 24, 2026</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-lumora-taupe">Authorized Domains</span>
                    <span className="text-[10px] font-bold text-lumora-gold">lumora.luxury</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-lumora-taupe">Two-Factor Auth</span>
                    <span className="text-[10px] font-bold text-green-600">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PUBLICATION FEED HISTORY */}
      <div className="bg-white border border-black/5 p-10 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-lg font-serif font-bold text-lumora-charcoal">Direct Publication History</h4>
            <p className="text-[10px] text-lumora-taupe uppercase tracking-widest mt-1">Audit log of campaigns published to live developer endpoints</p>
          </div>
          <span className="text-[8px] font-bold uppercase tracking-widest bg-lumora-bone px-3 py-1.5 border border-black/5">
            {socialPublishHistory.length} Total Posts
          </span>
        </div>

        {socialPublishHistory.length === 0 ? (
          <div className="border border-dashed border-black/10 py-12 text-center text-lumora-taupe">
            <Globe className="mx-auto mb-3 opacity-30" size={24} />
            <p className="text-[11px] font-serif italic">No social publications recorded yet.</p>
            <p className="text-[8px] uppercase tracking-widest mt-1">Connect your developer keys and publish an item to generate live logs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="py-3 text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Timestamp</th>
                  <th className="py-3 text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Masterpiece</th>
                  <th className="py-3 text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Platform</th>
                  <th className="py-3 text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Caption Summary</th>
                  <th className="py-3 text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Transaction Hash (API)</th>
                  <th className="py-3 text-[8px] uppercase font-bold tracking-widest text-lumora-taupe text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03]">
                {socialPublishHistory.map((log) => (
                  <tr key={log.id} className="text-[11px] hover:bg-lumora-bone/10 transition-colors">
                    <td className="py-4 text-lumora-charcoal font-medium">{log.timestamp}</td>
                    <td className="py-4 font-serif font-bold text-lumora-charcoal">{log.productName}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest rounded-full ${
                        log.platform === 'Pinterest' ? 'bg-[#BD081C]/5 text-[#BD081C]' :
                        log.platform === 'Instagram' ? 'bg-[#DD2A7B]/5 text-[#DD2A7B]' :
                        'bg-[#1877F2]/5 text-[#1877F2]'
                      }`}>
                        {log.platform}
                      </span>
                    </td>
                    <td className="py-4 max-w-xs truncate text-lumora-taupe" title={log.message}>{log.message}</td>
                    <td className="py-4 font-mono text-[9px] text-lumora-taupe">{log.txId}</td>
                    <td className="py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-green-600">
                        <CheckCircle2 size={10} /> {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

interface ConceptMetadata {
  name: string;
  story: string;
  marketAlignment: string;
  trendAlignment: string;
  targetPersona: string;
  materials: string[];
  marketingHook: string;
  complexity: 'Low' | 'Medium' | 'High';
  estimatedValue: number;
  productionTime: string;
}

const CreativeStudioView: React.FC<{ 
  products: Product[];
  resellers?: Reseller[];
  onSave?: (img: string, metadata: ConceptMetadata) => void;
  onInitiateCommission?: (img: string, metadata: ConceptMetadata) => void;
  onUpdateProductImage?: (productId: string, newImage: string) => void;
}> = ({ products, resellers = [], onSave, onInitiateCommission, onUpdateProductImage }) => {
  const [studioMode, setStudioMode] = useState<'concept' | 'ad' | 'illustration'>('concept');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [adVariations, setAdVariations] = useState<{ id: string; url: string; prompt: string; type: string }[]>([]);
  const [generatingAds, setGeneratingAds] = useState(false);
  const [illustrations, setIllustrations] = useState<{
    [key in 'pencil' | 'charcoal' | 'ink' | 'watercolor']: {
      url: string;
      status: 'idle' | 'loading' | 'success' | 'error';
      error?: string;
      caption?: string;
      published?: boolean;
    }
  }>({
    pencil: { url: '', status: 'idle' },
    charcoal: { url: '', status: 'idle' },
    ink: { url: '', status: 'idle' },
    watercolor: { url: '', status: 'idle' }
  });

  const [prompt, setPrompt] = useState('');
  const [aspect, setAspect] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [result, setResult] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ConceptMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const dossierRef = useRef<HTMLDivElement>(null);

  // Business Growth & Simplification States
  const [targetMargin, setTargetMargin] = useState<number>(60);
  const [targetSegment, setTargetSegment] = useState<string>('VVIP Collector');
  const [clientReference, setClientReference] = useState<string>('');
  const [selectedPartner, setSelectedPartner] = useState<string>('RES-001');
  const [sharingStatus, setSharingStatus] = useState<'idle' | 'sharing' | 'done'>('idle');

  const DESIGN_TEMPLATES = [
    {
      title: "Royal Sapphire Choker",
      prompt: "A magnificent Victorian-inspired collar necklace crafted from interlocking petals of 18k Rose Gold, encrusted with brilliant-cut diamonds and centered with a pear-shaped royal blue sapphire.",
      segment: "VVIP Collector",
      margin: 70
    },
    {
      title: "Solitaire Chevron Ring",
      prompt: "An architectural platinum ring with a high-set flawless radiant-cut emerald flanked by chevron-patterned baguette-cut micro-diamonds.",
      segment: "Millennial Bridal",
      margin: 60
    },
    {
      title: "Sovereign Heritage Drop",
      prompt: "Baroque-style chandelier earrings sculpted in 22k brushed gold, holding rare teardrop Tahitian pearls and micro-pave yellow diamonds.",
      segment: "VVIP Collector",
      margin: 80
    },
    {
      title: "Cosmic Starlight Bangle",
      prompt: "A sleek, modernist open cuff bangle in black gold, inset with a constellation of hand-cut diamonds that twinkle with natural movement.",
      segment: "Everyday Luxury",
      margin: 50
    },
    {
      title: "Sculptural Ribbon Studs",
      prompt: "Abstract, sculptural ribbon ear-studs in high-polished 18k yellow gold that gracefully curve around the lobe, catching light from all angles.",
      segment: "Everyday Luxury",
      margin: 50
    },
    {
      title: "Emerald Serenade Ring",
      prompt: "An exquisite cocktail ring featuring a deep Colombian emerald surrounded by a staggered halo of marquise diamonds in platinum.",
      segment: "High Fashion Red Carpet",
      margin: 75
    }
  ];

  const applyTemplate = (tmpl: typeof DESIGN_TEMPLATES[0]) => {
    setPrompt(tmpl.prompt);
    setTargetSegment(tmpl.segment);
    setTargetMargin(tmpl.margin);
  };

  const generate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setMetadata(null);
    setVideoUrl(null);
    try {
      await ensurePaidKey();
      const apiKey = getApiKey();
      if (!apiKey) {
        alert("Gemini API key is not configured. Please check your environment settings.");
        setLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      
      // 1. Generate Image via server endpoint
      const imageResponse = await fetch('/api/gemini/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `High-end luxury jewelry masterpiece: ${prompt}. Cinematic lighting, macro photography, white background, 8k resolution.`,
          aspectRatio: aspect
        }),
      });

      if (!imageResponse.ok) {
        const errData = await imageResponse.json();
        throw new Error(errData.error || 'Failed to generate image');
      }

      const imgResult = await imageResponse.json();
      if (imgResult.imageUrl) {
        const imgData = imgResult.imageUrl;
        setResult(imgData);

        const ai = new GoogleGenAI({ apiKey });
        
        const promptText = `Analyze this jewelry concept prompt: "${prompt}". 
        The target luxury customer segment is: "${targetSegment}".
        The target retail markup margin is: "${targetMargin}%".
        ${clientReference ? `The custom client reference name is: "${clientReference}". Personalize the brand narrative and target persona directly to honor this client.` : ''}

        Provide a strategic business dossier in JSON format with these fields:
        - name: A luxury, evocative name for the piece.
        - story: A 2-sentence romanticized brand story customized for this client or segment.
        - marketAlignment: Why this piece is strategically valuable and how it achieves the target margin.
        - trendAlignment: Analysis of how this fits 2026 luxury jewelry trends.
        - targetPersona: Description of the ideal buyer profile for this piece.
        - materials: Array of 3-4 premium materials suggested.
        - marketingHook: A one-line catchy social media headline.
        - complexity: One of "Low", "Medium", "High".
        - estimatedValue: A realistic luxury price in USD (number, between $5,000 and $150,000).
        - productionTime: Estimated crafting time (e.g. "8-12 weeks").`;

        // 2. Generate Strategic Metadata
        const metadataResponse = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: promptText,
          config: { responseMimeType: 'application/json' }
        });

        const meta = JSON.parse(metadataResponse.text || '{}');
        setMetadata({
          name: meta.name || 'Untitled Masterpiece',
          story: meta.story || 'A timeless expression of Lumora artistry.',
          marketAlignment: meta.marketAlignment || 'Aligns with current high-jewelry trends.',
          trendAlignment: meta.trendAlignment || 'Reflects current sculptural luxury trends.',
          targetPersona: meta.targetPersona || 'Discerning collectors.',
          materials: meta.materials || ['18k Gold', 'VVS Diamonds'],
          marketingHook: meta.marketingHook || 'Timeless elegance redefined.',
          complexity: meta.complexity || 'Medium',
          estimatedValue: meta.estimatedValue || 15000,
          productionTime: meta.productionTime || '6-8 weeks'
        });
      } else {
        alert("The AI was unable to generate an image. Please try a more descriptive prompt.");
      }
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('permission') || e.message?.includes('403') || e.message?.includes('not found')) {
        alert("API Permission Error: Your current key may not have access to this model. Please select a paid API key with appropriate permissions.");
        // @ts-ignore
        await window.aistudio?.openSelectKey();
      } else {
        alert("An error occurred during generation. Please check your API key and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const generateAds = async () => {
    if (!selectedImage) return;
    setGeneratingAds(true);
    setAdVariations([]);
    
    const adTypes = [
      { type: 'White Background', prompt: 'Professional jewelry photography on a pure white background, clean, minimalist, studio lighting.' },
      { type: 'Black Background', prompt: 'Dramatic luxury jewelry photography on a solid black background, high contrast, shimmering reflections, spotlight.' },
      { type: 'Lifestyle Ad', prompt: 'Elegant lifestyle advertisement, jewelry worn by a sophisticated model in a high-end setting, soft natural light.' },
      { type: 'Creative Concept', prompt: 'Artistic creative ad, jewelry placed on a silk fabric, ethereal atmosphere, luxury brand aesthetic.' },
      { type: 'Website Close-up', prompt: 'Extreme macro close-up for website hero, focusing on the intricate details and brilliance of the gems, ultra-high resolution.' }
    ];

    try {
      await ensurePaidKey();
      const base64Data = selectedImage.includes(',') ? selectedImage.split(',')[1] : selectedImage;

      const variations = [];
      for (const ad of adTypes) {
        const response = await fetch('/api/gemini/edit-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageData: base64Data,
            prompt: `Modify this jewelry image: ${ad.prompt}. Maintain the exact design of the jewelry piece.`
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.imageUrl) {
            variations.push({
              id: Math.random().toString(36).substr(2, 9),
              url: data.imageUrl,
              prompt: ad.prompt,
              type: ad.type
            });
          }
        }
      }
      setAdVariations(variations);
    } catch (e) {
      console.error(e);
      alert("Failed to generate ad variations. Please check your API key.");
    } finally {
      setGeneratingAds(false);
    }
  };

  const updateAdPrompt = async (id: string, newPrompt: string) => {
    setGeneratingAds(true);
    try {
      const base64Data = selectedImage!.split(',')[1];

      const response = await fetch('/api/gemini/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: base64Data,
          prompt: `Modify this jewelry image: ${newPrompt}. Maintain the exact design of the jewelry piece.`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          setAdVariations(prev => prev.map(v => v.id === id ? { ...v, url: data.imageUrl, prompt: newPrompt } : v));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingAds(false);
    }
  };

  const generateIllustration = async () => {
    if (!selectedImage || !selectedProduct) return;
    
    const styles: ('pencil' | 'charcoal' | 'ink' | 'watercolor')[] = ['pencil', 'charcoal', 'ink', 'watercolor'];
    
    setIllustrations({
      pencil: { url: '', status: 'loading' },
      charcoal: { url: '', status: 'loading' },
      ink: { url: '', status: 'loading' },
      watercolor: { url: '', status: 'loading' }
    });
    
    const stylePrompts = {
      pencil: "High-end jewelry illustration, professional color pencil sketch on textured paper, delicate shading, fine lines, artistic and detailed.",
      charcoal: "Classical jewelry illustration, deep charcoal and graphite sketch, dramatic shadows, expressive strokes, artistic luxury feel.",
      ink: "Minimalist jewelry illustration, fine-tip fountain ink and wash, clean architectural lines, sophisticated black and white study.",
      watercolor: "Ethereal jewelry illustration, soft watercolor and ink wash, artistic splashes, romantic and dreamlike luxury presentation."
    };

    const styleCaptions = {
      pencil: `Unveiling the artisanal color pencil study of ${selectedProduct.name}. A masterpiece of precision, capturing the delicate luster of premium metals and hand-set brilliants. Crafted in the Lumora Atelier. #LumoraCraftsmanship #BespokeJewelry #AtelierStudy`,
      charcoal: `Chiaroscuro elegance. The classical charcoal sketch of ${selectedProduct.name} explores deep architectural contrast, dramatic shadows, and hand-sketched texture. #LuxuryArtistry #FineJewelry #CharcoalSketch`,
      ink: `Architectural pure ink draft. A minimalist study of ${selectedProduct.name} showcasing pure linework, technical jewelry symmetry, and timeless structural poise. #ModernMinimalism #JewelryDesign #InkWash`,
      watercolor: `A romantic watercolor wash of ${selectedProduct.name}. Ethereal tones and artistic soft splashes bring this unique piece to life on textured watercolor paper. #EtherealLuxury #ArtisanWatercolor #AtelierJewelry`
    };

    try {
      await ensurePaidKey();
      const base64Data = selectedImage.includes(',') ? selectedImage.split(',')[1] : selectedImage;

      // Start all in parallel
      styles.forEach(async (style) => {
        try {
          const response = await fetch('/api/gemini/edit-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageData: base64Data,
              prompt: `Transform this jewelry image into a ${stylePrompts[style]}. Maintain the exact structure and design of the piece while applying the artistic illustration style.`
            }),
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Failed to generate');
          }

          const data = await response.json();
          if (data.imageUrl) {
            setIllustrations(prev => ({
              ...prev,
              [style]: { 
                url: data.imageUrl, 
                status: 'success',
                caption: styleCaptions[style],
                published: false
              }
            }));
          } else {
            throw new Error("No image data returned from AI");
          }
        } catch (error: any) {
          console.error(`Error generating style ${style}:`, error);
          setIllustrations(prev => ({
            ...prev,
            [style]: { url: '', status: 'error', error: error.message || 'Generation failed' }
          }));
        }
      });
    } catch (e: any) {
      console.error(e);
      alert("Failed to connect to the illustration engine. Please check your connection and try again.");
      setIllustrations({
        pencil: { url: '', status: 'error', error: e.message },
        charcoal: { url: '', status: 'error', error: e.message },
        ink: { url: '', status: 'error', error: e.message },
        watercolor: { url: '', status: 'error', error: e.message }
      });
    }
  };

  const downloadAllIllustrations = () => {
    const activeStyles = (['pencil', 'charcoal', 'ink', 'watercolor'] as const).filter(
      style => illustrations[style].status === 'success' && illustrations[style].url
    );
    if (activeStyles.length === 0) {
      alert("No generated illustrations available to download yet.");
      return;
    }
    activeStyles.forEach(style => {
      const item = illustrations[style];
      const link = document.createElement('a');
      link.href = item.url;
      link.download = `lumora_${selectedProduct?.name.toLowerCase().replace(/\s+/g, '_')}_${style}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    alert(`Downloaded ${activeStyles.length} luxury sketch files!`);
  };

  const publishAllIllustrations = () => {
    const activeStyles = (['pencil', 'charcoal', 'ink', 'watercolor'] as const).filter(
      style => illustrations[style].status === 'success' && illustrations[style].url && !illustrations[style].published
    );
    if (activeStyles.length === 0) {
      alert("No new generated illustrations available to publish.");
      return;
    }
    if (!selectedProduct || !onUpdateProductImage) return;

    activeStyles.forEach(style => {
      const item = illustrations[style];
      onUpdateProductImage(selectedProduct.id, item.url);
    });

    setIllustrations(prev => {
      const updated = { ...prev };
      activeStyles.forEach(style => {
        updated[style] = { ...updated[style], published: true };
      });
      return updated;
    });

    alert(`Successfully published all ${activeStyles.length} illustrations to the ${selectedProduct.name} catalog website gallery!`);
  };

  const generateRevealVideo = async () => {
    if (!result || !metadata) return;
    
    setVideoLoading(true);
    try {
      await ensurePaidKey();
      const apiKey = getApiKey();
      if (!apiKey) {
        alert("API key required for video generation.");
        setVideoLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const base64Data = result.split(',')[1];
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `A slow, cinematic 360-degree rotation reveal of this jewelry piece: ${metadata.name}. Shimmering light reflections, elegant movement, high-end luxury commercial style.`,
        image: {
          imageBytes: base64Data,
          mimeType: 'image/png'
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspect === '1:1' ? '16:9' : aspect // Veo likes 16:9 or 9:16
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: { 'x-goog-api-key': apiKey }
        });
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('permission') || e.message?.includes('403') || e.message?.includes('not found')) {
        alert("API Permission Error: Your current key may not have access to video generation. Please select a paid API key.");
        // @ts-ignore
        await window.aistudio?.openSelectKey();
      } else {
        alert("Video generation failed. Please try again.");
      }
    } finally {
      setVideoLoading(false);
    }
  };

  const exportDossier = async () => {
    if (!metadata || !result) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(20, 20, 20);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('LUMORA CONCEPT DOSSIER', 20, 25);
    doc.setFontSize(10);
    doc.text(new Date().toLocaleDateString(), 170, 25);

    // Image
    doc.addImage(result, 'PNG', 20, 50, 80, 80);

    // Details
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(18);
    doc.text(metadata.name.toUpperCase(), 110, 60);
    
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text('ESTIMATED VALUE', 110, 75);
    doc.setTextColor(190, 155, 100);
    doc.setFontSize(14);
    doc.text(`$${metadata.estimatedValue.toLocaleString()}`, 110, 82);

    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text('PRODUCTION TIME', 110, 95);
    doc.setTextColor(20, 20, 20);
    doc.text(metadata.productionTime, 110, 102);

    doc.setTextColor(120, 120, 120);
    doc.text('COMPLEXITY', 110, 115);
    doc.setTextColor(20, 20, 20);
    doc.text(metadata.complexity, 110, 122);

    doc.setTextColor(120, 120, 120);
    doc.text('TARGET SEGMENT', 110, 133);
    doc.setTextColor(20, 20, 20);
    doc.text(targetSegment, 110, 139);

    // Story
    doc.setTextColor(120, 120, 120);
    doc.text('BRAND NARRATIVE', 20, 150);
    doc.setTextColor(20, 20, 20);
    const storyLines = doc.splitTextToSize(metadata.story, 170);
    doc.text(storyLines, 20, 157);

    // Materials
    doc.setTextColor(120, 120, 120);
    doc.text('SUGGESTED MATERIALS', 20, 180);
    doc.setTextColor(20, 20, 20);
    doc.text(metadata.materials.join(', '), 20, 187);

    // Trend Alignment
    doc.setTextColor(120, 120, 120);
    doc.text('TREND ALIGNMENT', 20, 202);
    doc.setTextColor(20, 20, 20);
    const trendLines = doc.splitTextToSize(metadata.trendAlignment, 170);
    doc.text(trendLines, 20, 209);

    // Marketing Hook
    doc.setTextColor(120, 120, 120);
    doc.text('MARKETING HOOK', 20, 232);
    doc.setTextColor(190, 155, 100);
    doc.text(`"${metadata.marketingHook}"`, 20, 239);

    doc.save(`Lumora_Concept_${metadata.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex justify-center mb-12">
        <div className="bg-white border border-black/5 p-1 rounded-full flex gap-1 shadow-sm">
          <button 
            onClick={() => setStudioMode('concept')}
            className={`px-8 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${studioMode === 'concept' ? 'bg-lumora-charcoal text-white' : 'text-lumora-taupe hover:text-lumora-charcoal'}`}
          >
            Concept Lab
          </button>
          <button 
            onClick={() => setStudioMode('ad')}
            className={`px-8 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${studioMode === 'ad' ? 'bg-lumora-charcoal text-white' : 'text-lumora-taupe hover:text-lumora-charcoal'}`}
          >
            Ad Studio
          </button>
          <button 
            onClick={() => setStudioMode('illustration')}
            className={`px-8 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${studioMode === 'illustration' ? 'bg-lumora-charcoal text-white' : 'text-lumora-taupe hover:text-lumora-charcoal'}`}
          >
            Atelier Illustration
          </button>
        </div>
      </div>

      {studioMode === 'concept' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-in fade-in duration-500">
          {/* Left Column: Concept Cockpit (xl:col-span-5) */}
          <div className="xl:col-span-5 space-y-6">
            <div className="bg-white border border-black/5 p-6 md:p-8 rounded-sm shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-black/5 pb-4 gap-2">
                <div>
                  <h3 className="text-xl font-serif font-bold text-lumora-charcoal flex items-center gap-2">
                    <Sparkles size={20} className="text-lumora-gold" />
                    Concept Cockpit
                  </h3>
                  <p className="text-[9px] text-lumora-taupe uppercase font-bold tracking-widest mt-1">Configure Bespoke Creative Strategies & Visuals</p>
                </div>
                
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-[7px] uppercase font-bold tracking-widest text-lumora-taupe">Active Aspect</p>
                    <p className="text-xs font-bold text-lumora-charcoal uppercase tracking-wider">{aspect}</p>
                  </div>
                  <div className="border-l border-black/10 pl-4 text-right">
                    <p className="text-[7px] uppercase font-bold tracking-widest text-emerald-600">Active Margin</p>
                    <p className="text-xs font-bold text-emerald-600">{targetMargin}%</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {/* I. Creative Design Vision */}
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-lumora-taupe flex items-center gap-1.5">
                    <span className="font-serif italic text-xs text-lumora-gold font-bold">I.</span>
                    <span>Creative Design Vision</span>
                  </label>
                  <textarea 
                    className="w-full min-h-[120px] bg-lumora-bone border-none text-xs p-4 focus:ring-1 focus:ring-lumora-gold resize-none focus:outline-none placeholder-lumora-taupe/60 rounded-sm font-sans leading-relaxed"
                    placeholder="Describe your design masterpiece: e.g. A magnificent Art Deco emerald ring wrapped in asymmetric floating diamonds..."
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                  />
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-1.5">
                  <p className="text-[8px] uppercase tracking-widest text-lumora-taupe font-bold">Aspect Ratio</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['1:1', '16:9', '9:16'].map(a => (
                      <button 
                        key={a}
                        onClick={() => setAspect(a as any)}
                        className={`py-2 text-[10px] font-bold border transition-all rounded-xs ${aspect === a ? 'bg-lumora-charcoal text-white border-lumora-charcoal' : 'bg-white text-lumora-taupe border-black/10 hover:border-lumora-charcoal'}`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                {/* II. Aesthetic Inspirations */}
                <div className="space-y-2.5 pt-4 border-t border-black/5">
                  <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-lumora-taupe flex items-center gap-1.5">
                    <span className="font-serif italic text-xs text-lumora-gold font-bold">II.</span>
                    <span>Aesthetic Inspirations</span>
                  </label>
                  <p className="text-[8px] text-lumora-taupe italic">Select a curated luxury starting style below to instantly fill the cockpit parameters.</p>
                  <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {DESIGN_TEMPLATES.map((tmpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => applyTemplate(tmpl)}
                        className={`p-2.5 text-left bg-lumora-bone hover:bg-lumora-gold/10 border border-black/5 rounded-sm transition-all text-lumora-charcoal flex items-center gap-1.5 hover:border-lumora-gold/30 group duration-200 ${prompt === tmpl.prompt ? 'border-lumora-gold bg-lumora-gold/5' : ''}`}
                        title={tmpl.title}
                      >
                        <span className="text-lumora-gold font-bold">✦</span>
                        <span className="truncate font-sans font-semibold uppercase tracking-wider text-[8px]">{tmpl.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* III. Commercial Specs */}
                <div className="space-y-3.5 pt-4 border-t border-black/5">
                  <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-lumora-taupe flex items-center gap-1.5">
                    <span className="font-serif italic text-xs text-lumora-gold font-bold">III.</span>
                    <span>Commercial Specs</span>
                  </label>

                  {/* Customer Persona */}
                  <div className="space-y-1">
                    <p className="text-[7px] uppercase tracking-widest text-lumora-taupe">Customer Persona</p>
                    <select
                      value={targetSegment}
                      onChange={e => setTargetSegment(e.target.value)}
                      className="w-full bg-lumora-bone text-[10px] p-2.5 focus:ring-1 focus:ring-lumora-gold border-none rounded-none font-bold text-lumora-charcoal uppercase tracking-wider focus:outline-none"
                    >
                      {['VVIP Collector', 'Millennial Bridal', 'High Fashion Red Carpet', 'Everyday Luxury'].map(seg => (
                        <option key={seg} value={seg}>{seg}</option>
                      ))}
                    </select>
                  </div>

                  {/* Target Gross Margin */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="text-[7px] uppercase tracking-widest text-lumora-taupe font-bold">Target Gross Margin</p>
                      <span className="text-[9px] font-bold text-emerald-600">{targetMargin}%</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {[40, 50, 60, 70, 80].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setTargetMargin(m)}
                          className={`py-1.5 text-[8px] font-bold border transition-all rounded-xs ${targetMargin === m ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white text-lumora-taupe border-black/10 hover:border-emerald-500'}`}
                        >
                          {m}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Client Reference */}
                  <div className="space-y-1">
                    <p className="text-[7px] uppercase tracking-widest text-lumora-taupe font-bold">Bespoke Client Reference</p>
                    <input 
                      type="text"
                      className="w-full bg-lumora-bone border-none text-[10px] p-2.5 focus:ring-1 focus:ring-lumora-gold focus:outline-none rounded-xs"
                      placeholder="e.g. Lady Victoria"
                      value={clientReference}
                      onChange={e => setClientReference(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  onClick={generate}
                  disabled={loading}
                  className="w-full bg-lumora-charcoal hover:bg-lumora-gold text-white py-4 px-4 text-[10px] font-bold uppercase tracking-[0.25em] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm rounded-xs mt-4 active:scale-98"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={13} />
                      Synthesizing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      Generate Concept Suite
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Output Panel / Presentation Theater (xl:col-span-7) */}
          <div className="xl:col-span-7 space-y-6">
            {!result ? (
              /* Pre-Generation Slate */
              <div className="bg-white border border-black/5 p-12 text-center rounded-sm shadow-sm space-y-10 min-h-[550px] flex flex-col justify-center animate-in fade-in duration-700">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 bg-lumora-gold/5 rounded-full flex items-center justify-center mx-auto border border-lumora-gold/10">
                    <Sparkles size={24} className="text-lumora-gold animate-pulse" />
                  </div>
                  <h4 className="text-xl font-serif font-bold text-lumora-charcoal">Concept Presentation Theater</h4>
                  <p className="text-xs text-lumora-taupe leading-relaxed">
                    Welcome to the Lumora visual projection stage. Select an aesthetic starting template from the cockpit on the left, or articulate a custom creative vision to render photorealistic imagery, calculate margins, and compile luxury client dossiers.
                  </p>
                </div>
              </div>
            ) : (
              /* Active Stage and Dossier */
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* Real-time Business Health Ribbon */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border border-black/5 p-5 rounded-sm shadow-sm">
                  <div className="border-r border-black/5 pr-4 last:border-none">
                    <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Target Segment</p>
                    <p className="text-xs font-bold text-lumora-charcoal mt-1 uppercase tracking-wider truncate">{targetSegment}</p>
                  </div>
                  <div className="border-r border-black/5 pr-4 last:border-none md:pl-4">
                    <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Proposed MSRP</p>
                    <p className="text-sm font-serif font-bold text-lumora-charcoal mt-1">${metadata?.estimatedValue.toLocaleString()}</p>
                  </div>
                  <div className="border-r border-black/5 pr-4 last:border-none md:pl-4">
                    <p className="text-[8px] uppercase font-bold tracking-widest text-emerald-600 flex items-center gap-1">
                      <TrendingUp size={10} />
                      <span>Gross Margin</span>
                    </p>
                    <p className="text-sm font-serif font-bold text-emerald-600 mt-1">{targetMargin}% Gross</p>
                  </div>
                  <div className="md:pl-4">
                    <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-gold">Lead Time</p>
                    <p className="text-xs font-bold text-lumora-gold mt-1 uppercase tracking-wide truncate">{metadata?.productionTime}</p>
                  </div>
                </div>

                {/* Main Large Visual Stage */}
                <div className="bg-white border border-black/5 p-4 rounded-sm shadow-sm space-y-4">
                  <div className={`mx-auto bg-black/95 border border-black/15 shadow-inner rounded-sm flex items-center justify-center overflow-hidden relative group w-full ${
                    aspect === '16:9' ? 'aspect-video' : aspect === '9:16' ? 'aspect-[9/16] max-h-[550px]' : 'aspect-square'
                  }`}>
                    {videoUrl ? (
                      <video src={videoUrl} autoPlay loop muted className="w-full h-full object-cover animate-in fade-in duration-1000" />
                    ) : result ? (
                      <img src={result} className="w-full h-full object-contain animate-in fade-in duration-1000" alt="Concept Masterpiece" />
                    ) : null}
                    
                    {result && !videoUrl && !videoLoading && (
                      <button 
                        onClick={generateRevealVideo}
                        className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-lumora-gold hover:scale-105 transform active:scale-95"
                        title="Generate Cinematic Reveal"
                      >
                        <Video size={20} />
                      </button>
                    )}

                    {(loading || videoLoading) && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center flex-col gap-4 z-10">
                        <div className="w-12 h-12 border-2 border-lumora-gold border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs uppercase font-bold tracking-widest text-lumora-gold animate-pulse">
                          {videoLoading ? 'Orchestrating Cinematic Reveal...' : 'Rendering Architectural Details...'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                    <button 
                      onClick={exportDossier}
                      className="py-3.5 bg-white border border-black/10 text-[9px] font-bold uppercase tracking-widest hover:bg-black/[0.02] transition-all flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Download size={14} className="text-lumora-taupe" /> Export Dossier PDF
                    </button>
                    <button 
                      onClick={() => onInitiateCommission?.(result, metadata!)}
                      className="py-3.5 bg-lumora-bone border border-lumora-gold/20 text-lumora-gold text-[9px] font-bold uppercase tracking-widest hover:bg-lumora-gold hover:text-white transition-all flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Wand2 size={14} /> Initiate Commission
                    </button>
                    <button 
                      onClick={() => onSave?.(result, metadata!)}
                      className="py-3.5 bg-lumora-charcoal text-white text-[9px] font-bold uppercase tracking-widest hover:bg-lumora-gold transition-all flex items-center justify-center gap-2 active:scale-98"
                    >
                      Save Portfolio
                    </button>
                  </div>
                </div>

                {/* Exquisite Dossier Sheet - Full Width */}
                <div ref={dossierRef} className="bg-lumora-bone p-8 md:p-10 border border-black/5 rounded-sm shadow-xs space-y-8 text-left">
                  {clientReference && (
                    <div className="bg-lumora-gold/5 border border-lumora-gold/20 py-3 px-4 rounded-sm text-center">
                      <p className="text-[8px] font-bold text-lumora-gold uppercase tracking-[0.25em]">⚜️ EXCLUSIVE PRIVATE PRESENTATION DOSSIER ⚜️</p>
                      <p className="text-xs font-serif font-bold text-lumora-charcoal mt-1">TAILORED SPECIALLY FOR {clientReference.toUpperCase()}</p>
                    </div>
                  )}

                  {/* Header Info block */}
                  <div className="border-b border-black/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-gold">Strategic Design Masterwork</p>
                      <h4 className="text-2xl font-serif font-bold text-lumora-charcoal leading-tight">{metadata?.name}</h4>
                    </div>
                    <div className="text-[9px] text-lumora-taupe uppercase tracking-widest font-mono text-right bg-white px-3 py-1.5 border border-black/5 rounded-sm">
                      MSRP: <span className="text-lumora-charcoal font-bold font-serif text-xs">${metadata?.estimatedValue.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Main Dossier Content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Creative Brand Narrative</p>
                        <p className="text-xs text-lumora-charcoal italic leading-relaxed bg-white/40 p-4 border border-black/[0.01] rounded-sm font-serif">
                          "{metadata?.story}"
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Artisanal Material Specifications</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {metadata?.materials.map((m, i) => (
                            <span key={i} className="text-[9px] bg-white border border-black/5 px-2.5 py-1.5 rounded-sm text-lumora-charcoal font-medium shadow-xs">
                              ✦ {m}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">2026 Trend Alignment & Outlook</p>
                        <p className="text-[11px] text-lumora-charcoal leading-relaxed bg-white/40 p-4 rounded-sm border border-black/[0.01]">
                          {metadata?.trendAlignment}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Financial Plan Box */}
                      <div className="bg-white p-6 border border-black/5 rounded-sm space-y-4 shadow-xs">
                        <p className="text-[9px] uppercase font-bold tracking-widest text-emerald-600 flex items-center gap-1.5 border-b border-black/5 pb-2">
                          <Calculator size={11} />
                          <span>Commercial Valuation Matrix</span>
                        </p>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-3 bg-lumora-bone/40 border border-black/[0.01] rounded-xs">
                            <p className="text-[7px] uppercase font-bold tracking-widest text-lumora-taupe">Retail (MSRP)</p>
                            <p className="text-[11px] font-serif font-bold text-lumora-charcoal mt-1">
                              ${metadata?.estimatedValue.toLocaleString()}
                            </p>
                          </div>
                          <div className="p-3 bg-lumora-bone/40 border border-black/[0.01] rounded-xs">
                            <p className="text-[7px] uppercase font-bold tracking-widest text-lumora-taupe">Target COGS</p>
                            <p className="text-[11px] font-serif font-bold text-lumora-charcoal mt-1">
                              ${Math.round(metadata!.estimatedValue * (1 - targetMargin / 100)).toLocaleString()}
                            </p>
                          </div>
                          <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xs">
                            <p className="text-[7px] uppercase font-bold tracking-widest text-emerald-600">Net Profit</p>
                            <p className="text-[11px] font-serif font-bold text-emerald-700 mt-1">
                              ${Math.round(metadata!.estimatedValue * (targetMargin / 100)).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Cost vs profit ratio slider */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between text-[7px] uppercase font-bold text-lumora-taupe">
                            <span>COGS Ratio: {100 - targetMargin}%</span>
                            <span>Target Profit Margin: {targetMargin}%</span>
                          </div>
                          <div className="w-full h-2 bg-lumora-bone rounded-full overflow-hidden flex">
                            <div className="bg-lumora-taupe/30 h-full" style={{ width: `${100 - targetMargin}%` }} />
                            <div className="bg-emerald-600 h-full" style={{ width: `${targetMargin}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Target Collector Persona</p>
                        <p className="text-[11px] text-lumora-charcoal leading-relaxed bg-white/40 p-4 rounded-sm border border-black/[0.01]">
                          <strong>Primary Archetype:</strong> {metadata?.targetPersona}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Bespoke Market Placement</p>
                        <p className="text-[11px] text-lumora-charcoal leading-relaxed bg-white/40 p-4 rounded-sm border border-black/[0.01]">
                          {metadata?.marketAlignment}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* B2B Reseller Pitch Banner */}
                  <div className="bg-white p-6 border border-black/5 rounded-sm space-y-4 shadow-xs pt-6">
                    <div className="flex flex-wrap justify-between items-center border-b border-black/5 pb-3 gap-2">
                      <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-gold flex items-center gap-2">
                        <Handshake size={14} />
                        <span>B2B Global Buying Desk Pitch Terminal</span>
                      </p>
                      <span className="text-[8px] bg-lumora-gold/10 text-lumora-gold px-2.5 py-1 rounded-sm uppercase font-bold tracking-widest">
                        Wholesale Distribution Leads
                      </span>
                    </div>
                    <p className="text-[11px] text-lumora-taupe leading-relaxed">
                      Transmit this comprehensive luxury design dossier directly to the buying committees of selective high-end partner boutiques worldwide to secure commercial pre-orders and stock allotment agreements.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <select
                        value={selectedPartner}
                        onChange={(e) => setSelectedPartner(e.target.value)}
                        className="flex-1 text-[11px] bg-lumora-bone border border-black/10 px-3 py-3 uppercase font-bold tracking-widest rounded-none focus:outline-none focus:ring-1 focus:ring-lumora-gold"
                      >
                        {resellers.length > 0 ? (
                          resellers.map(r => (
                            <option key={r.id} value={r.id}>{r.name} ({r.location})</option>
                          ))
                        ) : (
                          <>
                            <option value="RES-001">Avenue Montaigne Luxury (Paris)</option>
                            <option value="RES-002">Harrods Fine Jewellery (London)</option>
                          </>
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setSharingStatus('sharing');
                          setTimeout(() => {
                            setSharingStatus('done');
                          }, 2000);
                        }}
                        disabled={sharingStatus !== 'idle'}
                        className="bg-lumora-charcoal text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-lumora-gold transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-98"
                      >
                        {sharingStatus === 'sharing' ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            Transmitting...
                          </>
                        ) : sharingStatus === 'done' ? (
                          <>
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            Pitch Transmitted
                          </>
                        ) : (
                          <>
                            <ArrowUpRight size={12} />
                            Submit Wholesale Proposal
                          </>
                        )}
                      </button>
                    </div>

                    {sharingStatus === 'done' && (
                      <div className="text-[10px] text-emerald-600 bg-emerald-50/50 p-4 border border-emerald-100 rounded-sm space-y-1.5 animate-in fade-in duration-300">
                        <p className="font-bold">✓ Strategic dossier & pricing proposal transmitted to {resellers.find(r => r.id === selectedPartner)?.name || 'the buying desk'}.</p>
                        <p className="opacity-90 leading-relaxed font-sans">
                          Suggested retail pricing is set at <strong>${metadata?.estimatedValue.toLocaleString()} USD</strong>, with a partner procurement cost (COGS) of <strong>${Math.round(metadata!.estimatedValue * (1 - targetMargin / 100)).toLocaleString()} USD</strong>, yielding {targetMargin}% target margin.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : studioMode === 'ad' ? (
        <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Selection Panel */}
            <div className="lg:col-span-4 space-y-8 bg-white p-10 border border-black/5 shadow-sm h-fit">
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-lumora-charcoal">Ad Studio</h3>
                <p className="text-[10px] text-lumora-taupe uppercase font-bold tracking-widest">Product Asset Refinement</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-lumora-taupe">Select Product</label>
                  <select 
                    className="w-full bg-lumora-bone border-none text-xs p-4 focus:ring-1 focus:ring-lumora-gold"
                    onChange={(e) => {
                      const product = products.find(p => p.id === e.target.value);
                      setSelectedProduct(product || null);
                      setSelectedImage(product?.images[0] || null);
                    }}
                  >
                    <option value="">Choose a product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {selectedProduct && (
                  <div className="space-y-3">
                    <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-lumora-taupe">Select Base Image</label>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProduct.images.map((img, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setSelectedImage(img)}
                          className={`aspect-square border-2 transition-all overflow-hidden ${selectedImage === img ? 'border-lumora-gold' : 'border-transparent'}`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  onClick={generateAds}
                  disabled={!selectedImage || generatingAds}
                  className="w-full bg-lumora-charcoal text-white py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-lumora-gold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generatingAds ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  Generate Ad Suite (5 Variations)
                </button>
              </div>
            </div>

            {/* Ad Variations Panel */}
            <div className="lg:col-span-8 space-y-8">
              {generatingAds ? (
                <div className="bg-white border border-black/5 p-20 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 border-4 border-lumora-gold border-t-transparent rounded-full animate-spin" />
                  <div>
                    <h4 className="text-xl font-serif font-bold text-lumora-charcoal">Orchestrating Ad Suite</h4>
                    <p className="text-[10px] text-lumora-taupe uppercase tracking-widest mt-2">Applying luxury lighting & artistic compositions...</p>
                  </div>
                </div>
              ) : adVariations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {adVariations.map((ad) => (
                    <div key={ad.id} className="bg-white border border-black/5 p-6 space-y-4 group">
                      <div className="aspect-square bg-lumora-bone overflow-hidden relative">
                        <img src={ad.url} alt="" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button 
                            onClick={() => {
                              if (selectedProduct && onUpdateProductImage) {
                                onUpdateProductImage(selectedProduct.id, ad.url);
                                alert("Image published to website catalog.");
                              }
                            }}
                            className="bg-white text-lumora-charcoal px-4 py-2 text-[9px] font-bold uppercase tracking-widest hover:bg-lumora-gold hover:text-white transition-all"
                          >
                            Publish to Web
                          </button>
                          <button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = ad.url;
                              link.download = `lumora_ad_${ad.type.toLowerCase().replace(/\s+/g, '_')}.png`;
                              link.click();
                            }}
                            className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white hover:text-lumora-charcoal transition-all"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                        <div className="absolute top-2 left-2 bg-lumora-charcoal/80 backdrop-blur-sm text-white px-2 py-1 text-[8px] font-bold uppercase tracking-widest">
                          {ad.type}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Refine Prompt</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            defaultValue={ad.prompt}
                            onBlur={(e) => updateAdPrompt(ad.id, e.target.value)}
                            className="flex-1 bg-lumora-bone border-none text-[10px] p-2 focus:ring-1 focus:ring-lumora-gold"
                          />
                          <button className="text-lumora-taupe hover:text-lumora-gold transition-colors">
                            <RefreshCw size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-black/5 p-20 flex flex-col items-center justify-center text-center opacity-20">
                  <LucideImage size={64} strokeWidth={1} className="mb-4" />
                  <p className="text-[10px] uppercase font-bold tracking-[0.4em]">Select a product to begin refinement</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Setup Control Deck (4 cols) */}
            <div className="lg:col-span-4 space-y-8 bg-white p-8 border border-black/5 shadow-sm h-auto rounded-sm">
              <div className="space-y-2 border-b border-black/5 pb-4">
                <h3 className="text-lg font-serif font-bold text-lumora-charcoal flex items-center gap-2">
                  <Edit3 size={18} className="text-lumora-gold" />
                  Atelier Studio
                </h3>
                <p className="text-[10px] text-lumora-taupe uppercase font-bold tracking-widest">Hand-Drawn Jewelry Artworks</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-lumora-taupe">Select Base Catalog Product</label>
                  <p className="text-[8px] text-lumora-taupe italic">Choose which product design to express as luxury hand-sketches.</p>
                  <select 
                    className="w-full bg-lumora-bone border-none text-xs p-4 focus:ring-1 focus:ring-lumora-gold focus:outline-none"
                    onChange={(e) => {
                      const product = products.find(p => p.id === e.target.value);
                      setSelectedProduct(product || null);
                      setSelectedImage(product?.images[0] || null);
                    }}
                    value={selectedProduct?.id || ""}
                  >
                    <option value="">Choose a product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {selectedProduct && (
                  <div className="space-y-3 animate-in fade-in">
                    <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-lumora-taupe">Select Base Image</label>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProduct.images.map((img, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setSelectedImage(img)}
                          className={`aspect-square border transition-all overflow-hidden relative ${selectedImage === img ? 'border-lumora-gold ring-1 ring-lumora-gold' : 'border-black/5 opacity-65 hover:opacity-100'}`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strategic Business Growth Info Card */}
                <div className="bg-lumora-gold/5 border border-lumora-gold/15 p-4 rounded-sm space-y-2 text-justify">
                  <p className="text-[8px] uppercase tracking-widest font-bold text-lumora-gold flex items-center gap-1">
                    <TrendingUp size={10} />
                    <span>Commercial Leverage</span>
                  </p>
                  <p className="text-[9px] text-lumora-charcoal leading-relaxed font-sans">
                    Hand-drawn luxury illustrations add emotional storytelling value. By generating the full artistic medium package (Color Pencil, Charcoal, Ink, and Watercolor), you can immediately present raw craftsmanship proposals to private buyers, share engaging behind-the-scenes content on social media, or enhance your e-commerce catalog with a vintage boutique look.
                  </p>
                </div>

                <button 
                  onClick={generateIllustration}
                  disabled={!selectedImage || (Object.values(illustrations) as any[]).some(i => i.status === 'loading')}
                  className="w-full bg-lumora-charcoal text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-lumora-gold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {(Object.values(illustrations) as any[]).some(i => i.status === 'loading') ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Drafting Suite Artworks...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate Illustration Suite
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Suite Preview Grid Panel (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Global Operations Desk (Save all / Post all) */}
              {(Object.values(illustrations) as any[]).some(i => i.status === 'success') && (
                <div className="bg-white border border-black/5 p-4 rounded-sm shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 animate-in fade-in duration-300">
                  <div className="space-y-0.5">
                    <p className="text-[8px] uppercase tracking-widest text-lumora-gold font-bold">⚜️ Global Atelier Desk ⚜️</p>
                    <p className="text-[10px] text-lumora-charcoal font-sans">Apply bulk actions to the entire active hand-drawn suite.</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={downloadAllIllustrations}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-white border border-black/10 text-lumora-charcoal text-[9px] font-bold uppercase tracking-widest hover:bg-black/[0.02] flex items-center justify-center gap-1.5 transition-all active:scale-98"
                    >
                      <Download size={12} /> Save All Sketches
                    </button>
                    <button
                      onClick={publishAllIllustrations}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-lumora-charcoal text-white text-[9px] font-bold uppercase tracking-widest hover:bg-lumora-gold flex items-center justify-center gap-1.5 transition-all active:scale-98"
                    >
                      <Share2 size={12} /> Publish Suite Live
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(['pencil', 'charcoal', 'ink', 'watercolor'] as const).map((style) => {
                  const item = illustrations[style];
                  const styleLabels = {
                    pencil: { label: 'Color Pencil Sketch', paper: 'Arches Textured Paper' },
                    charcoal: { label: 'Classical Charcoal Study', paper: 'Heavyweight Ingres Paper' },
                    ink: { label: 'Fountain Ink & Wash', paper: 'Smooth Bristol Board' },
                    watercolor: { label: 'Ethereal Watercolor Wash', paper: 'Canson Cold-Press Paper' }
                  };
                  const labelDetail = styleLabels[style];

                  return (
                    <div key={style} className="bg-white border border-black/5 p-6 rounded-sm shadow-sm flex flex-col h-[520px] group transition-all hover:shadow-md relative overflow-hidden">
                      {/* Top Label Banner */}
                      <div className="flex justify-between items-center pb-2 border-b border-black/5 h-10">
                        <div>
                          <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-gold">{labelDetail.label}</p>
                          <p className="text-[7px] text-lumora-taupe uppercase tracking-widest">{labelDetail.paper}</p>
                        </div>
                        {item.status === 'success' && (
                          <span className="text-[7px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-wider animate-in fade-in">
                            Ready
                          </span>
                        )}
                      </div>

                      {/* Content Area - Flex-1 so it occupies the same box */}
                      <div className="flex-1 bg-lumora-bone flex items-center justify-center overflow-hidden border border-black/[0.03] shadow-inner relative rounded-sm my-3 h-48">
                        {item.status === 'loading' ? (
                          <div className="p-6 text-center space-y-3 z-10">
                            <div className="w-8 h-8 border-2 border-lumora-gold border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-[8px] uppercase tracking-widest font-bold text-lumora-gold animate-pulse">Sketching strokes...</p>
                          </div>
                        ) : item.status === 'success' ? (
                          <img 
                            src={item.url} 
                            alt={`${labelDetail.label}`} 
                            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105" 
                          />
                        ) : item.status === 'error' ? (
                          <div className="p-4 text-center space-y-1">
                            <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider">Draft Error</p>
                            <p className="text-[8px] text-lumora-taupe max-w-[150px] mx-auto">{item.error || 'Failed to generate.'}</p>
                          </div>
                        ) : (
                          <div className="text-center p-6 opacity-30 select-none">
                            <Edit3 size={24} strokeWidth={1} className="mx-auto mb-2 text-lumora-taupe" />
                            <p className="text-[8px] uppercase tracking-wider font-bold">Unrendered Medium</p>
                            <p className="text-[7px] mt-1 font-sans">Pending suite generation</p>
                          </div>
                        )}
                      </div>

                      {/* Actions & Caption Area - Pinned to the bottom with mt-auto */}
                      <div className="mt-auto pt-3 border-t border-black/5 h-[130px] flex flex-col justify-between">
                        {item.status === 'success' ? (
                          <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                            {/* Mini Caption Drawer */}
                            <div className="bg-lumora-bone/60 p-2.5 rounded-sm border border-black/[0.02] relative">
                              <p className="text-[7px] uppercase tracking-widest font-bold text-lumora-taupe mb-0.5">Social Caption Hook</p>
                              <p className="text-[9px] text-lumora-charcoal leading-tight line-clamp-2 italic font-serif">"{item.caption}"</p>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(item.caption || "");
                                  alert("Luxury caption copied to clipboard!");
                                }}
                                className="absolute top-2 right-2 text-[7px] uppercase font-bold text-lumora-gold hover:underline bg-white px-1 py-0.5 rounded-sm border border-black/5 shadow-xs"
                              >
                                Copy
                              </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = item.url;
                                  link.download = `lumora_${selectedProduct?.name.toLowerCase().replace(/\s+/g, '_')}_${style}.png`;
                                  link.click();
                                }}
                                className="flex-1 py-2 bg-white border border-black/10 hover:bg-black/[0.02] text-[8px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1 active:scale-98"
                                title="Download high-resolution file"
                              >
                                <Download size={11} /> Save Image
                              </button>
                              <button 
                                onClick={() => {
                                  if (selectedProduct && onUpdateProductImage) {
                                    onUpdateProductImage(selectedProduct.id, item.url);
                                    setIllustrations(prev => ({
                                      ...prev,
                                      [style]: { ...prev[style], published: true }
                                    }));
                                    alert(`Successfully added this ${labelDetail.label} to the ${selectedProduct.name} catalog website gallery.`);
                                  }
                                }}
                                disabled={item.published}
                                className={`flex-1 py-2 text-[8px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1 active:scale-98 ${
                                  item.published 
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                    : 'bg-lumora-charcoal text-white hover:bg-lumora-gold'
                                }`}
                              >
                                {item.published ? (
                                  <>
                                    <CheckCircle2 size={11} className="text-emerald-500" /> Posted Live
                                  </>
                                ) : (
                                  <>
                                    <Share2 size={11} /> Post to Web
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Pending/Disabled Bottom Section to guarantee flawless height alignment */
                          <div className="space-y-3 opacity-40">
                            <div className="bg-lumora-bone/40 p-2.5 rounded-sm border border-black/[0.01] h-[58px] flex items-center justify-center">
                              <p className="text-[8px] uppercase tracking-widest font-mono text-center">Awaiting sketch completion...</p>
                            </div>
                            <div className="flex gap-2">
                              <button disabled className="flex-1 py-2 bg-black/[0.03] text-black/20 text-[8px] font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                                <Download size={11} /> Save Image
                              </button>
                              <button disabled className="flex-1 py-2 bg-black/[0.03] text-black/20 text-[8px] font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                                <Share2 size={11} /> Post to Web
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MagicStudio: React.FC<{ initialImage: string; onSave: (img: string) => void; onBack: () => void }> = ({ initialImage, onSave, onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [videoAspect, setVideoAspect] = useState<'16:9' | '9:16'>('9:16');
  const [videoResult, setVideoResult] = useState<string | null>(null);

  const editImage = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      await ensurePaidKey();
      const base64Img = await imageUrlToBase64(initialImage);
      const response = await fetch('/api/gemini/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: base64Img,
          prompt: prompt
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to edit image');
      }

      const data = await response.json();
      if (data.imageUrl) {
        setResult(data.imageUrl);
      } else {
        alert("The AI was unable to process this edit. Please try a different instruction.");
      }
    } catch (e: any) { 
      console.error(e);
      alert(e.message || "An error occurred during image editing. Please check your connection and API key.");
    }
    finally { setLoading(false); }
  };

  const generateVideo = async () => {
    setLoading(true);
    try {
      await ensurePaidKey();
      const apiKey = getApiKey();
      if (!apiKey) {
        alert("Gemini API key is not configured.");
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const base64Img = await imageUrlToBase64(initialImage);
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Product cinematic movement',
        image: { imageBytes: base64Img, mimeType: 'image/png' },
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: videoAspect }
      });
      while (!operation.done) {
        await new Promise(r => setTimeout(r, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const res = await fetch(`${downloadLink}&key=${apiKey}`);
        const blob = await res.blob();
        setVideoResult(URL.createObjectURL(blob));
      } else {
        alert("Video generation failed. Please try a different prompt.");
      }
    } catch (e: any) { 
      console.error(e);
      if (e.message?.includes('permission') || e.message?.includes('403') || e.message?.includes('not found')) {
        alert("API Permission Error: Your current key may not have access to video generation. Please select a paid API key.");
        // @ts-ignore
        await window.aistudio?.openSelectKey();
      } else {
        alert("An error occurred during video generation. Please ensure you have a paid API key selected.");
      }
    }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-700">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-lumora-taupe hover:text-lumora-gold transition-colors">
          <ChevronLeft size={16} /> Exit Studio
        </button>
        <div className="flex gap-4">
          <button onClick={() => { setIsVideoMode(false); setVideoResult(null); }} className={`text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 border transition-all bg-lumora-charcoal text-white border-lumora-charcoal shadow-lg`}>Magic Edit</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="aspect-[4/5] bg-lumora-bone border border-black/5 relative overflow-hidden shadow-inner">
            <img src={initialImage} className="w-full h-full object-cover opacity-30 blur-xl" alt="" />
            <div className="absolute inset-10 border border-black/5 bg-white p-4 shadow-2xl animate-in zoom-in-95 duration-1000">
              <img src={initialImage} className="w-full h-full object-contain" alt="Initial Asset" />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-lumora-charcoal/80 text-white text-[8px] font-bold uppercase tracking-widest px-4 py-1 backdrop-blur-sm">Source Masterpiece</div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-10 border border-black/5 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-lumora-gold" />
              <h3 className="text-xl font-serif font-bold text-lumora-charcoal">{isVideoMode ? 'Video Generation' : 'AI Edit Engine'}</h3>
            </div>
            
            <textarea 
              className="w-full bg-lumora-bone border-none text-xs p-4 focus:ring-1 focus:ring-lumora-gold min-h-[100px] resize-none"
              placeholder={isVideoMode ? "Describe cinematic motion (e.g., 'Slow orbital rotation with depth zoom')..." : "Instructions (e.g., 'Add a royal velvet background', 'Apply a golden hour filter')..."}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />

            {isVideoMode && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-lumora-taupe">Motion Orientation</label>
                <div className="flex gap-4">
                  <button onClick={() => setVideoAspect('16:9')} className={`flex-1 py-3 text-[9px] font-bold uppercase tracking-widest border transition-all ${videoAspect === '16:9' ? 'bg-lumora-gold text-white border-lumora-gold' : 'border-black/5 text-lumora-taupe'}`}>Landscape 16:9</button>
                  <button onClick={() => setVideoAspect('9:16')} className={`flex-1 py-3 text-[9px] font-bold uppercase tracking-widest border transition-all ${videoAspect === '9:16' ? 'bg-lumora-gold text-white border-lumora-gold' : 'border-black/5 text-lumora-taupe'}`}>Portrait 9:16</button>
                </div>
              </div>
            )}

            <button 
              onClick={isVideoMode ? generateVideo : editImage}
              disabled={loading}
              className="w-full bg-lumora-charcoal text-white py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-lumora-gold transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : (isVideoMode ? 'Generate Reel' : 'Process Refinement')}
            </button>
          </div>

          <div className="aspect-[4/5] bg-white border border-black/5 overflow-hidden flex items-center justify-center relative shadow-lg">
            {loading ? (
              <div className="text-center animate-pulse space-y-4">
                <Sparkles size={32} className="mx-auto text-lumora-gold" />
                <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-lumora-gold">Computing Pixels...</p>
              </div>
            ) : videoResult ? (
              <video src={videoResult} controls autoPlay loop className="w-full h-full object-contain" />
            ) : result ? (
              <img src={result} className="w-full h-full object-contain animate-in zoom-in-95 duration-700" alt="Result" />
            ) : (
              <div className="text-center opacity-10">
                <Maximize size={48} className="mx-auto mb-2" />
                <p className="text-[8px] uppercase font-bold tracking-[0.3em]">Studio Output</p>
              </div>
            )}
            {(result || videoResult) && (
              <button 
                onClick={() => result && onSave(result)}
                className="absolute bottom-6 right-6 bg-white shadow-2xl p-4 rounded-full text-green-600 hover:text-white hover:bg-green-600 transition-all transform hover:scale-110 active:scale-90"
              >
                <CheckCircle2 size={24} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SocialPublishModal: React.FC<{
  product: Product;
  platform: 'Pinterest' | 'Instagram' | 'Facebook';
  isConnected: boolean;
  onConnect: () => void;
  onClose: () => void;
  onPublish: (message: string, selectedImages?: string[]) => void;
  isPublishing: boolean;
  initialSelectedImages?: string[];
  onPlatformChange?: (platform: 'Pinterest' | 'Instagram' | 'Facebook') => void;
}> = ({ product, platform, isConnected, onConnect, onClose, onPublish, isPublishing, initialSelectedImages = [], onPlatformChange }) => {
  // Candidate images: merge initialSelectedImages with product.images
  const candidateImages = useMemo(() => {
    const set = new Set<string>();
    (initialSelectedImages || []).forEach(img => { if (img) set.add(img); });
    (product?.images || []).forEach(img => { if (img) set.add(img); });
    return Array.from(set);
  }, [initialSelectedImages, product?.images]);

  const [selectedImages, setSelectedImages] = useState<string[]>(() => {
    if (initialSelectedImages && initialSelectedImages.length > 0) {
      return initialSelectedImages;
    }
    return product?.images && product.images.length > 0 ? [product.images[0]] : [];
  });

  const [activePreviewIdx, setActivePreviewIdx] = useState<number>(0);
  const [currentPlatform, setCurrentPlatform] = useState<'Pinterest' | 'Instagram' | 'Facebook'>(platform);
  const [message, setMessage] = useState(`Discover the timeless brilliance of the ${product.name}. Masterfully handcrafted in ${product.material || '18k Gold'} at the Lumora Atelier. #LumoraAtelier #HighJewelry #FineJewelry #BespokeLuxury`);
  const [pinterestBoard, setPinterestBoard] = useState('High Jewelry Masterpieces');

  useEffect(() => {
    setCurrentPlatform(platform);
  }, [platform]);

  const handlePlatformSwitch = (newPlat: 'Pinterest' | 'Instagram' | 'Facebook') => {
    setCurrentPlatform(newPlat);
    onPlatformChange?.(newPlat);
  };

  const toggleImage = (url: string) => {
    setSelectedImages(prev => {
      if (prev.includes(url)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter(u => u !== url);
      } else {
        return [...prev, url];
      }
    });
  };

  const previewImage = selectedImages[activePreviewIdx] || selectedImages[0] || product.images[0];

  const captionPresets = [
    { label: '💎 High Jewelry', text: `Discover the rare brilliance of the ${product.name}. Handcrafted with singular precision at the Lumora Atelier. Inquire for private appointments. #Lumora #HauteJoaillerie #FineJewelry` },
    { label: '✨ Bespoke Atelier', text: `From concept gouache to final polish: the ${product.name} embodies generations of high jewelry heritage. Discover our bespoke archives. #BespokeJewelry #LumoraAtelier` },
    { label: '👑 Editorial Statement', text: `Unapologetic opulence. Featuring the ${product.name} in exquisite ${product.material || 'solid gold'} and certified stones. Explore the curation. #LuxuryLiving #HighJewelry` },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[140] p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Platform Selector */}
        <div className="p-6 bg-lumora-bone border-b border-black/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${
              currentPlatform === 'Pinterest' ? 'bg-[#BD081C]' : 
              currentPlatform === 'Instagram' ? 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]' : 
              'bg-[#1877F2]'
            }`}>
              {currentPlatform === 'Pinterest' && <Pin size={20} />}
              {currentPlatform === 'Instagram' && <Instagram size={20} />}
              {currentPlatform === 'Facebook' && <Facebook size={20} />}
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-lumora-charcoal">Publish to {currentPlatform}</h3>
              <p className="text-[9px] text-lumora-taupe uppercase tracking-widest font-bold">Select images and broadcast from the gallery</p>
            </div>
          </div>

          {/* Platform Switcher Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-sm border border-black/10">
            {(['Instagram', 'Pinterest', 'Facebook'] as const).map(plat => (
              <button
                key={plat}
                type="button"
                onClick={() => handlePlatformSwitch(plat)}
                className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-all rounded-sm flex items-center gap-1.5 ${
                  currentPlatform === plat
                    ? 'bg-lumora-charcoal text-white shadow-sm'
                    : 'text-lumora-taupe hover:text-lumora-charcoal hover:bg-black/5'
                }`}
              >
                {plat === 'Instagram' && <Instagram size={11} />}
                {plat === 'Pinterest' && <Pin size={11} />}
                {plat === 'Facebook' && <Facebook size={11} />}
                {plat}
              </button>
            ))}
          </div>

          <button onClick={onClose} className="text-lumora-taupe hover:text-black transition-colors self-end sm:self-center">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {!isConnected ? (
            <div className="text-center py-10 space-y-5 bg-lumora-bone/40 p-8 border border-dashed border-black/10">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-lumora-taupe shadow-sm">
                <Lock size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-serif font-bold text-lumora-charcoal">{currentPlatform} Not Connected</h4>
                <p className="text-xs text-lumora-taupe max-w-sm mx-auto">
                  Connect your verified {currentPlatform} account in Settings to dispatch broadcasts directly.
                </p>
              </div>
              <button 
                onClick={onConnect}
                className="bg-lumora-charcoal text-white px-6 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-lumora-gold transition-all"
              >
                Connect {currentPlatform} Account
              </button>
            </div>
          ) : (
            <>
              {/* IMAGE SELECTION BAR */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-lumora-taupe flex items-center gap-2">
                    <LucideImage size={12} className="text-lumora-gold" />
                    Selected Images for Post ({selectedImages.length} of {candidateImages.length})
                  </label>
                  <span className="text-[9px] text-lumora-gold font-bold">
                    Click thumbnails to toggle inclusion
                  </span>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                  {candidateImages.map((img, idx) => {
                    const isSelected = selectedImages.includes(img);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleImage(img)}
                        className={`relative w-20 h-20 rounded-sm overflow-hidden cursor-pointer border-2 transition-all flex-shrink-0 group ${
                          isSelected 
                            ? 'border-lumora-gold ring-2 ring-lumora-gold/20 scale-100 shadow-md' 
                            : 'border-black/10 opacity-50 hover:opacity-80 scale-95'
                        }`}
                        title={isSelected ? 'Click to deselect' : 'Click to select this image'}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        
                        {/* Checkmark overlay badge */}
                        <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                          isSelected ? 'bg-lumora-gold text-white shadow' : 'bg-black/40 text-white/70'
                        }`}>
                          {isSelected ? <Check size={12} strokeWidth={3} /> : (idx + 1)}
                        </div>

                        {isSelected && (
                          <div className="absolute bottom-0 inset-x-0 bg-lumora-gold/90 text-white text-[7px] font-bold uppercase tracking-wider text-center py-0.5">
                            Included
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {selectedImages.length === 0 && (
                  <p className="text-[10px] text-red-500 font-bold">Please select at least one image to broadcast.</p>
                )}
              </div>

              {/* LIVE SOCIAL PREVIEW & POST DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-lumora-bone/30 p-5 rounded-sm border border-black/5">
                {/* Left: Platform Specific Visual Mockup */}
                <div className="space-y-2">
                  <span className="text-[8px] uppercase tracking-widest font-bold text-lumora-taupe block">
                    Live {currentPlatform} Feed Preview
                  </span>

                  {currentPlatform === 'Instagram' && (
                    <div className="bg-white border border-black/10 rounded-sm overflow-hidden shadow-sm text-xs">
                      <div className="p-3 flex items-center justify-between border-b border-black/5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] p-0.5">
                            <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-serif text-[9px] font-bold text-lumora-charcoal">
                              L
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-[11px] leading-tight">lumora.atelier</p>
                            <p className="text-[8px] text-lumora-taupe">Haute Joaillerie</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-lumora-gold">
                          {selectedImages.length > 1 ? `Carousel • ${selectedImages.length} Photos` : 'Single Post'}
                        </span>
                      </div>

                      {/* Image Viewer */}
                      <div className="aspect-square bg-lumora-bone relative overflow-hidden">
                        <img 
                          src={previewImage} 
                          alt="Instagram Preview" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        {selectedImages.length > 1 && (
                          <>
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                              {activePreviewIdx + 1}/{selectedImages.length}
                            </div>
                            <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none">
                              <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setActivePreviewIdx(prev => (prev > 0 ? prev - 1 : selectedImages.length - 1)); }}
                                className="pointer-events-auto w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/70"
                              >
                                ‹
                              </button>
                              <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setActivePreviewIdx(prev => (prev < selectedImages.length - 1 ? prev + 1 : 0)); }}
                                className="pointer-events-auto w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/70"
                              >
                                ›
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Engagement Bar */}
                      <div className="p-3 space-y-2">
                        <div className="flex justify-between items-center text-lumora-charcoal">
                          <div className="flex items-center gap-3">
                            <span className="cursor-pointer hover:text-red-500">♡</span>
                            <span className="cursor-pointer">💬</span>
                            <span className="cursor-pointer">↗</span>
                          </div>
                          <span className="cursor-pointer">⚑</span>
                        </div>
                        <p className="text-[10px] text-lumora-charcoal line-clamp-2">
                          <span className="font-bold mr-1.5">lumora.atelier</span>
                          {message}
                        </p>
                      </div>
                    </div>
                  )}

                  {currentPlatform === 'Pinterest' && (
                    <div className="bg-white border border-black/10 rounded-sm overflow-hidden shadow-sm p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase font-bold text-lumora-taupe">Board: {pinterestBoard}</span>
                        <span className="bg-[#BD081C] text-white px-3 py-1 rounded-full text-[9px] font-bold">Save</span>
                      </div>
                      <div className="aspect-[3/4] bg-lumora-bone rounded-sm overflow-hidden relative">
                        <img src={previewImage} alt="Pinterest Pin" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute bottom-2 left-2 bg-white/90 text-lumora-charcoal px-2 py-0.5 rounded text-[8px] font-bold font-mono">
                          lumora.luxury
                        </div>
                      </div>
                      <div>
                        <h5 className="font-serif font-bold text-xs text-lumora-charcoal">{product.name}</h5>
                        <p className="text-[10px] text-lumora-taupe line-clamp-2 mt-1">{message}</p>
                      </div>
                    </div>
                  )}

                  {currentPlatform === 'Facebook' && (
                    <div className="bg-white border border-black/10 rounded-sm overflow-hidden shadow-sm p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs">
                          L
                        </div>
                        <div>
                          <p className="font-bold text-xs text-lumora-charcoal">Lumora Fine Jewelry Atelier</p>
                          <p className="text-[8px] text-lumora-taupe">Just now • 🌍 Public</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-lumora-charcoal line-clamp-2">{message}</p>
                      <div className="aspect-[4/3] bg-lumora-bone rounded-sm overflow-hidden relative">
                        <img src={previewImage} alt="Facebook Post" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        {selectedImages.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] font-bold px-2 py-1 rounded">
                            +{selectedImages.length - 1} more photos
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Caption, Presets & Targeting */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[8px] uppercase tracking-widest font-bold text-lumora-taupe">
                        Luxury Caption Presets
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {captionPresets.map((preset, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setMessage(preset.text)}
                            className="text-[8px] uppercase font-bold tracking-wider px-2.5 py-1 bg-white hover:bg-lumora-gold hover:text-white border border-black/10 rounded-sm transition-all"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] uppercase tracking-widest font-bold text-lumora-taupe">
                        Broadcast Caption & Hashtags
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-white border border-black/10 text-xs p-3 focus:ring-1 focus:ring-lumora-gold min-h-[110px] leading-relaxed rounded-sm"
                        placeholder="Write an enchanting narrative for this piece..."
                      />
                    </div>

                    {currentPlatform === 'Pinterest' && (
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase tracking-widest font-bold text-lumora-taupe">Pinterest Board</label>
                        <select
                          value={pinterestBoard}
                          onChange={(e) => setPinterestBoard(e.target.value)}
                          className="w-full bg-white border border-black/10 text-xs p-2 rounded-sm focus:ring-1 focus:ring-lumora-gold"
                        >
                          <option value="High Jewelry Masterpieces">High Jewelry Masterpieces</option>
                          <option value="Bridal & Bespoke Solitaires">Bridal & Bespoke Solitaires</option>
                          <option value="Editorial Gemstone Archive">Editorial Gemstone Archive</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-3 border border-black/5 rounded-sm flex items-center justify-between text-[10px]">
                    <span className="text-lumora-taupe uppercase font-bold tracking-wider">Product:</span>
                    <span className="font-serif font-bold text-lumora-charcoal">{product.name}</span>
                    <span className="font-mono text-lumora-gold font-bold">${product.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-black/5 flex gap-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 text-[9px] font-bold uppercase tracking-[0.25em] border border-black/10 hover:bg-black/5 transition-all text-lumora-charcoal"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => onPublish(message, selectedImages)}
                  disabled={isPublishing || selectedImages.length === 0}
                  className="flex-1 bg-lumora-charcoal text-white py-3 text-[9px] font-bold uppercase tracking-[0.25em] hover:bg-lumora-gold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Publishing to {currentPlatform}...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Publish {selectedImages.length} {selectedImages.length === 1 ? 'Image' : 'Images'} Now
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SocialConnectModal: React.FC<{
  platform: 'Pinterest' | 'Instagram' | 'Facebook';
  onClose: () => void;
  onConnect: (token: string, accountId: string) => void;
}> = ({ platform, onClose, onConnect }) => {
  const [token, setToken] = useState('');
  const [accountId, setAccountId] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please provide a valid Developer Access Token.');
      return;
    }
    if (platform !== 'Pinterest' && !accountId.trim()) {
      setError(`Please provide your ${platform === 'Instagram' ? 'Instagram Business Account ID' : 'Facebook Page ID'}.`);
      return;
    }

    setIsVerifying(true);
    // Simulate high-fidelity secure token validation exchange with platform OAuth APIs
    setTimeout(() => {
      setIsVerifying(false);
      onConnect(token.trim(), accountId.trim());
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[101] p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-sm shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 bg-lumora-bone border-b border-black/5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
              platform === 'Pinterest' ? 'bg-[#BD081C]' : 
              platform === 'Instagram' ? 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]' : 
              'bg-[#1877F2]'
            }`}>
              {platform === 'Pinterest' && <Pin size={20} />}
              {platform === 'Instagram' && <Instagram size={20} />}
              {platform === 'Facebook' && <Facebook size={20} />}
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-lumora-charcoal">Secure {platform} API Setup</h3>
              <p className="text-[10px] text-lumora-taupe uppercase tracking-widest font-bold">Standard Developer Integration Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="text-lumora-taupe hover:text-black transition-colors">
            <ChevronRight size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="bg-amber-50 border border-amber-200/50 p-4 text-[11px] text-amber-800 leading-relaxed flex gap-3">
            <Lock className="flex-shrink-0 mt-0.5" size={14} />
            <div>
              <p className="font-bold">Privacy & Security Guarantee:</p>
              <p className="mt-1">Lumora strictly connects using official developer API tokens. We <strong>never</strong> ask for or store your social media password. This keeps your credentials 100% secure.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-lumora-taupe flex justify-between">
                <span>Developer Access Token</span>
                <button 
                  type="button" 
                  onClick={() => setShowToken(!showToken)}
                  className="text-lumora-gold hover:underline lowercase font-normal tracking-normal text-[10px]"
                >
                  {showToken ? 'Hide token' : 'Show token'}
                </button>
              </label>
              <input 
                type={showToken ? 'text' : 'password'}
                required
                value={token}
                onChange={(e) => { setToken(e.target.value); setError(''); }}
                className="w-full bg-lumora-bone border-none text-xs p-4 focus:ring-1 focus:ring-lumora-gold font-mono"
                placeholder={`Paste your official ${platform} Access Token...`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-lumora-taupe">
                {platform === 'Pinterest' ? 'Board ID (Optional)' : platform === 'Instagram' ? 'Instagram Business Account ID' : 'Facebook Page ID'}
              </label>
              <input 
                type="text"
                required={platform !== 'Pinterest'}
                value={accountId}
                onChange={(e) => { setAccountId(e.target.value); setError(''); }}
                className="w-full bg-lumora-bone border-none text-xs p-4 focus:ring-1 focus:ring-lumora-gold font-mono"
                placeholder={
                  platform === 'Pinterest' ? 'Enter Pinterest Board ID...' :
                  platform === 'Instagram' ? 'Enter 17-digit Instagram Account ID...' :
                  'Enter Facebook Page ID...'
                }
              />
            </div>

            {error && (
              <p className="text-[10px] font-bold text-red-600 tracking-wide uppercase">{error}</p>
            )}
          </div>

          <div className="bg-lumora-bone/40 p-5 space-y-3 border border-black/5">
            <h5 className="text-[9px] uppercase font-bold tracking-widest text-lumora-charcoal flex items-center gap-1.5">
              <Globe size={11} className="text-lumora-gold" />
              How to retrieve your developer credentials:
            </h5>
            <ol className="list-decimal list-inside text-[10px] text-lumora-taupe space-y-2 leading-relaxed">
              {platform === 'Pinterest' ? (
                <>
                  <li>Go to the <a href="https://developers.pinterest.com/" target="_blank" rel="noopener noreferrer" className="text-lumora-gold underline">Pinterest Developer Portal</a> and sign in.</li>
                  <li>Create an app under the <strong>Apps</strong> section to get your client credentials.</li>
                  <li>Generate an <strong>Access Token</strong> under the App credentials page to paste above.</li>
                </>
              ) : (
                <>
                  <li>Navigate to the <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-lumora-gold underline">Meta Developer Portal</a>.</li>
                  <li>Register a secure developer App, choosing the <strong>Meta Business Graph API</strong>.</li>
                  <li>Use the <strong>Graph API Explorer</strong> to generate a Page Access Token (Facebook) or User Token (Instagram) with <code>pages_manage_posts</code> permissions.</li>
                </>
              )}
            </ol>
          </div>

          <div className="pt-6 border-t border-black/5 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              disabled={isVerifying}
              className="flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.3em] border border-black/10 hover:bg-black/5 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isVerifying}
              className="flex-1 bg-lumora-charcoal text-white py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-lumora-gold transition-all flex items-center justify-center gap-2 disabled:opacity-80"
            >
              {isVerifying ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Verifying API Token...
                </>
              ) : (
                <>
                  <Check size={14} />
                  Authorize & Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrderConfirmationModal: React.FC<{ order: BespokeOrder; onClose: () => void }> = ({ order, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [phone, setPhone] = useState(order.customerPhone || '');

  const handleWhatsAppShare = () => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    const stonesText = order.stones && order.stones.length > 0 
      ? `• *Stones:* ${order.stones.map(s => `${s.weight}${s.unit} ${s.name}`).join(', ')}\n` 
      : '';
    const diamondsText = order.diamonds && order.diamonds.length > 0 
      ? `• *Diamonds:* ${order.diamonds.map(d => `${d.weight}${d.unit} ${d.name}`).join(', ')}\n` 
      : '';

    const message = `*LUMORA FINE JEWELRY*\n` +
      `*Bespoke Atelier Commission Confirmation*\n\n` +
      `Dear *${order.customerName}*,\n\n` +
      `Thank you for commissioning our bespoke atelier. We are delighted to bring your exquisite vision to life.\n\n` +
      `*Order Details:*\n` +
      `• *Reference ID:* ${order.id}\n` +
      `• *Date Placed:* ${order.createdAt}\n` +
      `• *Status:* ${order.status}\n` +
      `• *Metal:* ${order.metalType} ${order.metalPurity} (${order.metalWeight}g)\n` +
      stonesText +
      diamondsText +
      `\n*Financial Summary:*\n` +
      `• *Total Value:* $${order.totalAmount.toLocaleString()}\n` +
      `• *Advance Paid:* $${order.advancePaid.toLocaleString()}\n` +
      `• *Balance Outstanding:* $${(order.totalAmount - order.advancePaid).toLocaleString()}\n\n` +
      `We have shared these details with our master craftsman, *${order.craftsmanName}*. You can track your production workflow live via your Lumora dashboard.\n\n` +
      `Warmest regards,\n` +
      `*Lumora Bespoke Atelier*`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDownloadPDF = async () => {
    if (!modalRef.current) return;
    try {
      const canvas = await html2canvas(modalRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`OrderConfirmation_${order.id}.pdf`);
    } catch (error) {
      console.error("PDF Error:", error);
      alert("Failed to generate order confirmation PDF.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[120] p-6 animate-in fade-in duration-300">
      <div ref={modalRef} className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 bg-lumora-charcoal text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-serif font-bold">Order Confirmation</h3>
            <p className="text-[10px] text-lumora-gold uppercase tracking-widest font-bold">Lumora Fine Jewelry • Bespoke Atelier</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-12 space-y-10 overflow-y-auto bg-white">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-lumora-gold/10 text-lumora-gold rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-xl font-serif font-bold text-lumora-charcoal">Thank you for your commission, {order.customerName}</h4>
            <p className="text-[11px] text-lumora-taupe leading-relaxed max-w-md mx-auto">
              Your bespoke masterpiece has been successfully recorded and sent to our master artisans. We are honored to bring your vision to life.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 pt-10 border-t border-black/5">
            <div className="space-y-6">
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe mb-2">Order Reference</p>
                <p className="text-sm font-serif font-bold text-lumora-charcoal">{order.id}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe mb-2">Date Placed</p>
                <p className="text-sm font-serif font-bold text-lumora-charcoal">{order.createdAt}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe mb-2">Status</p>
                <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-lumora-gold text-white rounded-full">
                  {order.status}
                </span>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe mb-2">Metal Type</p>
                <p className="text-sm font-serif font-bold text-lumora-charcoal">
                  {order.metalType} {order.metalWeight ? `(${order.metalWeight}g)` : ''}
                </p>
              </div>
            </div>
          </div>

          {(order.stones?.length > 0 || order.diamonds?.length > 0) && (
            <div className="grid grid-cols-2 gap-12 pt-10 border-t border-black/5">
              <div className="space-y-4">
                <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Gemstones</p>
                <div className="space-y-1">
                  {order.stones?.length > 0 ? order.stones.map((s, idx) => (
                    <div key={idx} className="text-[10px] text-lumora-charcoal flex justify-between">
                      <span>{s.name}</span>
                      <span className="font-bold">{s.weight} {s.unit}</span>
                    </div>
                  )) : <p className="text-[10px] text-lumora-taupe italic">None</p>}
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Diamonds</p>
                <div className="space-y-1">
                  {order.diamonds?.length > 0 ? order.diamonds.map((d, idx) => (
                    <div key={idx} className="text-[10px] text-lumora-charcoal flex justify-between">
                      <span>{d.name}</span>
                      <span className="font-bold">{d.weight} {d.unit}</span>
                    </div>
                  )) : <p className="text-[10px] text-lumora-taupe italic">None</p>}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Financial Summary</p>
            <div className="bg-lumora-bone p-6 space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-lumora-taupe">Total Commission Value</span>
                <span className="font-bold text-lumora-charcoal">${order.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-lumora-taupe">Advance Payment Received</span>
                <span className="font-bold text-green-600">-${order.advancePaid.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-black/10 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-lumora-charcoal">Balance Outstanding</span>
                <span className="text-lg font-serif font-bold text-lumora-gold">${(order.totalAmount - order.advancePaid).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col gap-1.5 w-full md:w-auto">
              <label className="text-[8px] uppercase font-bold tracking-[0.2em] text-lumora-taupe">WhatsApp Confirmation Dispatch</label>
              <div className="flex border border-black/10 rounded-sm overflow-hidden bg-lumora-bone shadow-sm">
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="e.g. +919876543210" 
                  className="bg-transparent border-none text-[11px] px-3 py-2 focus:ring-0 w-44 font-mono text-lumora-charcoal outline-none"
                />
                <button 
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle size={12} /> Send WhatsApp
                </button>
              </div>
            </div>
            <button 
              onClick={handleDownloadPDF}
              className="bg-lumora-charcoal text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-lumora-gold transition-all flex items-center gap-2 w-full md:w-auto justify-center"
            >
              <Download size={14} /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const JobCardModal: React.FC<{ order: BespokeOrder; onClose: () => void }> = ({ order, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    
    try {
      // Find the scrollable container
      const scrollContainer = cardRef.current.querySelector('.overflow-y-auto') as HTMLElement;
      const originalScrollStyle = scrollContainer ? scrollContainer.style.cssText : '';
      
      if (scrollContainer) {
        scrollContainer.style.height = 'auto';
        scrollContainer.style.maxHeight = 'none';
        scrollContainer.style.overflow = 'visible';
      }

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: cardRef.current.scrollWidth,
        windowHeight: cardRef.current.scrollHeight
      });

      if (scrollContainer) {
        scrollContainer.style.cssText = originalScrollStyle;
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const contentWidth = pdfWidth;
      const contentHeight = (imgProps.height * contentWidth) / imgProps.width;

      // Logic to handle multiple pages if content is too long
      let heightLeft = contentHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, contentWidth, contentHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - contentHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, contentWidth, contentHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`JobCard_${order.id}.pdf`);
    } catch (error) {
      console.error("Print Error:", error);
      alert("Failed to generate printable job card.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWhatsApp = () => {
    const message = `*LUMORA ATELIER - JOB CARD ${order.id}*\n\nArtisan: ${order.craftsmanName}\nMetal: ${order.metalType}\n\n*Specifications:*\n${order.specifications}\n\nReference: ${order.samplePhotos[0] || 'No images'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const isSharing = useRef(false);

  const handleSendToTablet = async () => {
    if (isSharing.current) return;

    if (navigator.share) {
      isSharing.current = true;
      try {
        await navigator.share({
          title: `Job Card ${order.id}`,
          text: `Production details for ${order.craftsmanName}`,
          url: window.location.href
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error("Share Error:", error);
        }
      } finally {
        isSharing.current = false;
      }
    } else {
      const status = document.createElement('div');
      status.className = "fixed bottom-10 left-1/2 -translate-x-1/2 bg-lumora-charcoal text-white px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest z-[200] animate-in slide-in-from-bottom-4";
      status.innerText = "Syncing with Workshop Tablet...";
      document.body.appendChild(status);
      setTimeout(() => {
        status.innerText = "Job Card Pushed to Tablet Successfully";
        setTimeout(() => status.remove(), 2000);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[120] p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div ref={cardRef} className="flex flex-col h-full bg-white">
          <div className="p-8 bg-lumora-gold text-white flex justify-between items-center shrink-0">
            <div>
              <h3 className="text-2xl font-serif font-bold">Artisan Job Card</h3>
              <p className="text-[10px] text-white/80 uppercase tracking-widest font-bold">Production Order • {order.id}</p>
            </div>
            {!isGenerating && (
              <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                <X size={24} />
              </button>
            )}
          </div>
          <div className="p-12 space-y-10 overflow-y-auto bg-white flex-1">
          <div className="flex justify-between items-start">
            <div className="space-y-6">
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe mb-2">Production Job Ref</p>
                <p className="text-xl font-serif font-bold text-lumora-charcoal underline decoration-lumora-gold/30 underline-offset-8">JOB-${order.id}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe mb-2">Assigned Craftsman</p>
                <p className="text-sm font-serif font-bold text-lumora-charcoal">{order.craftsmanName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe mb-2">Completion Deadline</p>
              <p className="text-sm font-bold text-lumora-charcoal">April 15, 2026</p>
              <div className="mt-4 inline-block px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-bold uppercase tracking-widest border border-amber-100">
                Priority: {order.totalAmount > 50000 ? 'Ultra High' : 'High'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 pt-4 border-t border-black/5">
             <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe mb-2">Metal Specification</p>
                <p className="text-sm font-bold text-lumora-gold uppercase tracking-widest">
                  {order.metalType} {order.metalWeight ? `(${order.metalWeight}g)` : ''}
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe mb-2">Client Reference</p>
                <p className="text-sm font-bold text-lumora-charcoal uppercase tracking-widest">{order.customerName}</p>
              </div>
          </div>

          {(order.stones?.length > 0 || order.diamonds?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-b border-black/5 pb-10">
              {order.stones?.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Gemstones Required</p>
                  <div className="space-y-2">
                    {order.stones.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-lumora-bone/20 p-3 border border-black/5">
                        <span className="text-[10px] font-bold text-lumora-charcoal">{s.name}</span>
                        <span className="text-[10px] text-lumora-taupe">{s.weight} {s.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {order.diamonds?.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Diamonds Required</p>
                  <div className="space-y-2">
                    {order.diamonds.map((d, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-lumora-bone/20 p-3 border border-black/5">
                        <span className="text-[10px] font-bold text-lumora-charcoal">{d.name}</span>
                        <span className="text-[10px] text-lumora-taupe">{d.weight} {d.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Design Specifications</p>
              <div className="bg-lumora-bone p-6 border border-black/5 min-h-[150px]">
                <p className="text-[11px] text-lumora-charcoal leading-relaxed whitespace-pre-wrap">
                  {order.specifications}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Reference Imagery</p>
              <div className="grid grid-cols-2 gap-4">
                {order.samplePhotos.map((photo, i) => (
                  <div key={i} className="aspect-square bg-lumora-bone border border-black/5 overflow-hidden group relative">
                    <img src={photo} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Maximize size={16} />
                    </button>
                  </div>
                ))}
                {order.samplePhotos.length === 0 && (
                  <div className="col-span-2 aspect-video bg-lumora-bone border border-dashed border-black/10 flex items-center justify-center">
                    <p className="text-[10px] text-lumora-taupe uppercase font-bold tracking-widest">No reference images</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-black/5 flex justify-between items-center bg-lumora-bone/30">
          <div className="flex gap-4">
            <button 
              onClick={handleSendToTablet}
              className="bg-white text-lumora-charcoal px-6 py-3 text-[10px] font-bold uppercase tracking-widest border border-black/5 hover:bg-black/5 transition-all flex items-center gap-2"
            >
              <Share2 size={14} /> Send to Tablet
            </button>
            <button 
              onClick={handleWhatsApp}
              className="bg-white text-lumora-charcoal px-6 py-3 text-[10px] font-bold uppercase tracking-widest border border-black/5 hover:bg-black/5 transition-all flex items-center gap-2"
            >
              <Smartphone size={14} /> WhatsApp Artisan
            </button>
          </div>
          <button 
            onClick={handlePrint}
            className="bg-lumora-charcoal text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-lumora-gold transition-all flex items-center gap-2"
          >
            <Download size={14} /> Print Job Card
          </button>
        </div>
      </div>
    </div>
  </div>
);
};

// --- MARKETING PLANNER ---

interface Festival {
  name: string;
  date: string;
  region: string;
  description: string;
  suggestedPromo: string;
}

const GLOBAL_FESTIVALS: Festival[] = [
  { name: 'Dubai Shopping Festival', date: '2026-01-01', region: 'Dubai', description: 'Major retail event.', suggestedPromo: 'DSF Exclusive: Tax-Free Shopping + Lucky Draw Entry' },
  { name: 'Valentine\'s Day', date: '2026-02-14', region: 'Global', description: 'Romantic gifting focus.', suggestedPromo: 'Couple\'s Collection: Buy 1 Get 1 50% off on Bands' },
  { name: 'Eid al-Fitr', date: '2026-03-20', region: 'Dubai/Global', description: 'Celebration and gifting.', suggestedPromo: 'Eid Mubarak: Exclusive Festive Collection Launch' },
  { name: 'Akshaya Tritiya', date: '2026-04-20', region: 'India', description: 'Auspicious day for buying gold.', suggestedPromo: 'Zero Making Charges on Gold Jewelry' },
  { name: 'Mother\'s Day', date: '2026-05-10', region: 'US/UK', description: 'Appreciation gifting.', suggestedPromo: 'Mother\'s Day Special: Personalized Engraving' },
  { name: 'Karva Chauth', date: '2026-10-29', region: 'India', description: 'Traditional celebration for couples.', suggestedPromo: 'Gift of Love: Complimentary Silver Coin with every purchase' },
  { name: 'Diwali', date: '2026-11-08', region: 'India', description: 'Festival of Lights. Peak jewelry buying season.', suggestedPromo: 'Dhanteras Special: 20% off on Gold & Diamonds' },
  { name: 'Wedding Season (Winter)', date: '2026-11-15', region: 'India', description: 'Peak bridal jewelry demand.', suggestedPromo: 'Bridal Package: Bespoke Consultation + 15% off Bridal Sets' },
  { name: 'Christmas', date: '2026-12-25', region: 'US/UK', description: 'Global gifting season.', suggestedPromo: 'Holiday Sparkle: Free Gift Wrapping + Express Shipping' },
];

interface MarketingCampaign {
  id: string;
  title: string;
  platform: string;
  content: string;
  targetAudience: string;
  suggestedProducts: string[];
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Scheduled' | 'Active';
}

interface ProductGrowthPlan {
  productId: string;
  targetAudience: string;
  positioning: string;
  revenueStrategy: string;
  marketingChannels: string[];
  salesProcess: string[];
}

const MarketingPlanner: React.FC<{ products: Product[] }> = ({ products }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('India');
  const [viewMode, setViewMode] = useState<'planner' | 'calendar' | 'strategy' | 'playbook' | 'trends' | 'influencers'>('planner');
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlannerSidebarCollapsed, setIsPlannerSidebarCollapsed] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [selectedProductForStrategy, setSelectedProductForStrategy] = useState<Product | null>(null);
  const [growthPlan, setGrowthPlan] = useState<ProductGrowthPlan | null>(null);
  const [trends, setTrends] = useState<{title: string, description: string, impact: string}[]>([]);
  const [influencerMatches, setInfluencerMatches] = useState<{name: string, type: string, fit: string, idea: string}[]>([]);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);

  const filteredFestivals = GLOBAL_FESTIVALS.filter(f => f.region === selectedRegion || f.region === 'Global');
  const indiaFestivals = GLOBAL_FESTIVALS.filter(f => f.region === 'India');

  const generateCampaign = async (festival: Festival) => {
    console.log('MarketingPlanner: generateCampaign triggered for', festival.name);
    setIsGenerating(true);
    setSelectedFestival(festival);
    setViewMode('planner');
    
    try {
      // Use a more robust way to access the API key in browser environments
      const apiKey = (window as any).process?.env?.GEMINI_API_KEY || (process as any)?.env?.GEMINI_API_KEY || '';
      
      if (!apiKey) {
        console.error('MarketingPlanner: Gemini API Key is missing from environment');
        setIsGenerating(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const catalogSummary = products.map(p => `${p.name} (${p.category})`).join(', ');
      
      const prompt = `
        Create a high-end luxury marketing campaign for the festival: ${festival.name} in ${festival.region}.
        Description: ${festival.description}
        Suggested Promotion: ${festival.suggestedPromo}
        
        Available Product Catalog: ${catalogSummary}
        
        Provide the campaign in JSON format with:
        - title: Catchy campaign name
        - platform: Primary social platform (e.g., Instagram)
        - content: 2-3 sentences of luxury marketing copy
        - targetAudience: Description of the target segment
        - suggestedProducts: Array of 2-3 product names from the catalog that fit this festival
      `;

      console.log('MarketingPlanner: Sending request to Gemini AI...');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      if (!response.text) {
        throw new Error('Empty response from AI');
      }

      const data = JSON.parse(response.text);
      console.log('MarketingPlanner: Campaign generated successfully');
      
      const newCampaign: MarketingCampaign = {
        id: Math.random().toString(36).substr(2, 9),
        title: data.title || `${festival.name} Collection`,
        platform: data.platform || 'Instagram',
        content: data.content || 'Experience the pinnacle of luxury this festive season.',
        targetAudience: data.targetAudience || 'Luxury connoisseurs',
        suggestedProducts: data.suggestedProducts || [],
        startDate: festival.date,
        endDate: festival.date,
        status: 'Draft'
      };

      setCampaigns(prev => [newCampaign, ...prev]);
    } catch (error) {
      console.error('MarketingPlanner: Error generating campaign:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateGrowthPlan = async (product: Product) => {
    setIsGenerating(true);
    setSelectedProductForStrategy(product);
    try {
      const apiKey = process.env.GEMINI_API_KEY || '';
      if (!apiKey) {
        console.error('Gemini API Key is missing');
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
        Generate a detailed business growth plan for this luxury jewelry product:
        Name: ${product.name}
        Category: ${product.category}
        Price: $${product.price}
        Description: ${product.description}
        
        Provide the plan in JSON format with:
        - targetAudience: Detailed description of the ideal buyer
        - positioning: How to position this product in the luxury market
        - revenueStrategy: Specific strategy to increase revenue for this item
        - marketingChannels: Array of 3-4 recommended channels
        - salesProcess: Array of 5 clear, actionable steps to sell this piece and get new orders
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const data = JSON.parse(response.text || '{}');
      setGrowthPlan({
        productId: product.id,
        targetAudience: data.targetAudience,
        positioning: data.positioning,
        revenueStrategy: data.revenueStrategy,
        marketingChannels: data.marketingChannels,
        salesProcess: data.salesProcess
      });
    } catch (error) {
      console.error('Error generating growth plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderPlanner = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Calendar / Festival List */}
      <div className={`${isPlannerSidebarCollapsed ? 'lg:col-span-1' : 'lg:col-span-4'} space-y-6 transition-all duration-500 ease-in-out`}>
        <div className="bg-white border border-black/5 p-8 shadow-sm relative overflow-hidden h-full">
          <button 
            onClick={() => setIsPlannerSidebarCollapsed(!isPlannerSidebarCollapsed)}
            className="absolute right-4 top-8 text-lumora-taupe hover:text-lumora-gold transition-colors z-10"
            title={isPlannerSidebarCollapsed ? "Expand List" : "Collapse List"}
          >
            {isPlannerSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <div className={`flex items-center gap-3 mb-8 ${isPlannerSidebarCollapsed ? 'flex-col' : ''}`}>
            <Calendar className="text-lumora-gold" size={20} />
            {!isPlannerSidebarCollapsed && <h4 className="text-[10px] font-bold uppercase tracking-widest">Upcoming Seasons ({selectedRegion})</h4>}
          </div>

          {!isPlannerSidebarCollapsed ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
              {filteredFestivals.map((festival, idx) => (
                <div 
                  key={idx} 
                  className="group p-4 bg-lumora-bone/30 border border-transparent hover:border-lumora-gold transition-all cursor-pointer relative overflow-hidden" 
                  onClick={() => generateCampaign(festival)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-lumora-gold uppercase tracking-tighter">{new Date(festival.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span className="text-[8px] bg-lumora-charcoal text-white px-2 py-0.5 rounded-full uppercase tracking-widest">{festival.region}</span>
                  </div>
                  <h5 className="text-sm font-serif font-bold text-lumora-charcoal mb-1">{festival.name}</h5>
                  <p className="text-[10px] text-lumora-taupe leading-relaxed mb-3">{festival.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5">
                    <span className="text-[9px] font-bold text-lumora-gold italic">{festival.suggestedPromo}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        generateCampaign(festival);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-lumora-charcoal text-white text-[8px] font-bold uppercase tracking-widest hover:bg-lumora-gold transition-colors shadow-sm"
                    >
                      <Sparkles size={10} className="text-lumora-gold" />
                      Generate Campaign
                    </button>
                  </div>
                  <div className="absolute top-0 right-0 w-1 h-full bg-lumora-gold translate-x-full group-hover:translate-x-0 transition-transform" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 py-10">
              {filteredFestivals.map((festival, idx) => (
                <button 
                  key={idx}
                  onClick={() => generateCampaign(festival)}
                  className="w-10 h-10 rounded-full bg-lumora-bone flex items-center justify-center text-lumora-gold hover:bg-lumora-gold hover:text-white transition-all shadow-sm group relative"
                  title={festival.name}
                >
                  <Sparkles size={14} />
                  <div className="absolute left-full ml-4 px-3 py-1 bg-lumora-charcoal text-white text-[8px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {festival.name}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Campaign Workspace */}
      <div className={`${isPlannerSidebarCollapsed ? 'lg:col-span-11' : 'lg:col-span-8'} space-y-8 transition-all duration-500 ease-in-out`}>
        <div className="bg-lumora-charcoal text-white p-10 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Megaphone size={24} className="text-lumora-gold" />
              <h3 className="text-2xl font-serif font-bold">Campaign Intelligence</h3>
            </div>
            <p className="text-sm text-white/70 max-w-xl mb-8 leading-relaxed">
              Our AI analyzes your current inventory to suggest high-impact marketing campaigns tailored for specific cultural moments. Select a festival from the left to begin.
            </p>
            {isGenerating && (
              <div className="flex items-center gap-4 animate-pulse">
                <Loader2 className="animate-spin text-lumora-gold" size={20} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Analyzing catalog & crafting strategy for {selectedFestival?.name}...</span>
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-lumora-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Target size={16} className="text-lumora-gold" />
            Active & Draft Campaigns
          </h4>
          
          {campaigns.length === 0 ? (
            <div className="py-20 text-center bg-white border border-dashed border-black/10 opacity-40">
              <Megaphone size={48} className="mx-auto mb-4" />
              <p className="text-[10px] uppercase font-bold tracking-widest">No campaigns generated yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaigns.map(campaign => (
                <div key={campaign.id} className="bg-white border border-black/5 p-8 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                      <Instagram size={14} className="text-lumora-gold" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-lumora-taupe">{campaign.platform}</span>
                    </div>
                    <span className="text-[8px] font-bold bg-lumora-bone px-2 py-1 uppercase tracking-widest">{campaign.status}</span>
                  </div>
                  <h5 className="text-lg font-serif font-bold text-lumora-charcoal mb-3">{campaign.title}</h5>
                  <p className="text-[11px] text-lumora-taupe leading-relaxed mb-6 italic">"{campaign.content}"</p>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-lumora-taupe mb-2">Target Audience</p>
                      <p className="text-[10px] font-bold text-lumora-charcoal">{campaign.targetAudience}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-lumora-taupe mb-2">Featured Products</p>
                      <div className="flex flex-wrap gap-2">
                        {campaign.suggestedProducts.map((p, i) => (
                          <span key={i} className="text-[9px] bg-lumora-bone px-3 py-1 font-bold text-lumora-charcoal">{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-black/5 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-lumora-taupe">
                      <Calendar size={12} />
                      {new Date(campaign.startDate).toLocaleDateString()}
                    </div>
                    <button className="text-[9px] font-bold uppercase tracking-widest text-lumora-gold hover:text-lumora-charcoal transition-colors">
                      Launch Campaign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCalendar = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const monthName = currentCalendarDate.toLocaleString('default', { month: 'long' });

    const prevMonth = () => setCurrentCalendarDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentCalendarDate(new Date(year, month + 1, 1));

    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="bg-white border border-black/5 p-12 shadow-sm">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-lumora-gold/10 text-lumora-gold rounded-full flex items-center justify-center">
                <Calendar size={24} />
              </div>
              <div>
                <h4 className="text-2xl font-serif font-bold text-lumora-charcoal">{selectedRegion} Marketing Calendar</h4>
                <p className="text-[10px] text-lumora-taupe uppercase font-bold tracking-widest">Auspicious dates & planned campaigns</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex gap-4">
                <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-lumora-taupe">
                  <div className="w-2 h-2 rounded-full bg-lumora-gold" /> Festival
                </span>
                <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-lumora-taupe">
                  <div className="w-2 h-2 rounded-full bg-lumora-charcoal" /> Campaign
                </span>
              </div>
              <div className="flex items-center gap-4 border-l border-black/5 pl-8">
                <button onClick={prevMonth} className="p-2 hover:bg-lumora-bone transition-colors"><ChevronLeft size={20} /></button>
                <h5 className="text-sm font-serif font-bold text-lumora-charcoal min-w-[120px] text-center">{monthName} {year}</h5>
                <button onClick={nextMonth} className="p-2 hover:bg-lumora-bone transition-colors"><ChevronRight size={20} /></button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-black/5 border border-black/5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-lumora-bone p-4 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-lumora-taupe">{day}</span>
              </div>
            ))}
            {days.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} className="bg-white min-h-[120px]" />;
              
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayFestivals = filteredFestivals.filter(f => f.date === dateStr);
              const dayCampaigns = campaigns.filter(c => c.startDate === dateStr);
              
              return (
                <div key={day} className="bg-white min-h-[120px] p-2 hover:bg-lumora-bone/30 transition-colors group relative">
                  <span className="text-[10px] font-bold text-lumora-taupe">{day}</span>
                  <div className="mt-2 space-y-1">
                    {dayFestivals.map((f, i) => (
                      <div 
                        key={i} 
                        onClick={(e) => {
                          e.stopPropagation();
                          generateCampaign(f);
                        }}
                        className="p-1.5 bg-lumora-gold/10 border-l-2 border-lumora-gold cursor-pointer hover:bg-lumora-gold/20 transition-all flex items-center gap-1 group/item"
                      >
                        <Sparkles size={8} className="text-lumora-gold group-hover/item:scale-110 transition-transform" />
                        <p className="text-[8px] font-bold text-lumora-gold truncate">{f.name}</p>
                      </div>
                    ))}
                    {dayCampaigns.map((c, i) => (
                      <div 
                        key={i} 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCampaign(c);
                        }}
                        className="p-1 bg-lumora-charcoal/5 border-l-2 border-lumora-charcoal cursor-pointer hover:bg-lumora-charcoal/20 transition-all"
                      >
                        <p className="text-[8px] font-bold text-lumora-charcoal truncate flex items-center gap-1">
                          <Instagram size={8} /> {c.title}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-lumora-gold"
                    onClick={() => {
                      alert(`Planning for ${monthName} ${day}...`);
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Campaign Details Modal */}
        {selectedCampaign && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full p-10 shadow-2xl animate-in zoom-in duration-300 relative">
              <button 
                onClick={() => setSelectedCampaign(null)}
                className="absolute top-6 right-6 text-lumora-taupe hover:text-lumora-charcoal"
              >
                <X size={24} />
              </button>
              
              <div className="flex items-center gap-3 mb-8">
                <Instagram className="text-lumora-gold" size={20} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-lumora-taupe">{selectedCampaign.platform} Campaign</span>
              </div>
              
              <h3 className="text-3xl font-serif font-bold text-lumora-charcoal mb-4">{selectedCampaign.title}</h3>
              <p className="text-sm text-lumora-taupe leading-relaxed mb-8 italic">"{selectedCampaign.content}"</p>
              
              <div className="space-y-6">
                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-lumora-gold mb-2">Target Audience</h5>
                  <p className="text-xs text-lumora-charcoal">{selectedCampaign.targetAudience}</p>
                </div>
                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-lumora-gold mb-2">Featured Products</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedCampaign.suggestedProducts.map((p, i) => (
                      <span key={i} className="px-3 py-1 bg-lumora-bone text-[9px] font-bold text-lumora-charcoal uppercase">{p}</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-10 pt-8 border-t border-black/5 flex justify-between items-center">
                <div className="flex items-center gap-2 text-[10px] font-bold text-lumora-taupe">
                  <Calendar size={14} />
                  Starts: {new Date(selectedCampaign.startDate).toLocaleDateString()}
                </div>
                <button className="bg-lumora-charcoal text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-lumora-gold transition-all">
                  Launch Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStrategy = () => (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-black/5 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Gem className="text-lumora-gold" size={20} />
              <h4 className="text-[10px] font-bold uppercase tracking-widest">Select Product for Analysis</h4>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {products.map(product => (
                <div 
                  key={product.id} 
                  onClick={() => generateGrowthPlan(product)}
                  className={`p-4 border transition-all cursor-pointer flex gap-4 items-center ${selectedProductForStrategy?.id === product.id ? 'bg-lumora-charcoal text-white border-lumora-charcoal' : 'bg-white border-black/5 hover:border-lumora-gold'}`}
                >
                  <div className="w-12 h-12 bg-lumora-bone overflow-hidden flex-shrink-0">
                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-tight truncate w-32">{product.name}</h5>
                    <p className={`text-[9px] ${selectedProductForStrategy?.id === product.id ? 'text-white/60' : 'text-lumora-taupe'}`}>${product.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Growth Strategy Display */}
        <div className="lg:col-span-2 space-y-8">
          {!selectedProductForStrategy ? (
            <div className="h-full flex flex-col items-center justify-center py-20 bg-white border border-dashed border-black/10 opacity-40">
              <TrendingUp size={48} className="mb-4" />
              <p className="text-[10px] uppercase font-bold tracking-widest">Select a product to generate growth strategy</p>
            </div>
          ) : isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center py-20 bg-white border border-black/5">
              <Loader2 className="animate-spin text-lumora-gold mb-4" size={32} />
              <p className="text-[10px] uppercase font-bold tracking-widest animate-pulse">AI is crafting growth strategy for {selectedProductForStrategy.name}...</p>
            </div>
          ) : growthPlan ? (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="bg-white border border-black/5 p-10 shadow-sm">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex gap-6 items-center">
                    <div className="w-20 h-20 bg-lumora-bone border border-black/5 overflow-hidden">
                      <img src={selectedProductForStrategy.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-serif font-bold text-lumora-charcoal">{selectedProductForStrategy.name}</h4>
                      <p className="text-[10px] text-lumora-gold uppercase font-bold tracking-widest">Strategic Growth Plan</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe mb-1">Current Value</p>
                    <p className="text-xl font-serif font-bold text-lumora-charcoal">${selectedProductForStrategy.price.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div>
                      <h5 className="text-[10px] font-bold uppercase tracking-widest text-lumora-gold mb-3 flex items-center gap-2">
                        <Target size={14} /> Target Audience
                      </h5>
                      <p className="text-[12px] text-lumora-charcoal leading-relaxed">{growthPlan.targetAudience}</p>
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold uppercase tracking-widest text-lumora-gold mb-3 flex items-center gap-2">
                        <Layers size={14} /> Market Positioning
                      </h5>
                      <p className="text-[12px] text-lumora-charcoal leading-relaxed">{growthPlan.positioning}</p>
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold uppercase tracking-widest text-lumora-gold mb-3 flex items-center gap-2">
                        <TrendingUp size={14} /> Revenue Generation Strategy
                      </h5>
                      <p className="text-[12px] text-lumora-charcoal leading-relaxed">{growthPlan.revenueStrategy}</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-lumora-bone/30 p-6 border border-black/5">
                      <h5 className="text-[10px] font-bold uppercase tracking-widest text-lumora-charcoal mb-4">Recommended Channels</h5>
                      <div className="flex flex-wrap gap-2">
                        {growthPlan.marketingChannels.map((channel, i) => (
                          <span key={i} className="px-3 py-1 bg-white border border-black/5 text-[9px] font-bold text-lumora-charcoal uppercase tracking-widest">{channel}</span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-lumora-charcoal text-white p-8 shadow-xl">
                      <h5 className="text-[10px] font-bold uppercase tracking-widest text-lumora-gold mb-6 flex items-center gap-2">
                        <Zap size={14} /> Luxury Sales Playbook
                      </h5>
                      <div className="space-y-6">
                        {growthPlan.salesProcess.map((step, i) => (
                          <div key={i} className="flex gap-4">
                            <span className="text-lumora-gold font-serif text-lg italic opacity-50">0{i+1}</span>
                            <p className="text-[11px] leading-relaxed text-white/80">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-black/5 p-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-lumora-charcoal uppercase tracking-widest">Strategy Ready</p>
                    <p className="text-[9px] text-lumora-taupe">Implement this plan to see projected 15-20% revenue lift.</p>
                  </div>
                </div>
                <button className="px-8 py-3 bg-lumora-charcoal text-white text-[10px] font-bold uppercase tracking-widest hover:bg-lumora-gold transition-all shadow-lg">
                  Export Strategy PDF
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  const generateTrends = async () => {
    setIsGenerating(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY || '';
      if (!apiKey) {
        console.error('Gemini API Key is missing');
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Analyze current global luxury jewelry trends for 2026. Provide 4 key trends. 
      Return as JSON: { trends: [{title: string, description: string, impact: string}] }`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const data = JSON.parse(response.text || '{}');
      setTrends(data.trends || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateInfluencerMatches = async (product: Product) => {
    setIsGenerating(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY || '';
      if (!apiKey) {
        console.error('Gemini API Key is missing');
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Suggest 3 types of luxury influencers or specific profiles that would be a perfect match for this jewelry piece: ${product.name} (${product.description}). 
      Provide a collaboration idea for each.
      Return as JSON: { matches: [{name: string, type: string, fit: string, idea: string}] }`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const data = JSON.parse(response.text || '{}');
      setInfluencerMatches(data.matches || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderTrendRadar = () => (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-serif font-bold text-lumora-charcoal">Global Trend Radar</h3>
          <p className="text-[10px] text-lumora-taupe uppercase font-bold tracking-widest mt-2">AI-powered predictive fashion insights</p>
        </div>
        <button 
          onClick={generateTrends}
          disabled={isGenerating}
          className="bg-lumora-charcoal text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-lumora-gold transition-all disabled:opacity-50"
        >
          {isGenerating ? 'Analyzing Trends...' : 'Refresh Trends'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {trends.length > 0 ? trends.map((trend, i) => (
          <div key={i} className="bg-white border border-black/5 p-10 space-y-4 hover:shadow-xl transition-all">
            <div className="flex justify-between items-start">
              <h4 className="text-xl font-serif font-bold text-lumora-charcoal">{trend.title}</h4>
              <span className="bg-lumora-gold/10 text-lumora-gold px-3 py-1 text-[9px] font-bold uppercase tracking-widest">High Impact</span>
            </div>
            <p className="text-sm text-lumora-taupe leading-relaxed">{trend.description}</p>
            <div className="pt-4 border-t border-black/5">
              <p className="text-[9px] font-bold uppercase tracking-widest text-lumora-gold mb-1">Strategic Impact</p>
              <p className="text-[11px] text-lumora-charcoal italic">{trend.impact}</p>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-lumora-bone border border-dashed border-black/10">
            <p className="text-lumora-taupe text-sm italic">Click "Refresh Trends" to see what's trending in the luxury world.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderInfluencerMatch = () => (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-serif font-bold text-lumora-charcoal">Influencer Matchmaker</h3>
          <p className="text-[10px] text-lumora-taupe uppercase font-bold tracking-widest mt-2">Connecting your pieces with the right voices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1 space-y-6">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-lumora-gold">Select Product</h4>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
            {products.map(product => (
              <button
                key={product.id}
                onClick={() => {
                  setSelectedProductForStrategy(product);
                  generateInfluencerMatches(product);
                }}
                className={`w-full text-left p-4 transition-all border ${selectedProductForStrategy?.id === product.id ? 'bg-lumora-charcoal text-white border-lumora-charcoal' : 'bg-white text-lumora-charcoal border-black/5 hover:border-lumora-gold'}`}
              >
                <p className="text-[11px] font-bold uppercase tracking-widest truncate">{product.name}</p>
                <p className={`text-[9px] mt-1 ${selectedProductForStrategy?.id === product.id ? 'text-white/60' : 'text-lumora-taupe'}`}>{product.category}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {isGenerating ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-6 bg-lumora-bone border border-black/5">
              <div className="w-12 h-12 border-2 border-lumora-gold border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-lumora-charcoal animate-pulse">Finding the perfect match...</p>
            </div>
          ) : influencerMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {influencerMatches.map((match, i) => (
                <div key={i} className="bg-white border border-black/5 p-8 space-y-6 hover:shadow-xl transition-all">
                  <div className="w-16 h-16 bg-lumora-bone rounded-full flex items-center justify-center">
                    <Globe2 className="w-8 h-8 text-lumora-gold" />
                  </div>
                  <div>
                    <h5 className="text-lg font-serif font-bold text-lumora-charcoal">{match.name}</h5>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-lumora-gold mt-1">{match.type}</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-lumora-taupe mb-1">Why they fit</p>
                      <p className="text-[11px] text-lumora-charcoal leading-relaxed">{match.fit}</p>
                    </div>
                    <div className="pt-4 border-t border-black/5">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-lumora-gold mb-1">Campaign Idea</p>
                      <p className="text-[11px] text-lumora-charcoal italic">{match.idea}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center space-y-4 bg-lumora-bone border border-dashed border-black/10">
              <Target className="w-12 h-12 text-lumora-gold/30" />
              <p className="text-lumora-taupe text-sm italic">Select a product to find its ideal influencer partners.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  const renderPlaybook = () => (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="bg-lumora-charcoal text-white p-16 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <h3 className="text-4xl font-serif font-bold mb-6">The Luxury Sales Playbook</h3>
          <p className="text-lg text-white/70 leading-relaxed">
            A definitive guide to scaling your jewelry brand. Follow these exact steps to transform your inventory into revenue and build a loyal global clientele.
          </p>
        </div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-lumora-gold/10 rounded-full translate-y-1/2 translate-x-1/4 blur-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          {
            step: '01',
            title: 'Visual Storytelling',
            desc: 'Luxury is sold through the eyes. Use the AI Studio to refine your product assets into cinematic masterpieces.',
            action: 'Generate 360° reveal videos for your top 5 products.'
          },
          {
            step: '02',
            title: 'Targeted Outreach',
            desc: 'Identify your VVIP segments. Use the Intelligence tab to find high-value customers who haven\'t purchased in 90 days.',
            action: 'Send personalized WhatsApp lookbooks to top 10 clients.'
          },
          {
            step: '03',
            title: 'Seasonal Alignment',
            desc: 'Never miss a cultural moment. Use the Marketing Planner to schedule campaigns 2 weeks before major festivals.',
            action: 'Launch the Diwali Pre-Order campaign on Instagram.'
          },
          {
            step: '04',
            title: 'Bespoke Conversion',
            desc: 'Turn inquiries into commissions. Use the Concept Lab to co-create designs with clients in real-time.',
            action: 'Initiate 3 bespoke design consultations this week.'
          },
          {
            step: '05',
            title: 'Partner Synergy',
            desc: 'Scale through your network. Use the Partner Portal to push new inventory to your top-performing resellers.',
            action: 'Update reseller inventory with the new "Ethereal" collection.'
          },
          {
            step: '06',
            title: 'Financial Discipline',
            desc: 'Monitor your margins. Use the Financial Ledger to track advance payments and artisan costs.',
            action: 'Review the P&L for the last quarter to optimize production.'
          }
        ].map((item, i) => (
          <div key={i} className="bg-white border border-black/5 p-10 space-y-6 hover:shadow-xl transition-all group">
            <span className="text-4xl font-serif font-bold text-lumora-gold/20 group-hover:text-lumora-gold transition-colors">{item.step}</span>
            <h4 className="text-xl font-serif font-bold text-lumora-charcoal">{item.title}</h4>
            <p className="text-[11px] text-lumora-taupe leading-relaxed">{item.desc}</p>
            <div className="pt-6 border-t border-black/5">
              <p className="text-[9px] font-bold uppercase tracking-widest text-lumora-gold mb-2">Immediate Action</p>
              <p className="text-[10px] font-bold text-lumora-charcoal">{item.action}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-lumora-bone p-12 text-center border border-black/5">
        <h4 className="text-xl font-serif font-bold text-lumora-charcoal mb-4">Ready to scale your revenue?</h4>
        <p className="text-sm text-lumora-taupe mb-8 max-w-2xl mx-auto">
          Our AI models are trained on global luxury market trends to help you identify the exact path to profitability.
        </p>
        <button onClick={() => setViewMode('strategy')} className="bg-lumora-charcoal text-white px-12 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-lumora-gold transition-all">
          Generate Product Growth Plans
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-serif font-bold text-lumora-charcoal">Marketing Strategy Hub</h3>
          <p className="text-[10px] text-lumora-taupe uppercase font-bold tracking-widest mt-2">Global seasonal planning & AI-driven campaigns</p>
        </div>
        <div className="flex gap-8 items-center">
          <div className="flex bg-lumora-bone p-1 rounded-sm overflow-x-auto max-w-2xl">
            <button
              onClick={() => setViewMode('planner')}
              className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${viewMode === 'planner' ? 'bg-white text-lumora-charcoal shadow-sm' : 'text-lumora-taupe hover:text-lumora-charcoal'}`}
            >
              Planner
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${viewMode === 'calendar' ? 'bg-white text-lumora-charcoal shadow-sm' : 'text-lumora-taupe hover:text-lumora-charcoal'}`}
            >
              Calendar View
            </button>
            <button
              onClick={() => setViewMode('strategy')}
              className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${viewMode === 'strategy' ? 'bg-white text-lumora-charcoal shadow-sm' : 'text-lumora-taupe hover:text-lumora-charcoal'}`}
            >
              Strategy
            </button>
            <button
              onClick={() => setViewMode('trends')}
              className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${viewMode === 'trends' ? 'bg-white text-lumora-charcoal shadow-sm' : 'text-lumora-taupe hover:text-lumora-charcoal'}`}
            >
              Trends
            </button>
            <button
              onClick={() => setViewMode('influencers')}
              className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${viewMode === 'influencers' ? 'bg-white text-lumora-charcoal shadow-sm' : 'text-lumora-taupe hover:text-lumora-charcoal'}`}
            >
              Influencers
            </button>
            <button
              onClick={() => setViewMode('playbook')}
              className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${viewMode === 'playbook' ? 'bg-white text-lumora-charcoal shadow-sm' : 'text-lumora-taupe hover:text-lumora-charcoal'}`}
            >
              Playbook
            </button>
          </div>
          <div className="h-8 w-px bg-black/5" />
          <div className="flex gap-4">
            {['India', 'Dubai', 'US/UK', 'Global'].map(region => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${selectedRegion === region ? 'bg-lumora-charcoal text-white border-lumora-charcoal' : 'text-lumora-taupe border-black/5 hover:bg-black/5'}`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === 'planner' && renderPlanner()}
      {viewMode === 'calendar' && renderCalendar()}
      {viewMode === 'strategy' && renderStrategy()}
      {viewMode === 'trends' && renderTrendRadar()}
      {viewMode === 'influencers' && renderInfluencerMatch()}
      {viewMode === 'playbook' && renderPlaybook()}
    </div>
  );
};

const MOCK_METAL_HISTORY = [
  { date: 'Apr 18', gold: 7650, silver: 245 },
  { date: 'Apr 19', gold: 7700, silver: 248 },
  { date: 'Apr 20', gold: 7680, silver: 250.5 },
  { date: 'Apr 21', gold: 7720, silver: 254 },
  { date: 'Apr 22', gold: 7790, silver: 257 },
  { date: 'Apr 23', gold: 7850, silver: 259.5 },
  { date: 'Apr 24', gold: 7890, silver: 260 },
];

const STONE_OPTIONS = [
  { value: 'Natural Emerald', label: 'Natural Emerald', defaultCost: { india: 25000, global: 300 }, unit: 'ct' },
  { value: 'Natural Ruby', label: 'Natural Ruby', defaultCost: { india: 20000, global: 250 }, unit: 'ct' },
  { value: 'Natural Sapphire', label: 'Natural Sapphire', defaultCost: { india: 22000, global: 280 }, unit: 'ct' },
  { value: 'Lab-Grown Emerald', label: 'Lab-Grown Emerald (Labstone)', defaultCost: { india: 5000, global: 60 }, unit: 'ct' },
  { value: 'Lab-Grown Ruby', label: 'Lab-Grown Ruby (Labstone)', defaultCost: { india: 4000, global: 50 }, unit: 'ct' },
  { value: 'Lab-Grown Sapphire', label: 'Lab-Grown Sapphire (Labstone)', defaultCost: { india: 4500, global: 55 }, unit: 'ct' },
  { value: 'Cubic Zirconia', label: 'Cubic Zirconia (Cubic Zircon)', defaultCost: { india: 400, global: 5 }, unit: 'ct' },
  { value: 'Custom Gemstone', label: 'Custom Gemstone...', defaultCost: { india: 0, global: 0 }, unit: 'ct' },
];

const DIAMOND_OPTIONS = [
  { value: 'Natural Diamond VVS/F', label: 'Natural Diamond (VVS/F - Excellent)', defaultCost: { india: 150000, global: 1800 }, unit: 'ct' },
  { value: 'Natural Diamond VS/H', label: 'Natural Diamond (VS/H - Premium)', defaultCost: { india: 100000, global: 1200 }, unit: 'ct' },
  { value: 'Natural Diamond SI/I', label: 'Natural Diamond (SI/I - Standard)', defaultCost: { india: 65000, global: 800 }, unit: 'ct' },
  { value: 'Lab-Grown Diamond CVD', label: 'Lab-Grown Diamond (CVD - High Quality)', defaultCost: { india: 30000, global: 350 }, unit: 'ct' },
  { value: 'Lab-Grown Diamond HPHT', label: 'Lab-Grown Diamond (HPHT - Premium Lab)', defaultCost: { india: 25000, global: 300 }, unit: 'ct' },
  { value: 'Cubic Zirconia', label: 'Cubic Zirconia (Cubic Zircon)', defaultCost: { india: 400, global: 5 }, unit: 'ct' },
  { value: 'Custom Diamond Spec', label: 'Custom Diamond Spec...', defaultCost: { india: 0, global: 0 }, unit: 'ct' },
];

const PricingCalculator: React.FC<{ currentRates: any, market: 'india' | 'global' }> = ({ currentRates, market }) => {
  const [calcState, setCalcState] = useState({
    metalType: 'gold_yellow',
    purity: '18k',
    customRate: 0,
    metalWeight: 0,
    stones: [] as { id: string; name: string; weight: number; unit: 'ct' | 'g'; unitCost: number }[],
    diamonds: [] as { id: string; name: string; weight: number; unit: 'ct' | 'g'; unitCost: number }[],
    makingCost: 0,
    additionalExpenses: 0,
    margins: {
      metal: 0,
      stones: 40,
      diamonds: 40,
      overheads: 40
    },
    targetPrice: 0,
  });

  const currencySymbol = market === 'india' ? '₹' : '$';
  const marketRates = currentRates[market] || currentRates['global']; 
  
  let metalRatePerGram = 0;
  if (calcState.metalType.startsWith('gold')) {
    metalRatePerGram = marketRates.gold[calcState.purity as keyof typeof marketRates.gold] || marketRates.gold['18k'] || 0;
  } else if (calcState.metalType === 'silver') {
    metalRatePerGram = marketRates.silver[calcState.purity as keyof typeof marketRates.silver] || marketRates.silver['99.99'] || 0;
  } else if (calcState.metalType === 'platinum') {
    if (market === 'india') {
      metalRatePerGram = calcState.purity === 'Pt950' ? 3850 : 3500;
    } else {
      metalRatePerGram = calcState.purity === 'Pt950' ? 42.50 : 39.00;
    }
  } else {
    metalRatePerGram = calcState.customRate;
  }

  const totalMetalCost = calcState.metalWeight * metalRatePerGram;
  const totalStoneCost = calcState.stones.reduce((acc, s) => acc + (s.weight * s.unitCost), 0);
  const totalDiamondCost = calcState.diamonds.reduce((acc, d) => acc + (d.weight * d.unitCost), 0);
  const actualMakingCost = calcState.makingCost * calcState.metalWeight;
  const totalCost = totalMetalCost + totalStoneCost + totalDiamondCost + actualMakingCost + calcState.additionalExpenses;
  
  // Individual Pricing Logic
  const getPrice = (cost: number, margin: number) => {
    if (margin >= 100) return cost * 2; // Practical guard
    return cost / (1 - (margin / 100));
  };

  const metalPrice = getPrice(totalMetalCost, calcState.margins.metal);
  const stonesPrice = getPrice(totalStoneCost, calcState.margins.stones);
  const diamondsPrice = getPrice(totalDiamondCost, calcState.margins.diamonds);
  const overheadsPrice = getPrice(actualMakingCost + calcState.additionalExpenses, calcState.margins.overheads);

  const activePrice = metalPrice + stonesPrice + diamondsPrice + overheadsPrice;

  const updateMargin = (key: keyof typeof calcState.margins, value: number) => {
    setCalcState(prev => ({
      ...prev,
      margins: { ...prev.margins, [key]: value }
    }));
  };

  const addItem = (type: 'stones' | 'diamonds') => {
    const isDiamond = type === 'diamonds';
    const defaultOption = isDiamond ? DIAMOND_OPTIONS[0] : STONE_OPTIONS[0];
    const newItem = { 
      id: Math.random().toString(36).substr(2, 9), 
      name: defaultOption.value, 
      weight: 1, 
      unit: defaultOption.unit as 'ct' | 'g', 
      unitCost: defaultOption.defaultCost[market] || 0 
    };
    setCalcState(prev => ({ ...prev, [type]: [...prev[type], newItem] }));
  };

  const updateItem = (type: 'stones' | 'diamonds', id: string, field: string, value: any) => {
    setCalcState(prev => ({
      ...prev,
      [type]: prev[type].map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const removeItem = (type: 'stones' | 'diamonds', id: string) => {
    setCalcState(prev => ({ ...prev, [type]: prev[type].filter(item => item.id !== id) }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 p-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-end border-b border-black/5 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-lumora-bone rounded-full flex items-center justify-center text-lumora-gold border border-lumora-gold/20">
               <Calculator size={20} />
             </div>
             <h2 className="text-4xl font-serif font-bold text-lumora-charcoal">Pricing Oracle</h2>
          </div>
          <p className="text-[10px] text-lumora-taupe uppercase tracking-[0.4em] font-bold">Luxury Costing & Transparent Client Quotation</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-lumora-bone px-6 py-3 rounded-full flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[9px] font-bold uppercase tracking-widest text-lumora-charcoal">Market Live: {market.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Inputs */}
        <div className="lg:col-span-7 space-y-10">
          {/* Metal Section */}
          <section className="bg-white border border-black/5 p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-black/5 pb-4">
              <div className="flex items-center gap-3">
                <Layers size={16} className="text-lumora-gold" />
                <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-lumora-charcoal">Metal Constitution</h4>
              </div>
              <div className="text-[10px] font-bold text-lumora-gold bg-lumora-gold/5 px-3 py-1 rounded-full border border-lumora-gold/10">
                SUBTOTAL: {currencySymbol}{totalMetalCost.toLocaleString()}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Material</label>
                <select 
                  value={calcState.metalType}
                  onChange={e => {
                    const nextVal = e.target.value;
                    setCalcState(prev => ({ 
                      ...prev, 
                      metalType: nextVal,
                      purity: nextVal.startsWith('gold') ? '18k' : nextVal === 'platinum' ? 'Pt950' : '99.99'
                    }));
                  }}
                  className="w-full bg-lumora-bone border-none text-[11px] p-4 focus:ring-1 focus:ring-lumora-gold font-sans font-medium"
                >
                  <option value="gold_yellow">Yellow Gold</option>
                  <option value="gold_white">White Gold</option>
                  <option value="gold_rose">Rose Gold</option>
                  <option value="platinum">Platinum</option>
                  <option value="silver">Silver</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Purity</label>
                {calcState.metalType.startsWith('gold') ? (
                  <select 
                    value={calcState.purity}
                    onChange={e => setCalcState(prev => ({ ...prev, purity: e.target.value }))}
                    className="w-full bg-lumora-bone border-none text-[11px] p-4 focus:ring-1 focus:ring-lumora-gold"
                  >
                    <option value="24k">24k (99.9% Pure)</option>
                    <option value="22k">22k (91.6% Pure)</option>
                    <option value="18k">18k (75.0% Pure)</option>
                    <option value="14k">14k (58.5% Pure)</option>
                    <option value="9k">9k (37.5% Pure)</option>
                  </select>
                ) : calcState.metalType === 'platinum' ? (
                  <select 
                    value={calcState.purity}
                    onChange={e => setCalcState(prev => ({ ...prev, purity: e.target.value }))}
                    className="w-full bg-lumora-bone border-none text-[11px] p-4 focus:ring-1 focus:ring-lumora-gold"
                  >
                    <option value="Pt950">Pt950 (95% Pure)</option>
                    <option value="Pt900">Pt900 (90% Pure)</option>
                  </select>
                ) : (
                  <select 
                    value={calcState.purity}
                    onChange={e => setCalcState(prev => ({ ...prev, purity: e.target.value }))}
                    className="w-full bg-lumora-bone border-none text-[11px] p-4 focus:ring-1 focus:ring-lumora-gold"
                  >
                    <option value="99.99">Pure (99.9%)</option>
                    <option value="92.5">Sterling (92.5%)</option>
                  </select>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Grams</label>
                <input 
                  type="number"
                  value={calcState.metalWeight || ''}
                  onChange={e => setCalcState(prev => ({ ...prev, metalWeight: Number(e.target.value) }))}
                  className="w-full bg-lumora-bone border-none text-[11px] p-4 focus:ring-1 focus:ring-lumora-gold"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-black/5 flex justify-between items-center bg-lumora-bone/20 p-4">
              <div className="space-y-1">
                <p className="text-[8px] uppercase tracking-[0.2em] text-lumora-taupe font-bold">Current Market Rate</p>
                <p className="font-serif font-bold text-lumora-charcoal">{currencySymbol}{metalRatePerGram.toLocaleString()} <span className="text-[9px] font-sans font-normal opacity-60">per gram</span></p>
              </div>
              <div className="text-right">
                <p className="text-[8px] uppercase tracking-[0.2em] text-lumora-taupe font-bold">Total Base Cost</p>
                <p className="text-xl font-serif font-bold text-lumora-gold">{currencySymbol}{totalMetalCost.toLocaleString()}</p>
              </div>
            </div>
          </section>

          {/* Stones Section */}
          <section className="bg-white border border-black/5 p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-black/5 pb-4">
              <div className="flex items-center gap-3">
                <Gem size={16} className="text-lumora-gold" />
                <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-lumora-charcoal">Gemstones</h4>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-[10px] font-bold text-lumora-gold bg-lumora-gold/5 px-3 py-1 rounded-full border border-lumora-gold/10">
                  SUBTOTAL: {currencySymbol}{totalStoneCost.toLocaleString()}
                </div>
                <button 
                  onClick={() => addItem('stones')}
                  className="text-[9px] uppercase font-bold tracking-widest text-lumora-gold hover:underline flex items-center gap-2"
                >
                  <Plus size={12} /> Add Stone
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {calcState.stones.map((stone) => {
                const isCustomName = !STONE_OPTIONS.some(opt => opt.value === stone.name);
                const selectValue = isCustomName ? 'Custom Gemstone' : stone.name;

                return (
                  <div key={stone.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in slide-in-from-left-2 transition-all border-b border-black/5 pb-4 last:border-0 mb-4 bg-lumora-bone/10 p-3 rounded-sm">
                    <div className="space-y-2 col-span-1 md:col-span-4">
                      <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Type / Quality Select</label>
                      <select
                        value={selectValue}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === 'Custom Gemstone') {
                            updateItem('stones', stone.id, 'name', 'Custom Gemstone');
                          } else {
                            const found = STONE_OPTIONS.find(opt => opt.value === val);
                            if (found) {
                              setCalcState(prev => ({
                                ...prev,
                                stones: prev.stones.map(item => item.id === stone.id ? {
                                  ...item,
                                  name: found.value,
                                  unit: found.unit as 'ct' | 'g',
                                  unitCost: found.defaultCost[market === 'india' ? 'india' : 'global'] || 0
                                } : item)
                              }));
                            }
                          }
                        }}
                        className="w-full bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold font-sans font-medium"
                      >
                        {STONE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>

                      {(selectValue === 'Custom Gemstone' || stone.name === 'Custom Gemstone') && (
                        <input 
                          value={stone.name === 'Custom Gemstone' ? '' : stone.name}
                          onChange={e => updateItem('stones', stone.id, 'name', e.target.value)}
                          className="w-full bg-white border border-black/10 text-[10px] p-3 mt-1.5 focus:ring-1 focus:ring-lumora-gold font-serif italic"
                          placeholder="Enter custom gemstone name..."
                          required
                        />
                      )}
                    </div>

                    <div className="space-y-2 col-span-1 md:col-span-3">
                      <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Weight</label>
                      <div className="flex">
                        <input 
                          type="number"
                          value={stone.weight || ''}
                          onChange={e => updateItem('stones', stone.id, 'weight', Number(e.target.value))}
                          className="w-full bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold"
                          placeholder="0.00"
                        />
                        <select 
                          value={stone.unit}
                          onChange={e => updateItem('stones', stone.id, 'unit', e.target.value)}
                          className="bg-black/5 border-none text-[8px] font-bold p-2"
                        >
                          <option value="ct">ct</option>
                          <option value="g">g</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 col-span-1 md:col-span-2 font-mono">
                      <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Cost / {stone.unit}</label>
                      <input 
                        type="number"
                        value={stone.unitCost || ''}
                        onChange={e => updateItem('stones', stone.id, 'unitCost', Number(e.target.value))}
                        className="w-full bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="text-right pb-3 col-span-1 md:col-span-2">
                      <p className="text-[8px] uppercase font-bold text-lumora-taupe">Line Subtotal</p>
                      <p className="text-[11px] font-mono font-bold text-lumora-gold">{currencySymbol}{(stone.weight * stone.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>

                    <div className="flex justify-end col-span-1 pb-2">
                      <button 
                        onClick={() => removeItem('stones', stone.id)}
                        className="p-2.5 text-lumora-taupe hover:text-red-600 transition-colors bg-lumora-bone/50 rounded-full hover:bg-red-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {calcState.stones.length === 0 && (
                <p className="text-[9px] text-lumora-taupe italic text-center py-4 border border-dashed border-black/10">No gemstones added.</p>
              )}
            </div>
          </section>

          {/* Diamonds Section */}
          <section className="bg-white border border-black/5 p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-black/5 pb-4">
              <div className="flex items-center gap-3">
                <Sparkles size={16} className="text-lumora-gold" />
                <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-lumora-charcoal">Diamonds</h4>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-[10px] font-bold text-lumora-gold bg-lumora-gold/5 px-3 py-1 rounded-full border border-lumora-gold/10">
                  SUBTOTAL: {currencySymbol}{totalDiamondCost.toLocaleString()}
                </div>
                <button 
                  onClick={() => addItem('diamonds')}
                  className="text-[9px] uppercase font-bold tracking-widest text-lumora-gold hover:underline flex items-center gap-2"
                >
                  <Plus size={12} /> Add Diamond
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {calcState.diamonds.map((diamond) => {
                const isCustomSpec = !DIAMOND_OPTIONS.some(opt => opt.value === diamond.name);
                const selectValue = isCustomSpec ? 'Custom Diamond Spec' : diamond.name;

                return (
                  <div key={diamond.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in slide-in-from-left-2 transition-all border-b border-black/5 pb-4 last:border-0 mb-4 bg-lumora-bone/10 p-3 rounded-sm">
                    <div className="space-y-2 col-span-1 md:col-span-4">
                      <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Classification / Quality Select</label>
                      <select
                        value={selectValue}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === 'Custom Diamond Spec') {
                            updateItem('diamonds', diamond.id, 'name', 'Custom Diamond Spec');
                          } else {
                            const found = DIAMOND_OPTIONS.find(opt => opt.value === val);
                            if (found) {
                              setCalcState(prev => ({
                                ...prev,
                                diamonds: prev.diamonds.map(item => item.id === diamond.id ? {
                                  ...item,
                                  name: found.value,
                                  unit: found.unit as 'ct' | 'g',
                                  unitCost: found.defaultCost[market === 'india' ? 'india' : 'global'] || 0
                                } : item)
                              }));
                            }
                          }
                        }}
                        className="w-full bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold font-sans font-medium"
                      >
                        {DIAMOND_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>

                      {(selectValue === 'Custom Diamond Spec' || diamond.name === 'Custom Diamond Spec') && (
                        <input 
                          value={diamond.name === 'Custom Diamond Spec' ? '' : diamond.name}
                          onChange={e => updateItem('diamonds', diamond.id, 'name', e.target.value)}
                          className="w-full bg-white border border-black/10 text-[10px] p-3 mt-1.5 focus:ring-1 focus:ring-lumora-gold font-serif italic"
                          placeholder="Enter custom diamond details..."
                          required
                        />
                      )}
                    </div>

                    <div className="space-y-2 col-span-1 md:col-span-3">
                      <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Weight</label>
                      <div className="flex">
                        <input 
                          type="number"
                          value={diamond.weight || ''}
                          onChange={e => updateItem('diamonds', diamond.id, 'weight', Number(e.target.value))}
                          className="w-full bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold"
                          placeholder="0.00"
                        />
                        <select 
                          value={diamond.unit}
                          onChange={e => updateItem('diamonds', diamond.id, 'unit', e.target.value)}
                          className="bg-black/5 border-none text-[8px] font-bold p-2"
                        >
                          <option value="ct">ct</option>
                          <option value="g">g</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 col-span-1 md:col-span-2 font-mono">
                      <label className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Cost / {diamond.unit}</label>
                      <input 
                        type="number"
                        value={diamond.unitCost || ''}
                        onChange={e => updateItem('diamonds', diamond.id, 'unitCost', Number(e.target.value))}
                        className="w-full bg-lumora-bone border-none text-[10px] p-3 focus:ring-1 focus:ring-lumora-gold"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="text-right pb-3 col-span-1 md:col-span-2">
                      <p className="text-[8px] uppercase font-bold text-lumora-taupe">Line Subtotal</p>
                      <p className="text-[11px] font-mono font-bold text-lumora-gold">{currencySymbol}{(diamond.weight * diamond.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>

                    <div className="flex justify-end col-span-1 pb-2">
                      <button 
                        onClick={() => removeItem('diamonds', diamond.id)}
                        className="p-2.5 text-lumora-taupe hover:text-red-600 transition-colors bg-lumora-bone/50 rounded-full hover:bg-red-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {calcState.diamonds.length === 0 && (
                <p className="text-[9px] text-lumora-taupe italic text-center py-4 border border-dashed border-black/10">No diamond components added.</p>
              )}
            </div>
          </section>

          {/* Overheads */}
          <section className="bg-white border border-black/5 p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-black/5 pb-4">
              <div className="flex items-center gap-3">
                <Target size={16} className="text-lumora-gold" />
                <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-lumora-charcoal">Artisanal Overhead</h4>
              </div>
              <div className="text-[10px] font-bold text-lumora-gold bg-lumora-gold/5 px-3 py-1 rounded-full border border-lumora-gold/10">
                SUBTOTAL: {currencySymbol}{(actualMakingCost + calcState.additionalExpenses).toLocaleString()}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Making Charges (per gm)</label>
                <input 
                  type="number"
                  value={calcState.makingCost || ''}
                  onChange={e => setCalcState(prev => ({ ...prev, makingCost: Number(e.target.value) }))}
                  className="w-full bg-lumora-bone border-none text-[11px] p-4 focus:ring-1 focus:ring-lumora-gold"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Design & Others</label>
                <input 
                  type="number"
                  value={calcState.additionalExpenses || ''}
                  onChange={e => setCalcState(prev => ({ ...prev, additionalExpenses: Number(e.target.value) }))}
                  className="w-full bg-lumora-bone border-none text-[11px] p-4 focus:ring-1 focus:ring-lumora-gold"
                  placeholder="0.00"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white border border-black/5 p-10 space-y-10 sticky top-12 shadow-xl">
             {/* Margin Controls in Summary */}
             <div className="space-y-6 bg-lumora-bone/20 p-6 rounded-sm border border-black/5">
                <h5 className="text-[10px] uppercase font-black tracking-widest text-lumora-gold border-b border-black/5 pb-3">Profit Margin Control Panel</h5>
                
                {[
                  { key: 'metal', label: 'Metal Component', max: 100 },
                  { key: 'stones', label: 'Gemstones Component', max: 300 },
                  { key: 'diamonds', label: 'Diamond Components', max: 300 },
                  { key: 'overheads', label: 'Artisanal/Labor', max: 200 }
                ].map((margin) => (
                  <div key={margin.key} className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                       <span className="text-lumora-taupe">{margin.label}</span>
                       <span className="text-lumora-charcoal bg-white px-2 py-0.5 rounded border border-black/5">{calcState.margins[margin.key as keyof typeof calcState.margins]}%</span>
                    </div>
                    <input 
                      type="range" min="0" max={margin.max} step="1"
                      value={calcState.margins[margin.key as keyof typeof calcState.margins]}
                      onChange={e => updateMargin(margin.key as any, Number(e.target.value))}
                      className="w-full h-1 bg-lumora-bone rounded-lg appearance-none cursor-pointer accent-lumora-gold"
                    />
                  </div>
                ))}
             </div>

             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-lumora-taupe">Grand Total Client Quote</p>
                  <p className="text-6xl font-serif font-bold text-lumora-charcoal">
                    {currencySymbol}{activePrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  {totalCost === activePrice && (
                    <p className="text-[8px] text-red-500 font-bold uppercase tracking-widest text-right">Selling at Manufacturing Cost</p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="bg-lumora-bone/30 p-6 rounded-sm border border-black/5 space-y-3">
                    <p className="text-[9px] uppercase font-black tracking-widest text-lumora-gold border-b border-black/5 pb-2">Internal Cost Summary</p>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-lumora-taupe uppercase font-bold">Metal Subtotal</span>
                      <span className="font-bold">{currencySymbol}{totalMetalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-lumora-taupe uppercase font-bold">Stones Subtotal</span>
                      <span className="font-bold">{currencySymbol}{totalStoneCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-lumora-taupe uppercase font-bold">Diamonds Subtotal</span>
                      <span className="font-bold">{currencySymbol}{totalDiamondCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-lumora-taupe uppercase font-bold">Overheads Subtotal</span>
                      <span className="font-bold">{currencySymbol}{(actualMakingCost + calcState.additionalExpenses).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-black/10">
                      <p className="text-[9px] uppercase font-black tracking-widest text-lumora-charcoal">Mfg. Grand Total</p>
                      <p className="text-sm font-serif font-bold text-lumora-charcoal">{currencySymbol}{totalCost.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                     <h5 className="text-[9px] uppercase font-black tracking-widest text-lumora-gold text-center">Client Line Item Allocation</h5>
                     <div className="space-y-2">
                        <div className="flex justify-between p-3 border-b border-black/5 hover:bg-black/5 transition-colors">
                          <p className="text-[9px] uppercase font-bold text-lumora-charcoal">Metal Constitution</p>
                          <p className="text-[11px] font-bold">{currencySymbol}{metalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div className="flex justify-between p-3 border-b border-black/5 hover:bg-black/5 transition-colors">
                          <p className="text-[9px] uppercase font-bold text-lumora-charcoal">Gemstone Components</p>
                          <p className="text-[11px] font-bold">{currencySymbol}{stonesPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div className="flex justify-between p-3 border-b border-black/5 hover:bg-black/5 transition-colors">
                          <p className="text-[9px] uppercase font-bold text-lumora-charcoal">Diamond Detailing</p>
                          <p className="text-[11px] font-bold">{currencySymbol}{diamondsPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div className="flex justify-between p-3 border-b border-black/5 hover:bg-black/5 transition-colors">
                          <p className="text-[9px] uppercase font-bold text-lumora-charcoal">Artisanal & Atelier Fees</p>
                          <p className="text-[11px] font-bold">{currencySymbol}{overheadsPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div className="flex justify-between p-3 bg-lumora-charcoal text-white rounded-sm mt-4">
                          <p className="text-[9px] uppercase font-black tracking-widest">Final Client Total</p>
                          <p className="text-sm font-serif font-bold">{currencySymbol}{activePrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>
                     </div>
                  </div>

                  <div className="pt-6 border-t border-black/5 flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-[8px] uppercase tracking-widest text-lumora-taupe font-bold">Total Margin Retained</p>
                      <p className={`text-xl font-serif font-bold ${activePrice - totalCost > 0 ? 'text-green-600' : 'text-lumora-charcoal'}`}>
                        +{currencySymbol}{(activePrice - totalCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <button className="text-[8px] uppercase font-black tracking-widest bg-lumora-gold/10 text-lumora-gold px-4 py-2 border border-lumora-gold/20 hover:bg-lumora-gold hover:text-white transition-all">
                      PDF Quote
                    </button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductGallery: React.FC<{ 
  products: Product[];
  onEditProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onPublishImages?: (images: string[], product?: Product, platform?: 'Pinterest' | 'Instagram' | 'Facebook') => void;
  onUseInStudio?: (image: string) => void;
  onTrackPayments?: (product: Product) => void;
  onAddProduct?: () => void;
  onScanTag?: (productId?: string) => void;
}> = ({ products, onEditProduct, onDeleteProduct, onPublishImages, onUseInStudio, onTrackPayments, onAddProduct, onScanTag }) => {
  const [filter, setFilter] = useState<'all' | 'available' | 'sold'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Gallery image selection states
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const toggleImageSelection = (imgUrl: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedImages(prev => 
      prev.includes(imgUrl) ? prev.filter(u => u !== imgUrl) : [...prev, imgUrl]
    );
  };

  const isImageSelected = (imgUrl: string) => selectedImages.includes(imgUrl);

  const selectAllFilteredImages = () => {
    const allImgs: string[] = [];
    filteredProducts.forEach(p => {
      p.images.forEach(img => {
        if (img && !allImgs.includes(img)) allImgs.push(img);
      });
    });
    setSelectedImages(allImgs);
  };

  const clearSelection = () => {
    setSelectedImages([]);
    setIsSelectionMode(false);
  };

  const handleDownloadSelected = () => {
    if (selectedImages.length === 0) return;
    selectedImages.forEach((imgUrl, i) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = imgUrl;
        link.download = `lumora-creation-${i + 1}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, i * 200);
    });
    setFeedbackToast(`Downloading ${selectedImages.length} image(s)...`);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleCopyLinks = () => {
    if (selectedImages.length === 0) return;
    navigator.clipboard.writeText(selectedImages.join('\n'));
    setFeedbackToast(`Copied ${selectedImages.length} image link(s) to clipboard!`);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handlePublishSelected = (platform: 'Pinterest' | 'Instagram' | 'Facebook' = 'Instagram') => {
    if (selectedImages.length === 0) return;
    const matchedProduct = products.find(p => p.images.some(img => selectedImages.includes(img))) || products[0];
    onPublishImages?.(selectedImages, matchedProduct, platform);
  };

  // Filter items
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const isSoldOut = p.status === 'Sold' || p.stock === 0;
      const matchesStatus = 
        filter === 'all' ||
        (filter === 'available' && !isSoldOut) ||
        (filter === 'sold' && isSoldOut);
        
      const matchesCategory = 
        categoryFilter === 'all' || 
        p.category.toLowerCase() === categoryFilter.toLowerCase();

      return matchesStatus && matchesCategory;
    });
  }, [products, filter, categoryFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative pb-20">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed top-6 right-6 z-[160] bg-lumora-charcoal text-white px-5 py-3 rounded-sm shadow-xl border border-lumora-gold/30 text-xs font-serif flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles size={14} className="text-lumora-gold" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Header section with Selection Mode Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-black/5 pb-6">
        <div>
          <h3 className="text-xl font-serif font-bold text-lumora-charcoal">Atelier Showcase Gallery</h3>
          <p className="text-[10px] text-lumora-taupe uppercase tracking-widest font-bold mt-1">
            Visual archive of masterpieces, high jewelry photography & social assets
          </p>
        </div>
        
        {/* Status Filters & Selection Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {onScanTag && (
            <button
              type="button"
              onClick={() => onScanTag()}
              className="px-4 py-2 text-[9px] uppercase font-bold tracking-wider transition-all bg-lumora-charcoal text-white hover:bg-lumora-gold flex items-center gap-1.5 shadow-sm active:scale-95 border border-lumora-gold/30"
              title="Open QR Code Tag Scanner with live camera and ledger inspector"
            >
              <Scan size={13} className="text-lumora-gold" /> Scan Tag / QR
            </button>
          )}

          {onAddProduct && (
            <button
              type="button"
              onClick={onAddProduct}
              className="px-4 py-2 text-[9px] uppercase font-bold tracking-wider transition-all bg-lumora-gold text-white hover:bg-lumora-gold/90 flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Add a new piece to the collection"
            >
              <Plus size={13} /> Add Product
            </button>
          )}

          <button
            onClick={() => setIsSelectionMode(prev => !prev)}
            className={`px-4 py-2 text-[9px] uppercase font-bold tracking-wider transition-all border flex items-center gap-1.5 ${
              isSelectionMode || selectedImages.length > 0
                ? 'bg-lumora-gold text-white border-lumora-gold shadow-sm' 
                : 'bg-white text-lumora-taupe border-black/10 hover:border-black/30'
            }`}
          >
            <CheckCircle2 size={13} />
            {isSelectionMode ? 'Selection Active' : 'Select Images'} {selectedImages.length > 0 && `(${selectedImages.length})`}
          </button>

          {selectedImages.length > 0 && (
            <button
              onClick={selectAllFilteredImages}
              className="px-3 py-2 text-[9px] uppercase font-bold tracking-wider transition-all border bg-white text-lumora-charcoal border-black/10 hover:bg-black/5"
            >
              Select All
            </button>
          )}

          {[
            { id: 'all', label: 'All Creations' },
            { id: 'available', label: 'Available Only' },
            { id: 'sold', label: 'Sold-Out Only' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id as any)}
              className={`px-4 py-2 text-[9px] uppercase font-bold tracking-wider transition-all border ${
                filter === opt.id 
                  ? 'bg-lumora-charcoal text-white border-lumora-charcoal' 
                  : 'bg-white text-lumora-taupe border-black/10 hover:border-black/30'
              }`}
            >
              {opt.label} ({
                opt.id === 'all' ? products.length :
                opt.id === 'available' ? products.filter(p => p.status !== 'Sold' && p.stock > 0).length :
                products.filter(p => p.status === 'Sold' || p.stock === 0).length
              })
            </button>
          ))}
        </div>
      </div>

      {/* Category selection bar */}
      <div className="flex items-center gap-6 overflow-x-auto pb-2 border-b border-black/[0.03] scrollbar-hide">
        <span className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Filter Category:</span>
        {['all', 'Necklaces', 'Rings', 'Earrings', 'Bracelets', 'Bespoke'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`text-[9px] uppercase font-bold tracking-widest pb-1 transition-all border-b-2 ${
              categoryFilter === cat 
                ? 'border-lumora-gold text-lumora-gold font-bold' 
                : 'border-transparent text-lumora-taupe hover:text-lumora-charcoal'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-black/10 bg-lumora-bone/20 flex flex-col items-center justify-center">
          <LucideImage size={40} className="mx-auto text-lumora-taupe/40 mb-4" strokeWidth={1} />
          <h4 className="text-sm font-serif font-bold text-lumora-charcoal">No Showcase Items Found</h4>
          <p className="text-xs text-lumora-taupe mt-1">Try adjusting your filters or add a new piece to the collection.</p>
          {onAddProduct && (
            <button
              type="button"
              onClick={onAddProduct}
              className="mt-4 px-5 py-2.5 bg-lumora-gold text-white text-[9px] uppercase font-bold tracking-widest hover:bg-lumora-gold/90 transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              <Plus size={13} /> Add Product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const isSold = product.status === 'Sold' || product.stock === 0;
            const primaryImage = product.images[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800';
            const isSelected = isImageSelected(primaryImage);

            return (
              <div 
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  setActiveImageIndex(0);
                }}
                className={`group cursor-pointer bg-white overflow-hidden border transition-all duration-500 flex flex-col relative ${
                  isSelected 
                    ? 'border-lumora-gold ring-1 ring-lumora-gold shadow-lg' 
                    : 'border-black/[0.03] hover:shadow-2xl'
                }`}
              >
                {/* Image Showcase Container */}
                <div className="aspect-square relative overflow-hidden bg-lumora-bone">
                  <img 
                    src={primaryImage} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Image Multi-select Checkbox (Top Left) */}
                  <button
                    type="button"
                    onClick={(e) => toggleImageSelection(primaryImage, e)}
                    className={`absolute top-3 left-3 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-lumora-gold text-white shadow-lg scale-105 ring-2 ring-white opacity-100'
                        : isSelectionMode 
                          ? 'bg-white/90 text-lumora-charcoal/40 hover:bg-white hover:text-lumora-gold shadow opacity-100'
                          : 'bg-white/90 text-lumora-charcoal/60 hover:bg-white hover:text-lumora-gold backdrop-blur-sm opacity-0 group-hover:opacity-100'
                    }`}
                    title={isSelected ? 'Deselect image' : 'Select image to use or publish to social media'}
                  >
                    {isSelected ? <Check size={14} strokeWidth={3} /> : <Plus size={14} />}
                  </button>

                  {/* Multi-image count badge if piece has multiple angles */}
                  {product.images.length > 1 && (
                    <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-white">
                      <LucideImage size={10} />
                      <span className="text-[8px] font-bold">{product.images.length} photos</span>
                    </div>
                  )}

                  {/* Luxury Status Badge Overlay */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className={`text-[8px] uppercase font-bold tracking-widest px-2 py-1 rounded-sm border ${
                      isSold 
                        ? 'bg-red-50 border-red-200 text-red-600' 
                        : 'bg-green-50 border-green-200 text-green-600'
                    }`}>
                      {isSold ? 'Sold Out' : 'Available'}
                    </span>
                  </div>

                  {/* Hover visual details backdrop with Quick Social & Use actions */}
                  <div className="absolute inset-0 bg-lumora-charcoal/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                    <div className="text-center text-white w-full space-y-2">
                      <span className="text-[8px] uppercase tracking-widest font-bold text-white/70 block">
                        {product.category}
                      </span>
                      <h4 className="font-serif font-bold text-sm line-clamp-1">{product.name}</h4>
                      <p className="text-xs font-bold text-lumora-gold">${product.price.toLocaleString()}</p>
                      
                      {/* Interactive Actions within Hover */}
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPublishImages?.([primaryImage], product, 'Instagram');
                          }}
                          className="px-2.5 py-1.5 bg-lumora-gold text-white text-[8px] uppercase tracking-widest font-bold hover:bg-white hover:text-lumora-charcoal transition-all flex items-center gap-1 shadow-sm"
                          title="Publish this piece to Instagram, Pinterest or Facebook"
                        >
                          <Share2 size={10} /> Publish Social
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTrackPayments?.(product);
                          }}
                          className="px-2.5 py-1.5 bg-white text-lumora-charcoal border border-black/15 text-[8px] uppercase tracking-widest font-bold hover:bg-lumora-charcoal hover:text-white transition-all flex items-center gap-1 shadow-sm"
                          title="Track advances & payments for this jewelry piece"
                        >
                          <Receipt size={10} /> Payments
                        </button>
                        {onScanTag && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onScanTag(product.id);
                            }}
                            className="px-2.5 py-1.5 bg-lumora-charcoal text-lumora-gold border border-lumora-gold/30 text-[8px] uppercase tracking-widest font-bold hover:bg-lumora-gold hover:text-white transition-all flex items-center gap-1 shadow-sm"
                            title="Inspect physical tag QR, certificate & ledger"
                          >
                            <QrCode size={10} /> Tag QR
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product);
                            setActiveImageIndex(0);
                          }}
                          className="px-2.5 py-1.5 border border-white/30 bg-white/10 text-white text-[8px] uppercase tracking-widest font-bold hover:bg-white hover:text-lumora-charcoal transition-all"
                        >
                          Showcase
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Minimalist Caption Footer */}
                <div className="p-4 bg-white border-t border-black/[0.02]">
                  <h4 className="text-[10px] font-bold text-lumora-charcoal uppercase tracking-wider line-clamp-1">{product.name}</h4>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[8px] text-lumora-taupe font-mono">SKU: {product.sku}</span>
                    <span className="text-[10px] font-bold text-lumora-gold font-mono">${product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-black/[0.04]">
                    <span className="text-[7.5px] uppercase tracking-wider font-bold text-lumora-taupe flex items-center gap-1">
                      <Receipt size={9} className="text-lumora-gold" /> Advances & Ledger
                    </span>
                    <div className="flex items-center gap-2">
                      {onScanTag && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onScanTag(product.id);
                          }}
                          className="text-[8px] uppercase font-bold text-lumora-taupe hover:text-lumora-gold transition-colors flex items-center gap-0.5"
                          title="View tag QR"
                        >
                          <QrCode size={10} className="text-lumora-gold" /> QR
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTrackPayments?.(product);
                        }}
                        className="text-[8px] uppercase font-bold text-lumora-charcoal hover:text-lumora-gold transition-colors underline decoration-lumora-gold/40 hover:decoration-lumora-gold"
                      >
                        Track Piece &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Selection Dock */}
      {selectedImages.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-lumora-charcoal text-white px-5 sm:px-7 py-3.5 rounded-full shadow-2xl border border-lumora-gold/40 flex items-center gap-4 sm:gap-6 animate-in slide-in-from-bottom-5 duration-300 max-w-[95vw]">
          <div className="flex items-center gap-2 pr-3 border-r border-white/15 shrink-0">
            <CheckCircle2 size={16} className="text-lumora-gold" />
            <span className="text-xs font-serif font-bold whitespace-nowrap">
              {selectedImages.length} {selectedImages.length === 1 ? 'Image' : 'Images'} Selected
            </span>
          </div>

          {/* Mini Thumbnails Strip */}
          <div className="hidden md:flex items-center gap-1.5 max-w-[180px] overflow-x-auto scrollbar-none py-1">
            {selectedImages.slice(0, 4).map((img, i) => (
              <div key={i} className="relative w-7 h-7 rounded-sm overflow-hidden border border-lumora-gold/50 shrink-0">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => toggleImageSelection(img)}
                  className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[8px]"
                  title="Remove from selection"
                >
                  ✕
                </button>
              </div>
            ))}
            {selectedImages.length > 4 && (
              <span className="text-[8px] text-lumora-gold font-bold px-1">+{selectedImages.length - 4}</span>
            )}
          </div>

          {/* Actions Bar */}
          <div className="flex items-center gap-2">
            {/* Direct Social Publish Platform Buttons */}
            <div className="flex items-center bg-white/10 rounded-full p-0.5">
              <button
                type="button"
                onClick={() => handlePublishSelected('Instagram')}
                className="px-3 py-1.5 rounded-full hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white transition-all text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-white"
                title="Publish selected images to Instagram"
              >
                <Instagram size={12} /> <span className="hidden sm:inline">Instagram</span>
              </button>
              <button
                type="button"
                onClick={() => handlePublishSelected('Pinterest')}
                className="px-3 py-1.5 rounded-full hover:bg-[#BD081C] hover:text-white transition-all text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-white"
                title="Publish selected images to Pinterest"
              >
                <Pin size={12} /> <span className="hidden sm:inline">Pinterest</span>
              </button>
              <button
                type="button"
                onClick={() => handlePublishSelected('Facebook')}
                className="px-3 py-1.5 rounded-full hover:bg-[#1877F2] hover:text-white transition-all text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-white"
                title="Publish selected images to Facebook"
              >
                <Facebook size={12} /> <span className="hidden sm:inline">Facebook</span>
              </button>
            </div>

            {/* AI Studio action */}
            <button
              type="button"
              onClick={() => onUseInStudio?.(selectedImages[0])}
              className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-lumora-gold transition-colors"
              title="Use in AI Creative Studio"
            >
              <Wand2 size={15} />
            </button>

            {/* Download selected images */}
            <button
              type="button"
              onClick={handleDownloadSelected}
              className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-lumora-gold transition-colors"
              title="Download selected images"
            >
              <Download size={15} />
            </button>

            {/* Copy image links */}
            <button
              type="button"
              onClick={handleCopyLinks}
              className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-lumora-gold transition-colors"
              title="Copy image URLs"
            >
              <Copy size={15} />
            </button>

            {/* Clear Selection */}
            <button
              type="button"
              onClick={clearSelection}
              className="text-[9px] font-bold uppercase tracking-widest text-white/50 hover:text-white pl-2 border-l border-white/15"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Showcase Lightbox Modal with Multi-Image Selection & Broadcast */}
      {selectedProduct && (() => {
        const currentImg = selectedProduct.images[activeImageIndex] || selectedProduct.images[0];
        const isCurrentSelected = isImageSelected(currentImg);

        return (
          <div className="fixed inset-0 bg-lumora-charcoal/95 backdrop-blur-md flex items-center justify-center z-[130] p-4 sm:p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl rounded-sm shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[80vh]">
              
              {/* Visual Section (Left) */}
              <div className="flex-1 bg-lumora-bone flex flex-col justify-between p-6 relative overflow-hidden h-1/2 md:h-full">
                {/* Top Bar inside image section */}
                <div className="flex justify-between items-center z-10 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe bg-white/90 px-2 py-1 rounded-sm">
                      Image {activeImageIndex + 1} of {selectedProduct.images.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleImageSelection(currentImg)}
                      className={`px-3 py-1 rounded-sm text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                        isCurrentSelected
                          ? 'bg-lumora-gold text-white shadow'
                          : 'bg-white/90 text-lumora-charcoal hover:bg-white'
                      }`}
                    >
                      {isCurrentSelected ? <Check size={12} strokeWidth={3} /> : <Plus size={12} />}
                      {isCurrentSelected ? 'Selected for Social' : 'Select Image'}
                    </button>
                  </div>

                  <span className={`text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-sm border ${
                    selectedProduct.status === 'Sold' || selectedProduct.stock === 0
                      ? 'bg-red-50 border-red-200 text-red-600' 
                      : 'bg-green-50 border-green-200 text-green-600'
                  }`}>
                    {selectedProduct.status === 'Sold' || selectedProduct.stock === 0 ? 'Sold Out' : 'Available'}
                  </span>
                </div>

                {/* Main Image View */}
                <div className="flex-1 flex items-center justify-center min-h-0 py-4 relative">
                  <img 
                    src={currentImg} 
                    alt={selectedProduct.name} 
                    className="max-h-full max-w-full object-contain transition-all duration-500 shadow-sm" 
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Direct Action Overlay for Current Image */}
                <div className="z-10 flex flex-col items-center gap-3">
                  <div className="flex flex-wrap items-center justify-center gap-2 bg-lumora-charcoal/85 backdrop-blur-md px-4 py-2 rounded-full text-white text-[9px] font-bold uppercase tracking-wider">
                    <span className="text-white/60 pr-1 hidden sm:inline">Use Image:</span>
                    <button
                      type="button"
                      onClick={() => onPublishImages?.([currentImg], selectedProduct, 'Instagram')}
                      className="hover:text-lumora-gold transition-colors flex items-center gap-1 px-2 py-0.5"
                    >
                      <Instagram size={12} /> Instagram
                    </button>
                    <span className="text-white/20">•</span>
                    <button
                      type="button"
                      onClick={() => onPublishImages?.([currentImg], selectedProduct, 'Pinterest')}
                      className="hover:text-lumora-gold transition-colors flex items-center gap-1 px-2 py-0.5"
                    >
                      <Pin size={12} /> Pinterest
                    </button>
                    <span className="text-white/20">•</span>
                    <button
                      type="button"
                      onClick={() => onPublishImages?.([currentImg], selectedProduct, 'Facebook')}
                      className="hover:text-lumora-gold transition-colors flex items-center gap-1 px-2 py-0.5"
                    >
                      <Facebook size={12} /> Facebook
                    </button>
                    <span className="text-white/20">•</span>
                    <button
                      type="button"
                      onClick={() => onUseInStudio?.(currentImg)}
                      className="hover:text-lumora-gold transition-colors flex items-center gap-1 px-2 py-0.5"
                    >
                      <Wand2 size={12} /> AI Studio
                    </button>
                    <span className="text-white/20">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = currentImg;
                        link.download = `${selectedProduct.name.toLowerCase().replace(/\s+/g, '-')}-${activeImageIndex + 1}.jpg`;
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="hover:text-lumora-gold transition-colors flex items-center gap-1 px-2 py-0.5"
                    >
                      <Download size={12} /> Download
                    </button>
                  </div>

                  {/* Image Thumbnails Carousel with Checkbox Badges */}
                  {selectedProduct.images.length > 1 && (
                    <div className="flex justify-center gap-2 overflow-x-auto pb-1 shrink-0 z-10">
                      {selectedProduct.images.map((img, idx) => {
                        const isThumbSelected = isImageSelected(img);
                        return (
                          <div key={idx} className="relative group/thumb">
                            <button
                              type="button"
                              onClick={() => setActiveImageIndex(idx)}
                              className={`w-12 h-12 bg-white border rounded-sm overflow-hidden transition-all block ${
                                activeImageIndex === idx 
                                  ? 'border-lumora-gold ring-2 ring-lumora-gold scale-105' 
                                  : 'border-black/10 opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                            
                            {/* Selection Checkmark on Thumbnail */}
                            <button
                              type="button"
                              onClick={(e) => toggleImageSelection(img, e)}
                              className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] transition-all ${
                                isThumbSelected 
                                  ? 'bg-lumora-gold text-white shadow ring-1 ring-white' 
                                  : 'bg-black/60 text-white/80 opacity-0 group-hover/thumb:opacity-100'
                              }`}
                              title={isThumbSelected ? 'Deselect image' : 'Select image'}
                            >
                              {isThumbSelected ? <Check size={10} strokeWidth={3} /> : '+'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Content & Details Section (Right) */}
              <div className="w-full md:w-[380px] lg:w-[420px] border-l border-black/5 p-8 flex flex-col justify-between h-1/2 md:h-full bg-white">
                <div className="space-y-6 overflow-y-auto pr-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.25em] font-bold text-lumora-taupe mb-1">{selectedProduct.category}</p>
                      <h3 className="text-xl font-serif font-bold text-lumora-charcoal leading-tight">{selectedProduct.name}</h3>
                    </div>
                    <button 
                      onClick={() => setSelectedProduct(null)} 
                      className="text-lumora-taupe hover:text-black transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Social & Media Publishing Quick Card */}
                  <div className="bg-lumora-bone/50 p-4 border border-black/5 rounded-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe flex items-center gap-1.5">
                        <Share2 size={11} className="text-lumora-gold" />
                        Social Media Broadcast
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const allProductImgs = selectedProduct.images;
                          setSelectedImages(prev => Array.from(new Set([...prev, ...allProductImgs])));
                        }}
                        className="text-[8px] uppercase font-bold text-lumora-gold hover:underline"
                      >
                        Select All ({selectedProduct.images.length})
                      </button>
                    </div>

                    <p className="text-[10px] text-lumora-taupe">
                      Broadcast this piece's imagery directly to your connected luxury channels:
                    </p>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const imgsToPublish = selectedProduct.images.filter(img => selectedImages.includes(img));
                          onPublishImages?.(imgsToPublish.length > 0 ? imgsToPublish : [currentImg], selectedProduct, 'Instagram');
                        }}
                        className="py-2 px-1 bg-white hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white border border-black/10 rounded-sm text-[8px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                      >
                        <Instagram size={11} /> Instagram
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const imgsToPublish = selectedProduct.images.filter(img => selectedImages.includes(img));
                          onPublishImages?.(imgsToPublish.length > 0 ? imgsToPublish : [currentImg], selectedProduct, 'Pinterest');
                        }}
                        className="py-2 px-1 bg-white hover:bg-[#BD081C] hover:text-white border border-black/10 rounded-sm text-[8px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                      >
                        <Pin size={11} /> Pinterest
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const imgsToPublish = selectedProduct.images.filter(img => selectedImages.includes(img));
                          onPublishImages?.(imgsToPublish.length > 0 ? imgsToPublish : [currentImg], selectedProduct, 'Facebook');
                        }}
                        className="py-2 px-1 bg-white hover:bg-[#1877F2] hover:text-white border border-black/10 rounded-sm text-[8px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                      >
                        <Facebook size={11} /> Facebook
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-b border-black/5 py-4 flex justify-between items-center">
                    <div>
                      <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe mb-1">Pricing Guide</p>
                      <p className="text-lg font-bold text-lumora-gold font-mono">${selectedProduct.price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe mb-1">Stock Availability</p>
                      <p className="text-xs font-bold text-lumora-charcoal">
                        {selectedProduct.stock} {selectedProduct.stock === 1 ? 'Piece' : 'Pieces'} left
                      </p>
                    </div>
                  </div>

                  {/* Piece Payments & Advances Ledger Snapshot */}
                  <div className="bg-lumora-bone/50 p-3.5 border border-black/5 rounded-sm flex items-center justify-between">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider font-bold text-lumora-taupe flex items-center gap-1 mb-0.5">
                        <Receipt size={10} className="text-lumora-gold" /> Piece Financial Realization
                      </span>
                      <p className="text-[10px] text-lumora-charcoal font-medium">Track client advances, balances & vendor invoices</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(null);
                        onTrackPayments?.(selectedProduct);
                      }}
                      className="px-2.5 py-1.5 bg-white text-lumora-charcoal border border-black/10 hover:border-lumora-gold hover:text-lumora-gold text-[8px] uppercase tracking-widest font-bold flex items-center gap-1 transition-all rounded-sm shadow-xs whitespace-nowrap"
                    >
                      Ledger &rarr;
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Piece Specifications</p>
                    <div className="grid grid-cols-2 gap-4 bg-lumora-bone/45 p-4 border border-black/5 text-[10px]">
                      <div>
                        <span className="text-lumora-taupe block uppercase font-bold text-[7px] tracking-wider">SKU Code</span>
                        <span className="font-mono text-lumora-charcoal font-bold">{selectedProduct.sku}</span>
                      </div>
                      <div>
                        <span className="text-lumora-taupe block uppercase font-bold text-[7px] tracking-wider">Primary Metal</span>
                        <span className="text-lumora-charcoal font-bold">{selectedProduct.material || '18k Yellow Gold'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Creative Description</p>
                    <p className="text-xs text-lumora-taupe leading-relaxed font-serif italic whitespace-pre-wrap">
                      "{selectedProduct.description || 'This masterfully finished gemstone setting is the embodiment of classic Lumora Atelier artistry.'}"
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 border-t border-black/5 flex gap-2.5 bg-white">
                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      onEditProduct(selectedProduct);
                    }}
                    className="flex-1 py-3 text-[9px] uppercase font-bold tracking-widest border border-black/10 hover:bg-black/5 transition-all text-center text-lumora-charcoal"
                  >
                    Edit Piece
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      onTrackPayments?.(selectedProduct);
                    }}
                    className="flex-1 py-3 text-[9px] uppercase font-bold tracking-widest bg-lumora-charcoal text-white hover:bg-lumora-gold transition-all text-center flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Receipt size={12} className="text-lumora-gold" /> Payments & Advances
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this piece from the archival showcase?")) {
                        onDeleteProduct(selectedProduct.id);
                        setSelectedProduct(null);
                      }
                    }}
                    className="px-3.5 py-3 text-[9px] uppercase font-bold tracking-widest border border-red-100 hover:bg-red-50 text-red-600 transition-all text-center"
                    title="Archive/Delete from Showcase"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
};
const MarketAnalysisView: React.FC<{ market: 'india' | 'global' }> = ({ market }) => {
  const isIndia = market === 'india';
  
  const weeklyGrowth = 3.2;
  const monthlyGrowth = 12.8;
  const prediction = {
    trend: 'Bullish (Ascending)',
    expectedRange: isIndia ? "₹7,920 - ₹8,200" : "$83.5 - $87.0",
    confidence: 85,
    drivers: ["Increased Central Bank Acquisitions", "Geopolitical Safe-haven Demand", "Festive Season Influx"]
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white border border-black/5 p-10 space-y-10 shadow-sm overflow-hidden relative">
          <div className="flex justify-between items-end relative z-10">
            <div className="space-y-1">
              <h4 className="text-xl font-serif font-bold">Historical Trajectory</h4>
              <p className="text-[9px] text-lumora-taupe uppercase tracking-widest font-bold">Last 7 Days (24K Gold)</p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-[8px] uppercase tracking-widest text-lumora-taupe font-bold">Weekly</p>
                <p className="text-[11px] font-bold text-green-600">+{weeklyGrowth}%</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] uppercase tracking-widest text-lumora-taupe font-bold">Monthly</p>
                <p className="text-[11px] font-bold text-green-600">+{monthlyGrowth}%</p>
              </div>
            </div>
          </div>
          
          <div className="h-40 flex items-end justify-between gap-3 relative z-10">
            {MOCK_METAL_HISTORY.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                <div 
                  className="w-full bg-lumora-bone group-hover/bar:bg-lumora-gold/20 transition-all cursor-pointer relative"
                  style={{ height: `${(d.gold / 8500) * 100}%` }}
                >
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-lumora-gold opacity-30 shadow-[0_0_10px_rgba(197,160,89,0.5)]" />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-lumora-charcoal text-white text-[8px] px-2 py-0.5 whitespace-nowrap rounded-sm z-20">
                    {market === 'india' ? '₹' : '$'}{d.gold}
                  </div>
                </div>
                <span className="text-[9px] uppercase tracking-tighter text-lumora-taupe font-bold">{d.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-lumora-charcoal text-white p-10 space-y-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
            <TrendingUp size={140} />
          </div>
          
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-1.5 bg-lumora-gold rounded-full animate-ping" />
              <p className="text-[10px] text-lumora-gold uppercase tracking-[0.3em] font-bold">Weekly Forecasting Engine</p>
            </div>
            <h4 className="text-2xl font-serif font-bold text-white leading-tight">Projected Market Sentiment for Next 7 Days</h4>
          </div>

          <div className="grid grid-cols-2 gap-10 relative z-10">
            <div className="space-y-1">
              <p className="text-[9px] uppercase tracking-widest text-lumora-taupe font-bold">Trend Analysis</p>
              <p className="text-xl font-serif font-bold text-green-400 flex items-center gap-2">
                <ArrowUpRight size={18} /> {prediction.trend}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] uppercase tracking-widest text-lumora-taupe font-bold">Target Range (g)</p>
              <p className="text-xl font-serif font-bold text-lumora-gold">{prediction.expectedRange}</p>
            </div>
          </div>

          <div className="space-y-4 pt-8 border-t border-white/10 relative z-10">
            <p className="text-[9px] uppercase tracking-widest text-lumora-taupe font-bold mb-3 font-mono opacity-60 italic">Key Predictive Drivers</p>
            <div className="flex flex-wrap gap-2">
              {prediction.drivers.map(d => (
                <span key={d} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-sm text-[9px] font-bold text-white/80">{d}</span>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 relative z-10 border-t border-white/5 mt-4">
            <div className="flex gap-1.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-4 h-1 ${i < 4 ? 'bg-lumora-gold' : 'bg-white/10'}`} />
              ))}
            </div>
            <span className="text-[9px] font-bold text-lumora-gold uppercase tracking-widest font-mono">Precision Confidence: {prediction.confidence}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'prospects' | 'inventory' | 'inventory_master' | 'production' | 'orders' | 'custom' | 'craftsmen' | 'resellers' | 'payments' | 'studio' | 'analytics' | 'customers' | 'settings' | 'marketing' | 'calculator' | 'gallery' | 'ai_concierge'>('dashboard');
  const [isFloatingAiOpen, setIsFloatingAiOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [isMagicMode, setIsMagicMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Production Connectivity State
  const [initiateProductionForOrderId, setInitiateProductionForOrderId] = useState<string | null>(null);
  const [highlightedProductionJobId, setHighlightedProductionJobId] = useState<string | null>(null);
  const [selectedPaymentProductId, setSelectedPaymentProductId] = useState<string | null>(null);
  
  // Product Management State
  const [products, setProducts] = useState<Product[]>(MOCK_INVENTORY);
  const [productionJobs, setProductionJobs] = useState<ProductionJob[]>(MOCK_PRODUCTION_JOBS);
  const [rateMode, setRateMode] = useState<'live' | 'custom'>(() => {
    const saved = localStorage.getItem('lumora_rate_mode');
    return (saved as 'live' | 'custom') || 'custom'; // Default to custom as requested
  });
  const [metalRates, setMetalRates] = useState(() => {
    try {
      const saved = localStorage.getItem('lumora_metal_rates');
      return saved ? JSON.parse(saved) : INITIAL_METAL_RATES;
    } catch {
      return INITIAL_METAL_RATES;
    }
  });
  const [marketView, setMarketView] = useState<'india' | 'global'>('india');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productPreviews, setProductPreviews] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState<string | null>(null); // Product ID being published
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [intelligenceReport, setIntelligenceReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isCatalogNameModalOpen, setIsCatalogNameModalOpen] = useState(false);
  const [catalogName, setCatalogName] = useState('');

  // --- SUPABASE DATA SYNC ---
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!supabase) {
        setIsSyncing(false);
        return;
      }

      setIsSyncing(true);
      try {
        const { data: productsData, error: prodErr } = await supabase.from('products').select('*');
        if (!prodErr && productsData && productsData.length > 0) setProducts(productsData);

        const { data: jobsData, error: jobsErr } = await supabase.from('production_jobs').select('*');
        if (!jobsErr && jobsData && jobsData.length > 0) setProductionJobs(jobsData);

        const { data: customersData, error: custErr } = await supabase.from('customers').select('*');
        if (!custErr && customersData && customersData.length > 0) setCustomers(customersData);

        const { data: ledgerData, error: ledgErr } = await supabase.from('ledger').select('*');
        if (!ledgErr && ledgerData && ledgerData.length > 0) {
          const mappedLedger = ledgerData.map((l: any) => ({
            id: l.id || `LED-${Date.now()}`,
            date: l.date || l.created_at || new Date().toISOString(),
            type: l.type || 'sale',
            category: l.category || 'Inflow',
            amount: Number(l.amount || 0),
            status: 'completed',
            description: l.note || '',
            paymentMethod: 'Bank Transfer'
          }));
          setLedger(mappedLedger);
        }

        const { data: resellersData, error: resErr } = await supabase.from('resellers').select('*');
        if (!resErr && resellersData && resellersData.length > 0) setResellers(resellersData);

        const { data: bespokeData, error: bespErr } = await supabase.from('bespoke_orders').select('*');
        if (!bespErr && bespokeData && bespokeData.length > 0) setBespokeOrders(bespokeData);

        try {
          const { data: repairData, error: repErr } = await supabase.from('repair_jobs').select('*');
          if (!repErr && repairData && repairData.length > 0) {
            const mappedRepairs = repairData.map((rj: any) => ({
              id: rj.id,
              customerName: rj.customer_name || rj.customerName,
              customerPhone: rj.customer_phone || rj.customerPhone,
              customerEmail: rj.customer_email || rj.customerEmail,
              itemDescription: rj.item_description || rj.itemDescription,
              repairDetails: rj.repair_details || rj.repairDetails,
              costEstimate: Number(rj.cost_estimate || rj.costEstimate || 0),
              status: rj.status,
              assignedCraftsmanId: rj.assigned_craftsman_id || rj.assignedCraftsmanId,
              assignedCraftsmanName: rj.assigned_craftsman_name || rj.assignedCraftsmanName,
              notes: rj.notes,
              createdAt: rj.created_at || rj.createdAt || new Date().toISOString(),
              updatedAt: rj.updated_at || rj.updatedAt || new Date().toISOString()
            }));
            setRepairJobs(mappedRepairs);
          }
        } catch (repairError) {
          console.warn('Could not load repair jobs from Supabase:', repairError);
        }
      } catch (error) {
        console.warn('Supabase offline or remote database unreachable, running in local persistence mode:', error);
      } finally {
        setIsSyncing(false);
      }
    };
    loadData();
  }, []);

  // Helper to sync changes gracefully
  const syncEntity = async (table: string, data: any) => {
    if (!supabase) return;
    try {
      let payload = { ...data };
      if (table === 'ledger') {
        // Map LedgerEntry fields to schema columns
        payload = {
          type: data.type || 'sale',
          category: data.category || 'Inflow',
          amount: data.amount,
          note: data.description || data.customerName || data.craftsmanName || '',
          reference_id: data.relatedOrderId || data.craftsmanTaskId || data.id,
          date: data.date ? data.date.split('T')[0] : new Date().toISOString().split('T')[0]
        };
        // Only provide ID if it is a valid UUID
        if (data.id && data.id.length === 36 && data.id.includes('-')) {
          (payload as any).id = data.id;
        }
      }

      const { error } = await supabase.from(table).upsert(payload);
      if (error) {
        console.warn(`Supabase notice for ${table}:`, error.message || error);
      }
    } catch (error: any) {
      console.warn(`Supabase offline or unreachable for ${table}:`, error?.message || 'Disconnected');
    }
  };

  const syncRepairJob = async (job: RepairJob) => {
    if (!supabase) return;
    try {
      const dbRow = {
        id: job.id,
        customer_name: job.customerName,
        customer_phone: job.customerPhone,
        customer_email: job.customerEmail,
        item_description: job.itemDescription,
        repair_details: job.repairDetails,
        cost_estimate: job.costEstimate,
        status: job.status,
        assigned_craftsman_id: job.assignedCraftsmanId,
        assigned_craftsman_name: job.assignedCraftsmanName,
        notes: job.notes,
        created_at: job.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase.from('repair_jobs').upsert(dbRow);
      if (error) {
        console.warn('Supabase notice syncing repair job:', error.message || error);
      }
    } catch (error: any) {
      console.warn('Supabase offline or unreachable for repair job:', error?.message || 'Disconnected');
    }
  };

  const deleteRepairJobFromSupabase = async (id: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('repair_jobs').delete().eq('id', id);
      if (error) {
        console.warn('Supabase notice deleting repair job:', error.message || error);
      }
    } catch (error: any) {
      console.warn('Supabase offline or unreachable for repair job delete:', error?.message || 'Disconnected');
    }
  };

    const generatePDF = async (name: string) => {
    if (selectedProductIds.length === 0) return;
    setIsGeneratingPDF(true);
    setIsCatalogNameModalOpen(false);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));
      const goldColor = [197, 160, 89]; // Atelier Gold
      const charcoalColor = [26, 26, 26];
      const boneColor = [245, 242, 237];
      
      const bName = (brandConfig.brandName || "LUMORA").toUpperCase();
      const bSub = (brandConfig.brandSub || "PRIVATE ATELIER • EST. 2026").toUpperCase();
      const bTagline = brandConfig.tagline || "The Masterpiece Collection";
      const bWebsite = brandConfig.website || "www.lumora.com";
      const bEmail = brandConfig.email || "atelier@lumora.com";
      const bPhone = brandConfig.phone || "+1 (800) LUMORA-0";
      const bManifestoTitle = brandConfig.manifestoTitle || "The Philosophy of Craft";
      const bManifesto1 = brandConfig.manifestoParagraph1 || "At our studio, we believe that jewelry is not merely an accessory, but a vessel for history, emotion, and unparalleled artistry.";
      const bManifesto2 = brandConfig.manifestoParagraph2 || "Each piece in this collection has been meticulously conceived in our private design lab and brought to life by master artisans who have dedicated their lives to the perfection of their craft.";
      const bManifesto3 = brandConfig.manifestoParagraph3 || "From the initial spark of inspiration to the final setting of a rare gemstone, our process is one of patience, precision, and passion. We do not chase trends; we create legacies.";
      const bCert1 = brandConfig.certificateNote1 || "All pieces featured in this catalog are accompanied by a Certificate of Authenticity";
      const bCert2 = brandConfig.certificateNote2 || "and are subject to the Atelier's standard terms of bespoke craftsmanship.";

      // --- 1. COVER PAGE ---
      doc.setFillColor(charcoalColor[0], charcoalColor[1], charcoalColor[2]);
      doc.rect(0, 0, 210, 297, 'F');
      
      // Decorative border
      doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, 190, 277);
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("times", "bold");
      // Adjust font size dynamically if brand name is too long to prevent overflow
      const nameFontSize = bName.length > 15 ? 36 : 48;
      doc.setFontSize(nameFontSize);
      doc.text(bName, 105, 100, { align: "center", charSpace: 3 });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.text(bSub, 105, 110, { align: "center", charSpace: 2 });
      
      doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.line(95, 115, 115, 115);
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("times", "italic");
      doc.setFontSize(32);
      doc.text(name || bTagline, 105, 160, { align: "center" });
      
      // Decorative Seal
      doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.setLineWidth(0.2);
      doc.circle(105, 210, 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5);
      doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.text("CERTIFIED", 105, 208, { align: "center" });
      doc.text("ORIGINAL", 105, 212, { align: "center" });
      // Shorter brand name for seal to avoid overlapping
      const sealName = bName.length > 10 ? bName.split(' ')[0] : bName;
      doc.text(sealName, 105, 216, { align: "center" });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text("FOR PRIVATE CIRCULATION ONLY", 105, 270, { align: "center", charSpace: 2 });

      // --- 2. MANIFESTO PAGE ---
      doc.addPage();
      doc.setFillColor(boneColor[0], boneColor[1], boneColor[2]);
      doc.rect(0, 0, 210, 297, 'F');
      
      doc.setDrawColor(charcoalColor[0], charcoalColor[1], charcoalColor[2]);
      doc.setLineWidth(0.1);
      doc.rect(15, 15, 180, 267);

      doc.setTextColor(charcoalColor[0], charcoalColor[1], charcoalColor[2]);
      doc.setFont("times", "italic");
      doc.setFontSize(24);
      doc.text(bManifestoTitle, 105, 60, { align: "center" });
      
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      const manifesto = [
        bManifesto1,
        "",
        bManifesto2,
        "",
        bManifesto3,
        "",
        `Welcome to the ${brandConfig.brandName || "Lumora"} Atelier.`
      ];
      const splitManifesto = doc.splitTextToSize(manifesto.join("\n"), 140);
      doc.text(splitManifesto, 105, 90, { align: "center", lineHeightFactor: 1.5 });

      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.text(bName, 105, 240, { align: "center", charSpace: 2 });

      // --- 2.5 TABLE OF CONTENTS (If > 1 product) ---
      if (selectedProducts.length > 1) {
        doc.addPage();
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, 210, 297, 'F');
        
        doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text("INDEX OF MASTERPIECES", 105, 40, { align: "center", charSpace: 3 });
        
        doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
        doc.line(95, 45, 115, 45);
        
        doc.setTextColor(charcoalColor[0], charcoalColor[1], charcoalColor[2]);
        doc.setFont("times", "bold");
        doc.setFontSize(24);
        doc.text("The Collection", 105, 65, { align: "center" });
        
        let tocY = 90;
        selectedProducts.forEach((p, idx) => {
          doc.setFont("times", "normal");
          doc.setFontSize(12);
          doc.text(p.name.toUpperCase(), 40, tocY);
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text(`${idx + 1}`, 170, tocY, { align: "right" });
          
          doc.setDrawColor(240, 240, 240);
          doc.line(40, tocY + 2, 170, tocY + 2);
          tocY += 12;
        });
      }

      // --- 3. PRODUCT PAGES ---
      for (let i = 0; i < selectedProducts.length; i++) {
        const product = selectedProducts[i];
        doc.addPage();
        
        // Subtle background
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, 210, 297, 'F');
        
        // Page Number & Header
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(180, 180, 180);
        doc.text(`PAGE ${i + 1} OF ${selectedProducts.length}`, 190, 15, { align: "right" });
        doc.text(`${bName} ATELIER`, 20, 15, { charSpace: 1 });
        
        // Filter out empty/blank image URLs
        const productImages = (product.images || []).filter(url => url && url.trim() !== "");
        
        // Multi-image renderer that scales, centers, and prevents skewing
        const drawImageInBox = async (imgUrl: string, bx: number, by: number, bw: number, bh: number) => {
          // Draw subtle background frame
          doc.setFillColor(252, 250, 247); // Warm bone tint
          doc.rect(bx, by, bw, bh, 'F');
          
          // Draw very fine golden/neutral border
          doc.setDrawColor(230, 225, 215);
          doc.setLineWidth(0.15);
          doc.rect(bx, by, bw, bh, 'D');
          
          if (!imgUrl) {
            // Elegant placeholder
            doc.setFont("times", "italic");
            doc.setFontSize(8);
            doc.setTextColor(180, 170, 160);
            doc.text("A T E L I E R", bx + bw / 2, by + bh / 2 - 2, { align: "center" });
            doc.setFont("helvetica", "normal");
            doc.setFontSize(6);
            doc.text("DESIGN ORIGINAL", bx + bw / 2, by + bh / 2 + 3, { align: "center" });
            return;
          }

          try {
            const base64Str = await imageUrlToBase64(imgUrl);
            const dims = await getImageDimensions(base64Str);
            const aspect = dims.width / dims.height;
            const targetAspect = bw / bh;
            
            let rw, rh;
            if (aspect > targetAspect) {
              // Image is wider than target ratio
              rw = bw - 4; // 2mm margin on each side
              rh = rw / aspect;
            } else {
              // Image is taller than target ratio
              rh = bh - 4; // 2mm margin on each side
              rw = rh * aspect;
            }
            
            // Center the image within the box
            const rx = bx + (bw - rw) / 2;
            const ry = by + (bh - rh) / 2;
            
            doc.addImage(`data:image/png;base64,${base64Str}`, 'PNG', rx, ry, rw, rh, undefined, 'FAST');
          } catch (e) {
            console.warn("Failed to load image for PDF Lookbook:", imgUrl, e);
            // Elegant text placeholder
            doc.setFont("times", "italic");
            doc.setFontSize(8);
            doc.setTextColor(180, 170, 160);
            doc.text("A T E L I E R", bx + bw / 2, by + bh / 2 - 2, { align: "center" });
            doc.setFont("helvetica", "normal");
            doc.setFontSize(6);
            doc.text("DESIGN ORIGINAL", bx + bw / 2, by + bh / 2 + 3, { align: "center" });
          }
        };

        let currentY = 145; // Fixed starting coordinate below the image box area
        
        if (productImages.length <= 1) {
          // Single Image Layout (Elegant, large, centered)
          const imgUrl = productImages[0];
          await drawImageInBox(imgUrl, 20, 28, 170, 105);
        } else if (productImages.length === 2) {
          // Two Images Layout: Side-by-Side (Equal column structure)
          await drawImageInBox(productImages[0], 20, 28, 83, 105);
          await drawImageInBox(productImages[1], 107, 28, 83, 105);
        } else if (productImages.length === 3) {
          // Three Images Layout: Featured on Left + Two Stacked on Right (Editorial Grid)
          await drawImageInBox(productImages[0], 20, 28, 100, 105);
          await drawImageInBox(productImages[1], 124, 28, 66, 50.5);
          await drawImageInBox(productImages[2], 124, 82.5, 66, 50.5);
        } else {
          // Four or More Images Layout: balanced 2x2 Grid
          await drawImageInBox(productImages[0], 20, 28, 83, 50.5);
          await drawImageInBox(productImages[1], 107, 28, 83, 50.5);
          await drawImageInBox(productImages[2], 20, 82.5, 83, 50.5);
          await drawImageInBox(productImages[3], 107, 82.5, 83, 50.5);
        }
        
        // Product Title (with responsive size and beautiful luxury centering)
        doc.setFont("times", "bold");
        doc.setFontSize(22);
        doc.setTextColor(charcoalColor[0], charcoalColor[1], charcoalColor[2]);
        doc.text(product.name.toUpperCase(), 105, currentY, { align: "center", charSpace: 1 });
        
        currentY += 10;
        // Price & Material
        doc.setFont("times", "bold");
        doc.setFontSize(12);
        doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
        doc.text(`$${product.price.toLocaleString()}`, 105, currentY, { align: "center" });
        
        currentY += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(142, 130, 121);
        doc.text(`${product.material.toUpperCase()}  •  ${product.sku}`, 105, currentY, { align: "center", charSpace: 1 });
        
        currentY += 12;
        // Description
        if (product.description) {
          doc.setFont("times", "italic");
          doc.setFontSize(11);
          doc.setTextColor(60, 60, 60);
          const splitDescription = doc.splitTextToSize(product.description, 140);
          doc.text(splitDescription, 105, currentY, { align: "center", lineHeightFactor: 1.4 });
        }
        
        // Decorative line at bottom
        doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
        doc.setLineWidth(0.2);
        doc.line(95, 275, 115, 275);
      }
      
      // --- 4. CLOSING PAGE ---
      doc.addPage();
      doc.setFillColor(charcoalColor[0], charcoalColor[1], charcoalColor[2]);
      doc.rect(0, 0, 210, 297, 'F');
      
      doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, 190, 277);

      doc.setTextColor(255, 255, 255);
      doc.setFont("times", "bold");
      doc.setFontSize(24);
      doc.text("Inquiries & Commissions", 105, 100, { align: "center" });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.text("CONTACT THE ATELIER", 105, 115, { align: "center", charSpace: 2 });
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("times", "normal");
      doc.setFontSize(14);
      doc.text(bWebsite, 105, 140, { align: "center" });
      doc.text(bEmail, 105, 150, { align: "center" });
      doc.text(bPhone, 105, 160, { align: "center" });
      
      doc.setFont("times", "italic");
      doc.setFontSize(12);
      doc.setTextColor(150, 150, 150);
      doc.text("By Appointment Only", 105, 180, { align: "center" });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(100, 100, 100);
      doc.text(bCert1, 105, 200, { align: "center" });
      doc.text(bCert2, 105, 204, { align: "center" });

      doc.setFont("times", "bold");
      doc.setFontSize(32);
      doc.setTextColor(255, 255, 255);
      doc.text(bName, 105, 240, { align: "center", charSpace: 4 });

      const fileName = (name || `${bName}_Catalog`).replace(/\s+/g, '_');
      doc.save(`${fileName}_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. Please ensure your connection is stable.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const downloadEditableHTML = (title: string) => {
    if (selectedProductIds.length === 0) return;
    
    const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));
    const bName = (brandConfig.brandName || "LUMORA").toUpperCase();
    const bSub = (brandConfig.brandSub || "PRIVATE ATELIER • EST. 2026").toUpperCase();
    const bTagline = brandConfig.tagline || "The Masterpiece Collection";
    const bWebsite = brandConfig.website || "www.lumora.com";
    const bEmail = brandConfig.email || "atelier@lumora.com";
    const bPhone = brandConfig.phone || "+1 (800) LUMORA-0";
    const bManifestoTitle = brandConfig.manifestoTitle || "The Philosophy of Craft";
    const bManifesto1 = brandConfig.manifestoParagraph1 || "At our studio, we believe that jewelry is not merely an accessory, but a vessel for history, emotion, and unparalleled artistry.";
    const bManifesto2 = brandConfig.manifestoParagraph2 || "Each piece in this collection has been meticulously conceived in our private design lab and brought to life by master artisans who have dedicated their lives to the perfection of their craft.";
    const bManifesto3 = brandConfig.manifestoParagraph3 || "From the initial spark of inspiration to the final setting of a rare gemstone, our process is one of patience, precision, and passion. We do not chase trends; we create legacies.";
    const bCert1 = brandConfig.certificateNote1 || "All pieces featured in this catalog are accompanied by a Certificate of Authenticity";
    const bCert2 = brandConfig.certificateNote2 || "and are subject to the Atelier's standard terms of bespoke craftsmanship.";

    // Generate HTML Pages
    let productPagesHtml = "";
    selectedProducts.forEach((product, index) => {
      const images = (product.images || []).filter(url => url && url.trim() !== "");
      
      let gridHtml = "";
      if (images.length === 0) {
        gridHtml = `
          <div class="image-box single-box" onclick="triggerImageUpload(this)">
            <div class="placeholder-text">
              <span class="main-p">A T E L I E R</span>
              <span class="sub-p">CLICK TO CHOOSE IMAGE</span>
            </div>
            <img class="product-img" style="display:none;" />
          </div>
        `;
      } else if (images.length === 1) {
        gridHtml = `
          <div class="image-box single-box" onclick="triggerImageUpload(this)">
            <div class="placeholder-text" style="display:none;">
              <span class="main-p">A T E L I E R</span>
              <span class="sub-p">CLICK TO CHOOSE IMAGE</span>
            </div>
            <img src="${images[0]}" class="product-img" />
          </div>
        `;
      } else if (images.length === 2) {
        gridHtml = `
          <div class="grid-2col">
            <div class="image-box" onclick="triggerImageUpload(this)">
              <div class="placeholder-text" style="display:none;"><span class="main-p">A T E L I E R</span></div>
              <img src="${images[0]}" class="product-img" />
            </div>
            <div class="image-box" onclick="triggerImageUpload(this)">
              <div class="placeholder-text" style="display:none;"><span class="main-p">A T E L I E R</span></div>
              <img src="${images[1]}" class="product-img" />
            </div>
          </div>
        `;
      } else if (images.length === 3) {
        gridHtml = `
          <div class="grid-3col">
            <div class="image-box" onclick="triggerImageUpload(this)">
              <div class="placeholder-text" style="display:none;"><span class="main-p">A T E L I E R</span></div>
              <img src="${images[0]}" class="product-img" />
            </div>
            <div class="grid-3col-right">
              <div class="image-box" onclick="triggerImageUpload(this)">
                <div class="placeholder-text" style="display:none;"><span class="main-p">A T E L I E R</span></div>
                <img src="${images[1]}" class="product-img" />
              </div>
              <div class="image-box" onclick="triggerImageUpload(this)">
                <div class="placeholder-text" style="display:none;"><span class="main-p">A T E L I E R</span></div>
                <img src="${images[2]}" class="product-img" />
              </div>
            </div>
          </div>
        `;
      } else {
        gridHtml = `
          <div class="grid-2x2">
            <div class="image-box" onclick="triggerImageUpload(this)">
              <div class="placeholder-text" style="display:none;"><span class="main-p">A T E L I E R</span></div>
              <img src="${images[0]}" class="product-img" />
            </div>
            <div class="image-box" onclick="triggerImageUpload(this)">
              <div class="placeholder-text" style="display:none;"><span class="main-p">A T E L I E R</span></div>
              <img src="${images[1]}" class="product-img" />
            </div>
            <div class="image-box" onclick="triggerImageUpload(this)">
              <div class="placeholder-text" style="display:none;"><span class="main-p">A T E L I E R</span></div>
              <img src="${images[2]}" class="product-img" />
            </div>
            <div class="image-box" onclick="triggerImageUpload(this)">
              <div class="placeholder-text" style="display:none;"><span class="main-p">A T E L I E R</span></div>
              <img src="${images[3]}" class="product-img" />
            </div>
          </div>
        `;
      }

      productPagesHtml += `
        <div class="page page-product font-serif">
          <div class="page-header">
            <span contenteditable="true">${bName} ATELIER</span>
            <span contenteditable="true">PAGE ${index + 1} OF ${selectedProducts.length}</span>
          </div>
          
          <div class="product-images-container">
            ${gridHtml}
          </div>
          
          <div class="product-info">
            <h2 class="product-title" contenteditable="true">${product.name.toUpperCase()}</h2>
            <p class="product-price" contenteditable="true">$${product.price.toLocaleString()}</p>
            <p class="product-meta" contenteditable="true">CATEGORY: ${product.category.toUpperCase()} | MATERIAL: ${product.material || "Fine Jewelry"}</p>
            <p class="product-desc" contenteditable="true">${product.description || "A bespoke masterpiece crafted with supreme attention to detail."}</p>
          </div>
          
          <div class="page-footer">
            <span contenteditable="true">${bWebsite}</span>
            <span contenteditable="true">CONFIDENTIAL ATELIER COPY</span>
          </div>
        </div>
      `;
    });

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${bName} - ${title || 'Bespoke Lookbook'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --charcoal: #1a1a1a;
      --gold: #c5a059;
      --bone: #f5f2ed;
      --soft-white: #fcfaf7;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      background: #eaeaea;
      font-family: 'Montserrat', sans-serif;
      color: var(--charcoal);
      padding-top: 60px;
    }
    
    /* Toolbar styling */
    .editor-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: var(--charcoal);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 40px;
      z-index: 9999;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    
    .editor-title {
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      letter-spacing: 2px;
      color: var(--gold);
    }
    
    .editor-buttons {
      display: flex;
      gap: 15px;
    }
    
    .btn {
      background: transparent;
      border: 1px solid var(--gold);
      color: #fff;
      padding: 8px 16px;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .btn:hover {
      background: var(--gold);
      color: var(--charcoal);
    }
    
    .btn-primary {
      background: var(--gold);
      color: var(--charcoal);
    }
    
    .btn-primary:hover {
      background: #fff;
      color: var(--charcoal);
      border-color: #fff;
    }
    
    /* Pages Container */
    .catalog-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 40px;
      padding: 40px 0;
    }
    
    /* Paper dimensions (A4 in mm) */
    .page {
      background: var(--soft-white);
      width: 210mm;
      height: 297mm;
      position: relative;
      padding: 25mm 20mm;
      box-shadow: 0 10px 40px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }
    
    /* COVER PAGE */
    .page-cover {
      background: var(--charcoal);
      color: #fff;
      padding: 30mm 20mm;
      justify-content: center;
      align-items: center;
    }
    
    .cover-border {
      position: absolute;
      top: 10mm;
      bottom: 10mm;
      left: 10mm;
      right: 10mm;
      border: 1px solid var(--gold);
      pointer-events: none;
    }
    
    .cover-content {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
    
    .cover-brand {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 4px;
      margin-bottom: 5px;
      text-transform: uppercase;
      color: #fff;
    }
    
    .cover-subtitle {
      font-size: 8px;
      letter-spacing: 3px;
      color: var(--gold);
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    
    .cover-line {
      width: 40px;
      height: 1px;
      background: var(--gold);
      margin-bottom: 30px;
    }
    
    .cover-title {
      font-family: 'Playfair Display', serif;
      font-size: 48px;
      font-weight: 700;
      letter-spacing: 2px;
      margin-bottom: 10px;
      line-height: 1.2;
    }
    
    .cover-tagline {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 14px;
      color: #888;
    }
    
    /* PHILOSOPHY PAGE */
    .page-manifesto {
      background: var(--soft-white);
      padding: 35mm 25mm;
      justify-content: center;
    }
    
    .manifesto-header {
      text-align: center;
      margin-bottom: 20mm;
    }
    
    .manifesto-tag {
      font-size: 8px;
      font-weight: 600;
      letter-spacing: 4px;
      color: var(--gold);
      text-transform: uppercase;
    }
    
    .manifesto-title {
      font-family: 'Playfair Display', serif;
      font-size: 36px;
      font-weight: 400;
      margin-top: 10px;
      color: var(--charcoal);
    }
    
    .manifesto-body {
      font-family: 'Playfair Display', serif;
      font-size: 14px;
      line-height: 2.2;
      text-align: center;
      color: #555;
      font-style: italic;
    }
    
    .manifesto-body p {
      margin-bottom: 25px;
    }
    
    /* PRODUCT PAGES */
    .page-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid rgba(0,0,0,0.04);
      padding-bottom: 5px;
      font-size: 8px;
      letter-spacing: 2px;
      color: #888;
      text-transform: uppercase;
    }
    
    .product-images-container {
      flex-grow: 1;
      margin: 10mm 0;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 115mm;
    }
    
    .image-box {
      width: 100%;
      height: 100%;
      background: #fdfcf9;
      border: 1px solid #e6e1d7;
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      transition: border-color 0.3s;
    }
    
    .image-box:hover {
      border-color: var(--gold);
    }
    
    .product-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 10px;
    }
    
    /* Multi-image layouts */
    .single-box {
      width: 100%;
      height: 100%;
    }
    
    .grid-2col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      width: 100%;
      height: 100%;
    }
    
    .grid-3col {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 15px;
      width: 100%;
      height: 100%;
    }
    
    .grid-3col-right {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .grid-3col-right .image-box {
      height: calc(50% - 7.5px);
    }
    
    .grid-2x2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 15px;
      width: 100%;
      height: 100%;
    }
    
    .placeholder-text {
      text-align: center;
      font-family: 'Playfair Display', serif;
    }
    
    .placeholder-text .main-p {
      display: block;
      font-size: 11px;
      letter-spacing: 2px;
      color: #999;
      font-style: italic;
    }
    
    .placeholder-text .sub-p {
      display: block;
      font-family: 'Montserrat', sans-serif;
      font-size: 7px;
      letter-spacing: 1px;
      color: var(--gold);
      margin-top: 4px;
    }
    
    .product-info {
      text-align: center;
      margin-bottom: 8mm;
    }
    
    .product-title {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      letter-spacing: 1px;
      font-weight: 700;
      color: var(--charcoal);
      margin-bottom: 5px;
    }
    
    .product-price {
      font-size: 12px;
      font-weight: 600;
      color: var(--gold);
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    
    .product-meta {
      font-size: 7px;
      letter-spacing: 1px;
      color: #999;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    
    .product-desc {
      font-family: 'Playfair Display', serif;
      font-size: 10px;
      line-height: 1.8;
      color: #555;
      font-style: italic;
      max-width: 90%;
      margin: 0 auto;
    }
    
    .page-footer {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid rgba(0,0,0,0.04);
      padding-top: 5px;
      font-size: 8px;
      letter-spacing: 1px;
      color: #aaa;
    }
    
    /* BACK COVER */
    .page-back {
      background: var(--charcoal);
      color: #fff;
      padding: 30mm 20mm;
      align-items: center;
      justify-content: center;
    }
    
    .back-content {
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
    }
    
    .back-logo {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #fff;
      margin-bottom: 10px;
    }
    
    .back-sub {
      font-size: 7px;
      letter-spacing: 3px;
      color: var(--gold);
      text-transform: uppercase;
      margin-bottom: 25px;
    }
    
    .back-desc {
      font-family: 'Playfair Display', serif;
      font-size: 10px;
      font-style: italic;
      color: #888;
      line-height: 1.8;
      max-width: 80%;
      margin-bottom: 30px;
    }
    
    .back-details {
      border-top: 1px solid rgba(255,255,255,0.08);
      padding-top: 25px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      font-size: 8px;
      letter-spacing: 1px;
      color: #ccc;
    }
    
    .back-details span {
      display: block;
    }
    
    /* PRINT STYLES */
    @media print {
      body {
        background: #fff;
        padding-top: 0;
      }
      
      .editor-toolbar {
        display: none !important;
      }
      
      .catalog-container {
        padding: 0;
        gap: 0;
      }
      
      .page {
        box-shadow: none !important;
        page-break-after: always;
        width: 210mm;
        height: 297mm;
        margin: 0 !important;
        border: none !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>

  <div class="editor-toolbar">
    <div class="editor-title">✏️ BESPOKE ATELIER EDITABLE LOOKBOOK</div>
    <div class="editor-buttons">
      <button class="btn" onclick="addNewPage()">➕ Add Blank Page</button>
      <button class="btn btn-primary" onclick="window.print()">🖨️ Export PDF / Print</button>
    </div>
  </div>

  <div class="catalog-container" id="catalog-container">
    
    <!-- COVER PAGE -->
    <div class="page page-cover font-serif">
      <div class="cover-border"></div>
      <div class="cover-content">
        <h1 class="cover-brand" contenteditable="true">${bName}</h1>
        <p class="cover-subtitle" contenteditable="true">${bSub}</p>
        <div class="cover-line"></div>
        <h2 class="cover-title" contenteditable="true">${title.toUpperCase()}</h2>
        <p class="cover-tagline" contenteditable="true">${bTagline}</p>
      </div>
    </div>
    
    <!-- MANIFESTO PAGE -->
    <div class="page page-manifesto">
      <div class="manifesto-header">
        <span class="manifesto-tag" contenteditable="true">M a n i f e s t o</span>
        <h2 class="manifesto-title" contenteditable="true">${bManifestoTitle}</h2>
      </div>
      <div class="manifesto-body">
        <p contenteditable="true">${bManifesto1}</p>
        <p contenteditable="true">${bManifesto2}</p>
        <p contenteditable="true">${bManifesto3}</p>
      </div>
    </div>
    
    <!-- SELECTED PRODUCTS -->
    ${productPagesHtml}
    
    <!-- BACK COVER -->
    <div class="page page-back">
      <div class="cover-border"></div>
      <div class="back-content">
        <h3 class="back-logo" contenteditable="true">${bName}</h3>
        <p class="back-sub" contenteditable="true">${bSub}</p>
        <p class="back-desc" contenteditable="true">${bCert1} ${bCert2}</p>
        <div class="back-details">
          <span contenteditable="true">TEL: ${bPhone}</span>
          <span contenteditable="true">EMAIL: ${bEmail}</span>
          <span contenteditable="true">WEB: ${bWebsite}</span>
        </div>
      </div>
    </div>
    
  </div>

  <!-- Hidden File Input for Image Replacing -->
  <input type="file" id="img-replacer-input" style="display:none;" accept="image/*" />

  <script>
    let activeBoxToReplace = null;
    
    // Wire up image replacer uploader
    const fileInput = document.getElementById('img-replacer-input');
    fileInput.addEventListener('change', function(e) {
      if (e.target.files && e.target.files[0] && activeBoxToReplace) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          const img = activeBoxToReplace.querySelector('.product-img');
          const placeholder = activeBoxToReplace.querySelector('.placeholder-text');
          if (img) {
            img.src = evt.target.result;
            img.style.display = 'block';
          }
          if (placeholder) {
            placeholder.style.display = 'none';
          }
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });

    function triggerImageUpload(boxElement) {
      activeBoxToReplace = boxElement;
      fileInput.click();
    }

    function addNewPage() {
      const container = document.getElementById('catalog-container');
      const backCover = container.querySelector('.page-back');
      
      const newPage = document.createElement('div');
      newPage.className = 'page';
      newPage.innerHTML = \`
        <div class="page-header">
          <span contenteditable="true">${bName} ATELIER</span>
          <span contenteditable="true">CUSTOM EXHIBIT</span>
        </div>
        <div class="product-images-container">
          <div class="image-box single-box" onclick="triggerImageUpload(this)">
            <div class="placeholder-text">
              <span class="main-p">A T E L I E R</span>
              <span class="sub-p">CLICK TO CHOOSE IMAGE</span>
            </div>
            <img class="product-img" style="display:none;" />
          </div>
        </div>
        <div class="product-info">
          <h2 class="product-title" contenteditable="true">CUSTOM EXHIBIT PIECE</h2>
          <p class="product-price" contenteditable="true">$0.00</p>
          <p class="product-desc" contenteditable="true">Enter details for this custom masterpiece showcase...</p>
        </div>
        <div class="page-footer">
          <span contenteditable="true">${bWebsite}</span>
          <span contenteditable="true"> bespoke creation </span>
        </div>
      \`;
      
      container.insertBefore(newPage, backCover);
    }
  </script>
</body>
</html>`;

    // Download the HTML File
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${bName.toLowerCase().replace(/\s+/g, '_')}_lookbook_editable.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const shareToWhatsApp = async () => {
    if (selectedProductIds.length === 0) return;
    const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));
    
    const bName = (brandConfig.brandName || "LUMORA").toUpperCase();
    let message = `*${bName} ATELIER - Selected Masterpieces*\n\n`;
    selectedProducts.forEach(p => {
      message += `*${p.name}*\n`;
      message += `Price: $${p.price.toLocaleString()}\n`;
      message += `Material: ${p.material}\n`;
      if (p.description) message += `_${p.description}_\n`;
      message += `🔗 ${p.images[0]}\n\n`;
    });
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  // Bulk Upload State
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [bulkUploadItems, setBulkUploadItems] = useState<Partial<Product>[]>([]);
  const [generatingBulkItemIds, setGeneratingBulkItemIds] = useState<string[]>([]);

  // Social Publishing State
  const [publishingPlatform, setPublishingPlatform] = useState<'Pinterest' | 'Instagram' | 'Facebook' | null>(null);
  const [publishingProduct, setPublishingProduct] = useState<Product | null>(null);
  const [publishingImages, setPublishingImages] = useState<string[]>([]);
  const [socialToast, setSocialToast] = useState<{ show: boolean; platform: string; txId: string; count: number } | null>(null);
  const [isAccountConnected, setIsAccountConnected] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('lumora_social_connected');
      return saved ? JSON.parse(saved) : { Pinterest: false, Instagram: false, Facebook: false };
    } catch {
      return { Pinterest: false, Instagram: false, Facebook: false };
    }
  });

  const [accountLinks, setAccountLinks] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('lumora_social_links');
      return saved ? JSON.parse(saved) : {
        Pinterest: 'https://pinterest.com/lumora_luxury',
        Instagram: 'https://instagram.com/lumora.jewelry',
        Facebook: 'https://facebook.com/lumora.official'
      };
    } catch {
      return {
        Pinterest: 'https://pinterest.com/lumora_luxury',
        Instagram: 'https://instagram.com/lumora.jewelry',
        Facebook: 'https://facebook.com/lumora.official'
      };
    }
  });

  const [socialCredentials, setSocialCredentials] = useState<Record<string, { token: string; accountId?: string; additionalConfig?: string }>>(() => {
    try {
      const saved = localStorage.getItem('lumora_social_credentials');
      return saved ? JSON.parse(saved) : {
        Pinterest: { token: '', accountId: '' },
        Instagram: { token: '', accountId: '' },
        Facebook: { token: '', accountId: '' }
      };
    } catch {
      return {
        Pinterest: { token: '', accountId: '' },
        Instagram: { token: '', accountId: '' },
        Facebook: { token: '', accountId: '' }
      };
    }
  });

  const [isSocialConnectModalOpen, setIsSocialConnectModalOpen] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<'Pinterest' | 'Instagram' | 'Facebook' | null>(null);
  
  const [socialPublishHistory, setSocialPublishHistory] = useState<Array<{
    id: string;
    productName: string;
    platform: string;
    message: string;
    timestamp: string;
    status: 'Success' | 'Failed';
    txId: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('lumora_social_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('lumora_social_connected', JSON.stringify(isAccountConnected));
  }, [isAccountConnected]);

  useEffect(() => {
    localStorage.setItem('lumora_social_links', JSON.stringify(accountLinks));
  }, [accountLinks]);

  useEffect(() => {
    localStorage.setItem('lumora_social_credentials', JSON.stringify(socialCredentials));
  }, [socialCredentials]);

  useEffect(() => {
    localStorage.setItem('lumora_social_history', JSON.stringify(socialPublishHistory));
  }, [socialPublishHistory]);

  // Brand Identity / White-Label config
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(() => {
    try {
      const saved = localStorage.getItem('lumora_brand_config');
      return saved ? JSON.parse(saved) : {
        brandName: "LUMORA",
        brandSub: "PRIVATE ATELIER • EST. 2026",
        tagline: "The Masterpiece Collection",
        website: "www.lumora.com",
        email: "atelier@lumora.com",
        phone: "+1 (800) LUMORA-0",
        manifestoTitle: "The Philosophy of Craft",
        manifestoParagraph1: "At our studio, we believe that jewelry is not merely an accessory, but a vessel for history, emotion, and unparalleled artistry.",
        manifestoParagraph2: "Each piece in this collection has been meticulously conceived in our private design lab and brought to life by master artisans who have dedicated their lives to the perfection of their craft.",
        manifestoParagraph3: "From the initial spark of inspiration to the final setting of a rare gemstone, our process is one of patience, precision, and passion. We do not chase trends; we create legacies.",
        certificateNote1: "All pieces featured in this catalog are accompanied by a Certificate of Authenticity",
        certificateNote2: "and are subject to the Atelier's standard terms of bespoke craftsmanship."
      };
    } catch {
      return {
        brandName: "LUMORA",
        brandSub: "PRIVATE ATELIER • EST. 2026",
        tagline: "The Masterpiece Collection",
        website: "www.lumora.com",
        email: "atelier@lumora.com",
        phone: "+1 (800) LUMORA-0",
        manifestoTitle: "The Philosophy of Craft",
        manifestoParagraph1: "At our studio, we believe that jewelry is not merely an accessory, but a vessel for history, emotion, and unparalleled artistry.",
        manifestoParagraph2: "Each piece in this collection has been meticulously conceived in our private design lab and brought to life by master artisans who have dedicated their lives to the perfection of their craft.",
        manifestoParagraph3: "From the initial spark of inspiration to the final setting of a rare gemstone, our process is one of patience, precision, and passion. We do not chase trends; we create legacies.",
        certificateNote1: "All pieces featured in this catalog are accompanied by a Certificate of Authenticity",
        certificateNote2: "and are subject to the Atelier's standard terms of bespoke craftsmanship."
      };
    }
  });

  useEffect(() => {
    localStorage.setItem('lumora_brand_config', JSON.stringify(brandConfig));
  }, [brandConfig]);

  // Customer Management State
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [repairJobs, setRepairJobs] = useState<RepairJob[]>(MOCK_REPAIR_JOBS);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [customerFilters, setCustomerFilters] = useState({
    area: '',
    location: '',
    leadSource: '',
    ageGroup: '',
    country: ''
  });

  // Master Stock / Raw Materials State
  const [masterInventory, setMasterInventory] = useState<InventoryItem[]>(MOCK_MASTER_INVENTORY);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<InventoryItem | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<InventoryAuditLog[]>([
    { id: 'AUD-001', date: '2026-06-25', itemId: 'RM-001', itemName: 'D-Color Round Diamonds (0.5ct)', previousQuantity: 40, newQuantity: 42, variance: 2, notes: 'Stock verification during physical check. Found 2 more units than registered.', auditor: 'Sarah Jenkins (VIP Consultant)' },
    { id: 'AUD-002', date: '2026-06-28', itemId: 'RM-002', itemName: '18K Rose Gold Grain', previousQuantity: 520, newQuantity: 500, variance: -20, notes: 'Adjusted for casting of custom order ORD-7721.', auditor: 'Elena Rossi (Filigree Lead)' }
  ]);

  const [drillDownType, setDrillDownType] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<'bestsellers' | 'profitability' | 'stock' | 'revenue'>('bestsellers');
  const [predictiveLocationId, setPredictiveLocationId] = useState<string>('RES-001');
  const [aiPredictiveReport, setAiPredictiveReport] = useState<string | null>(null);
  const [isGeneratingAiPredictive, setIsGeneratingAiPredictive] = useState(false);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesArea = !customerFilters.area || customer.area === customerFilters.area;
      const matchesLocation = !customerFilters.location || customer.location === customerFilters.location;
      const matchesLeadSource = !customerFilters.leadSource || customer.leadSource === customerFilters.leadSource;
      const matchesAgeGroup = !customerFilters.ageGroup || customer.ageGroup === customerFilters.ageGroup;
      const matchesCountry = !customerFilters.country || customer.country === customerFilters.country;
      const matchesSearch = !searchQuery || 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesArea && matchesLocation && matchesLeadSource && matchesAgeGroup && matchesCountry && matchesSearch;
    });
  }, [customers, customerFilters, searchQuery]);

  // Order Management State
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  // Ledger Management State
  const [ledger, setLedger] = useState<LedgerEntry[]>(MOCK_LEDGER);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [editingLedger, setEditingLedger] = useState<LedgerEntry | null>(null);

  // Jewelry Tag Scanner & Ledger State
  const [inventoryViewMode, setInventoryViewMode] = useState<'gallery' | 'scanner'>('gallery');
  const [isTagScannerModalOpen, setIsTagScannerModalOpen] = useState(false);
  const [scannerTargetProductId, setScannerTargetProductId] = useState<string | null>(null);

  // Advanced Ledger state for Subtabs & Smart Pre-fills
  const [ledgerSubTab, setLedgerSubTab] = useState<'all' | 'customers' | 'craftsmen'>('all');
  const [ledgerFormType, setLedgerFormType] = useState<LedgerEntry['type']>('sale');
  const [ledgerFormRelatedOrder, setLedgerFormRelatedOrder] = useState<string>('');
  const [ledgerFormCraftsman, setLedgerFormCraftsman] = useState<string>('');
  const [ledgerFormCraftsmanTask, setLedgerFormCraftsmanTask] = useState<string>('');
  const [ledgerFormName, setLedgerFormName] = useState('');
  const [ledgerFormId, setLedgerFormId] = useState('');
  const [ledgerFormAmount, setLedgerFormAmount] = useState<number | ''>('');
  const [ledgerFormDesc, setLedgerFormDesc] = useState('');

  const handleFormTypeChange = (type: LedgerEntry['type']) => {
    setLedgerFormType(type);
    setLedgerFormRelatedOrder('');
    setLedgerFormCraftsman('');
    setLedgerFormCraftsmanTask('');
    setLedgerFormName('');
    setLedgerFormId('');
    setLedgerFormAmount('');
    setLedgerFormDesc('');
  };

  const handleFormOrderChange = (orderId: string, type: LedgerEntry['type']) => {
    setLedgerFormRelatedOrder(orderId);
    if (!orderId) {
      setLedgerFormId('');
      setLedgerFormName('');
      setLedgerFormDesc('');
      return;
    }

    const regularOrder = orders.find(o => o.id === orderId);
    const bespokeOrder = bespokeOrders.find(o => o.id === orderId);

    const customerName = regularOrder ? regularOrder.customer : bespokeOrder ? bespokeOrder.customerName : '';
    const orderTotal = regularOrder ? regularOrder.total : bespokeOrder ? bespokeOrder.totalAmount : 0;
    
    // Calculate outstanding
    const paidSoFar = ledger
      .filter(l => l.relatedId === orderId && l.status === 'completed')
      .reduce((sum, l) => sum + l.amount, 0);
    const outstanding = Math.max(0, orderTotal - paidSoFar);

    setLedgerFormId(orderId);
    setLedgerFormName(customerName);
    setLedgerFormAmount(outstanding > 0 ? outstanding : orderTotal);
    
    const typeLabel = type === 'customer_advance' ? 'Advance payment' : type === 'customer_final' ? 'Final payment' : 'Direct sale';
    setLedgerFormDesc(`${typeLabel} for Order ${orderId} (${customerName})`);
  };

  const handleFormCraftsmanChange = (craftsmanId: string) => {
    setLedgerFormCraftsman(craftsmanId);
    setLedgerFormCraftsmanTask('');
    
    if (!craftsmanId) {
      setLedgerFormName('');
      setLedgerFormId('');
      setLedgerFormDesc('');
      return;
    }

    const artisan = MOCK_CRAFTSMEN.find(c => c.id === craftsmanId);
    if (artisan) {
      setLedgerFormName(artisan.name);
      setLedgerFormId(artisan.id);
      setLedgerFormDesc(`General payment / retainer to ${artisan.name}`);
    }
  };

  const handleFormCraftsmanTaskChange = (taskId: string, craftsmanName: string) => {
    setLedgerFormCraftsmanTask(taskId);
    if (!taskId) {
      setLedgerFormId(ledgerFormCraftsman);
      setLedgerFormDesc(`General payment / retainer to ${craftsmanName}`);
      return;
    }

    if (taskId.startsWith('BSK-')) {
      const bespoke = bespokeOrders.find(b => b.id === taskId);
      if (bespoke) {
        const cost = bespoke.makingCostPerGram * bespoke.metalWeight + bespoke.additionalExpenses;
        setLedgerFormId(taskId);
        setLedgerFormAmount(cost);
        setLedgerFormDesc(`Making charges payment to ${craftsmanName} for bespoke piece ${taskId}`);
      }
    } else {
      const [jobId, stepId] = taskId.split('_');
      const job = productionJobs.find(j => j.id === jobId);
      const step = job?.steps.find(s => s.id === stepId);
      if (step) {
        setLedgerFormId(taskId);
        setLedgerFormAmount(step.estimateCost || 0);
        setLedgerFormDesc(`Payment to ${craftsmanName} for step: ${step.name} on ${job?.productName}`);
      }
    }
  };

  const startEditLedger = (entry: LedgerEntry) => {
    setEditingLedger(entry);
    setLedgerFormType(entry.type);
    setLedgerFormName(entry.relatedName);
    setLedgerFormId(entry.relatedId);
    setLedgerFormAmount(entry.amount);
    setLedgerFormDesc(entry.description);

    const isOrder = orders.some(o => o.id === entry.relatedId) || bespokeOrders.some(o => o.id === entry.relatedId);
    if (isOrder) {
      setLedgerFormRelatedOrder(entry.relatedId);
    } else {
      setLedgerFormRelatedOrder('');
    }

    const artisan = MOCK_CRAFTSMEN.find(c => c.name === entry.relatedName || c.id === entry.relatedId);
    if (artisan) {
      setLedgerFormCraftsman(artisan.id);
      if (entry.relatedId !== artisan.id) {
        setLedgerFormCraftsmanTask(entry.relatedId);
      } else {
        setLedgerFormCraftsmanTask('');
      }
    } else {
      setLedgerFormCraftsman('');
      setLedgerFormCraftsmanTask('');
    }

    setIsLedgerModalOpen(true);
  };

  const handleSaveLedger = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as LedgerEntry['type'];
    const category = (type === 'customer_advance' || type === 'customer_final' || type === 'sale') ? 'Inflow' : 'Outflow';
    
    const entryData: LedgerEntry = {
      id: editingLedger?.id || `TXN-${Math.floor(Math.random() * 9000) + 1000}`,
      date: formData.get('date') as string,
      type,
      amount: Number(formData.get('amount')),
      relatedId: formData.get('relatedId') as string,
      relatedName: formData.get('relatedName') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as LedgerEntry['status'],
      category
    };

    if (editingLedger) {
      setLedger(prev => prev.map(l => l.id === editingLedger.id ? entryData : l));
    } else {
      setLedger(prev => [entryData, ...prev]);
    }
    setIsLedgerModalOpen(false);
    setEditingLedger(null);
  };

  // Partner Portal State
  const [resellers, setResellers] = useState<Reseller[]>(MOCK_RESELLERS);
  const [partnerInventory, setPartnerInventory] = useState<PartnerInventory[]>(MOCK_PARTNER_INVENTORY);
  const [isResellerModalOpen, setIsResellerModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedReseller, setSelectedReseller] = useState<Reseller | null>(null);
  const [selectedAssignProductId, setSelectedAssignProductId] = useState<string>('');
  const [assignSearchQuery, setAssignSearchQuery] = useState<string>('');
  const [assignPartnerPrice, setAssignPartnerPrice] = useState<number | ''>('');
  const [assignCategory, setAssignCategory] = useState<string>('All');
  const [assignSort, setAssignSort] = useState<string>('name');

  useEffect(() => {
    if (isAssignModalOpen) {
      setSelectedAssignProductId('');
      setAssignSearchQuery('');
      setAssignPartnerPrice('');
      setAssignCategory('All');
      setAssignSort('name');
    }
  }, [isAssignModalOpen]);

  // Live Metal Rates update
  useEffect(() => {
    fetchLiveRates();
    const interval = setInterval(() => {
      fetchLiveRates();
    }, 60000); // Poll every 60 seconds
    return () => clearInterval(interval);
  }, []);

  // --- AI VOICE CONCIERGE OPERATIONAL HANDLERS ---
  const handleAiRecordPayment = (paymentData: {
    amount: number;
    customerName: string;
    location?: string;
    paymentType?: 'customer_advance' | 'customer_final' | 'sale' | 'craftsman_payment' | 'craftsman_advance';
    category?: 'Inflow' | 'Outflow';
    paymentMethod?: string;
    relatedOrderId?: string;
    description?: string;
    date?: string;
  }) => {
    const newEntry: LedgerEntry = {
      id: `LED-${Date.now().toString().slice(-6)}`,
      date: paymentData.date || new Date().toISOString().split('T')[0],
      type: paymentData.paymentType || 'customer_advance',
      amount: paymentData.amount,
      relatedId: paymentData.relatedOrderId || `ORD-${Date.now().toString().slice(-4)}`,
      relatedName: `${paymentData.customerName} (${paymentData.location || 'Atelier'})`,
      description: paymentData.description || `Payment of ₹${paymentData.amount.toLocaleString()} received from ${paymentData.customerName} (${paymentData.location || 'Atelier'}) via ${paymentData.paymentMethod || 'Bank Transfer'}`,
      status: 'completed',
      category: paymentData.category || 'Inflow'
    };

    setLedger(prev => [newEntry, ...prev]);
    syncEntity('ledger', newEntry);

    setCustomers(prev => prev.map(c => {
      if (c.name.toLowerCase() === paymentData.customerName.toLowerCase() || 
          paymentData.customerName.toLowerCase().includes(c.name.toLowerCase()) ||
          c.name.toLowerCase().includes(paymentData.customerName.toLowerCase())) {
        const updated = {
          ...c,
          totalSpend: (c.totalSpend || 0) + (paymentData.category === 'Inflow' ? paymentData.amount : 0),
          lastOrder: new Date().toISOString().split('T')[0]
        };
        syncEntity('customers', updated);
        return updated;
      }
      return c;
    }));

    return { 
      success: true, 
      entry: newEntry, 
      message: `Recorded payment of ₹${paymentData.amount.toLocaleString()} from ${paymentData.customerName}` 
    };
  };

  const handleAiAddCustomer = (customerData: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    area?: string;
    leadSource?: string;
    ageGroup?: string;
    notes?: string;
  }) => {
    const newCust: Customer = {
      id: `CUST-${Date.now().toString().slice(-4)}`,
      name: customerData.name,
      email: customerData.email || `${customerData.name.toLowerCase().replace(/\s+/g, '.')}@client.com`,
      phone: customerData.phone || '+91 9820011223',
      totalSpend: 0,
      lastOrder: new Date().toISOString().split('T')[0],
      status: 'VIP',
      area: customerData.area || customerData.location || 'Atelier',
      location: customerData.location || 'Mumbai Flagship',
      leadSource: customerData.leadSource || 'Walk-in',
      ageGroup: customerData.ageGroup || '30-40',
      notes: customerData.notes || 'Added via LUMORA AI Voice Concierge'
    };

    setCustomers(prev => [newCust, ...prev]);
    syncEntity('customers', newCust);
    return { success: true, customer: newCust, message: `Added client ${newCust.name} into CRM` };
  };

  const handleAiAdjustStock = (data: {
    productNameOrSku: string;
    newStock?: number;
    stockDelta?: number;
    newPrice?: number;
  }) => {
    let matchedProduct: Product | undefined;
    setProducts(prev => prev.map(p => {
      const isMatch = p.sku.toLowerCase() === data.productNameOrSku.toLowerCase() ||
                      p.name.toLowerCase().includes(data.productNameOrSku.toLowerCase()) ||
                      data.productNameOrSku.toLowerCase().includes(p.name.toLowerCase()) ||
                      data.productNameOrSku.toLowerCase().includes(p.sku.toLowerCase());
      if (isMatch) {
        const updatedStock = data.newStock !== undefined ? data.newStock : Math.max(0, p.stock + (data.stockDelta || 0));
        const updatedPrice = data.newPrice !== undefined ? data.newPrice : p.price;
        const updatedProd = { ...p, stock: updatedStock, price: updatedPrice };
        matchedProduct = updatedProd;
        syncEntity('products', updatedProd);
        return updatedProd;
      }
      return p;
    }));

    return { 
      success: !!matchedProduct, 
      product: matchedProduct, 
      message: matchedProduct ? `Updated stock for ${matchedProduct.name} to ${matchedProduct.stock} units` : 'Product not found' 
    };
  };

  const handleAiAddProduct = (data: {
    name: string;
    category?: string;
    price?: number;
    stock?: number;
    material?: string;
    description?: string;
    images?: string[];
    video?: string;
    sku?: string;
  }) => {
    const timestampStr = Date.now().toString().slice(-4);
    const categoryPrefix = (data.category || 'RING').slice(0, 4).toUpperCase();
    const generatedSku = data.sku || `SKU-${categoryPrefix}-${timestampStr}`;
    const defaultImg = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800';
    const finalImages = (data.images && data.images.length > 0) ? data.images : [defaultImg];

    const newProd: Product = {
      id: `PROD-${Date.now().toString().slice(-6)}`,
      name: data.name || 'New Masterpiece',
      sku: generatedSku,
      category: data.category || 'Rings',
      price: data.price || 85000,
      stock: data.stock !== undefined ? data.stock : 1,
      images: finalImages,
      video: data.video,
      material: data.material || '18K Gold',
      status: 'Available',
      channels: [ChannelType.OFFLINE, ChannelType.WHATSAPP, ChannelType.INSTAGRAM, ChannelType.WEBSITE],
      description: data.description || 'Artisanal handcrafted luxury jewelry piece from the atelier.'
    };

    setProducts(prev => [newProd, ...prev]);
    syncEntity('products', newProd);

    return {
      success: true,
      product: newProd,
      message: `Created new product ${newProd.name} (${newProd.sku}) with ${newProd.images.length} photo(s)`
    };
  };


  const handleAiCreateBespokeOrder = (data: {
    customerName: string;
    customerPhone?: string;
    metalType?: string;
    metalPurity?: string;
    metalWeight?: number;
    specifications?: string;
    totalAmount?: number;
    advancePaid?: number;
    stonesSummary?: string;
  }) => {
    const newOrder: BespokeOrder = {
      id: `BES-${Date.now().toString().slice(-4)}`,
      customerName: data.customerName,
      customerEmail: `${data.customerName.toLowerCase().replace(/\s+/g, '.')}@client.com`,
      customerPhone: data.customerPhone || '+91 9800000000',
      craftsmanId: 'CRAFT-001',
      craftsmanName: 'Master Rajesh (Filigree)',
      metalType: data.metalType || 'Yellow Gold',
      metalPurity: data.metalPurity || '18K (75.0%)',
      metalWeight: data.metalWeight || 6.5,
      metalCostPerGram: 6200,
      stones: [],
      diamonds: [],
      makingCostPerGram: 850,
      additionalExpenses: 3000,
      specifications: data.specifications || 'Custom bespoke design via AI Voice Concierge',
      samplePhotos: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800'],
      totalAmount: data.totalAmount || 120000,
      advancePaid: data.advancePaid || 30000,
      status: 'In Progress',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setBespokeOrders(prev => [newOrder, ...prev]);
    syncEntity('bespoke_orders', newOrder);

    if (data.advancePaid && data.advancePaid > 0) {
      handleAiRecordPayment({
        amount: data.advancePaid,
        customerName: data.customerName,
        location: 'Atelier',
        paymentType: 'customer_advance',
        category: 'Inflow',
        paymentMethod: 'Bank Transfer',
        relatedOrderId: newOrder.id,
        description: `Advance received for bespoke order ${newOrder.id} (${data.customerName})`
      });
    }

    return { success: true, order: newOrder, message: `Created bespoke order ${newOrder.id} for ${data.customerName}` };
  };

  const handleAiUpdateMetalRates = (data: {
    market?: 'india' | 'global';
    gold24kPerGram?: number;
    silverPerGram?: number;
    notes?: string;
  }) => {
    const market = data.market || marketView;
    setMetalRates((prev: any) => {
      const updated = { ...prev };
      if (!updated[market]) updated[market] = { gold: {}, silver: {} };
      if (data.gold24kPerGram) {
        const g24 = data.gold24kPerGram;
        updated[market].gold = {
          '24k': g24,
          '22k': g24 * (22 / 24),
          '20k': g24 * (20 / 24),
          '18k': g24 * (18 / 24),
          '14k': g24 * (14 / 24),
          '9k': g24 * (9 / 24)
        };
      }
      if (data.silverPerGram) {
        const s = data.silverPerGram;
        updated[market].silver = {
          '99.99': s,
          '92.5': s * 0.925
        };
      }
      updated.lastUpdated = new Date().toLocaleTimeString();
      localStorage.setItem('lumora_metal_rates', JSON.stringify(updated));
      return updated;
    });
    return { success: true, message: `Updated metal spot rates for ${market.toUpperCase()}` };
  };

  const handleAiLogRepair = (data: {
    customerName: string;
    customerPhone?: string;
    itemDescription: string;
    repairDetails: string;
    costEstimate?: number;
  }) => {
    const newRepair: RepairJob = {
      id: `REP-${Date.now().toString().slice(-4)}`,
      customerName: data.customerName,
      customerPhone: data.customerPhone || '+91 9800000000',
      customerEmail: `${data.customerName.toLowerCase().replace(/\s+/g, '.')}@client.com`,
      itemDescription: data.itemDescription,
      repairDetails: data.repairDetails,
      costEstimate: data.costEstimate || 3500,
      status: 'Received',
      assignedCraftsmanName: 'Master Rajesh',
      assignedCraftsmanId: 'CRAFT-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setRepairJobs(prev => [newRepair, ...prev]);
    syncRepairJob(newRepair);
    return { success: true, repair: newRepair, message: `Logged repair job ${newRepair.id} for ${data.customerName}` };
  };

  const handleAiDeleteProduct = (idOrSkuOrName: string) => {
    let deleted: Product | undefined;
    const target = idOrSkuOrName.toLowerCase().trim();
    setProducts(prev => {
      deleted = prev.find(p => p.id.toLowerCase() === target || p.sku.toLowerCase() === target || p.name.toLowerCase().includes(target) || target.includes(p.name.toLowerCase()));
      if (deleted) {
        return prev.filter(p => p.id !== deleted!.id);
      }
      return prev;
    });
    return {
      success: !!deleted,
      product: deleted,
      message: deleted ? `Permanently removed product "${deleted.name}" (${deleted.sku}) from catalog` : `Product not found`
    };
  };

  const handleAiDeleteCustomer = (idOrName: string) => {
    let deleted: Customer | undefined;
    const target = idOrName.toLowerCase().trim();
    setCustomers(prev => {
      deleted = prev.find(c => c.id.toLowerCase() === target || c.name.toLowerCase().includes(target) || target.includes(c.name.toLowerCase()));
      if (deleted) {
        return prev.filter(c => c.id !== deleted!.id);
      }
      return prev;
    });
    return {
      success: !!deleted,
      customer: deleted,
      message: deleted ? `Removed client "${deleted.name}" (${deleted.id}) from CRM records` : `Customer not found`
    };
  };

  const handleAiDeleteOrder = (orderIdOrCust: string) => {
    let deleted: BespokeOrder | undefined;
    const target = orderIdOrCust.toLowerCase().trim();
    setBespokeOrders(prev => {
      deleted = prev.find(o => o.id.toLowerCase() === target || o.customerName.toLowerCase().includes(target) || target.includes(o.id.toLowerCase()));
      if (deleted) {
        return prev.filter(o => o.id !== deleted!.id);
      }
      return prev;
    });
    return {
      success: !!deleted,
      order: deleted,
      message: deleted ? `Cancelled & removed bespoke order "${deleted.id}" for ${deleted.customerName}` : `Order not found`
    };
  };

  const handleAiUpdateCustomer = (idOrName: string, updates: Partial<Customer>) => {
    let updatedCust: Customer | undefined;
    const target = idOrName.toLowerCase().trim();
    setCustomers(prev => prev.map(c => {
      if (c.id.toLowerCase() === target || c.name.toLowerCase().includes(target) || target.includes(c.name.toLowerCase())) {
        const u = { ...c, ...updates };
        updatedCust = u;
        syncEntity('customers', u);
        return u;
      }
      return c;
    }));
    return {
      success: !!updatedCust,
      customer: updatedCust,
      message: updatedCust ? `Updated profile for client "${updatedCust.name}"` : `Customer not found`
    };
  };

  const handleAiUpdateProduct = (idOrSkuOrName: string, updates: Partial<Product>) => {
    let updatedProd: Product | undefined;
    const target = idOrSkuOrName.toLowerCase().trim();
    setProducts(prev => prev.map(p => {
      if (p.id.toLowerCase() === target || p.sku.toLowerCase() === target || p.name.toLowerCase().includes(target) || target.includes(p.name.toLowerCase())) {
        const u = { ...p, ...updates };
        updatedProd = u;
        syncEntity('products', u);
        return u;
      }
      return p;
    }));
    return {
      success: !!updatedProd,
      product: updatedProd,
      message: updatedProd ? `Updated product "${updatedProd.name}" (${updatedProd.sku})` : `Product not found`
    };
  };

  // Prospect Orders Pipeline State
  const [prospects, setProspects] = useState<ProspectOrder[]>(() => {
    try {
      const saved = localStorage.getItem('lumora_prospect_orders');
      return saved ? JSON.parse(saved) : MOCK_PROSPECT_ORDERS;
    } catch {
      return MOCK_PROSPECT_ORDERS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lumora_prospect_orders', JSON.stringify(prospects));
    } catch (e) {
      console.warn('Could not persist prospect orders to local storage:', e);
    }
  }, [prospects]);

  const handleAddProspect = (newProspect: ProspectOrder) => {
    setProspects(prev => [newProspect, ...prev]);
    syncEntity('prospect_orders', newProspect);
  };

  const handleUpdateProspect = (id: string, updates: Partial<ProspectOrder>) => {
    setProspects(prev => prev.map(p => {
      if (p.id === id) {
        const u = { ...p, ...updates, updatedAt: new Date().toISOString().split('T')[0] };
        syncEntity('prospect_orders', u);
        return u;
      }
      return p;
    }));
  };

  const handleDeleteProspect = async (id: string) => {
    setProspects(prev => prev.filter(p => p.id !== id));
    if (supabase) {
      try {
        await supabase.from('prospect_orders').delete().eq('id', id);
      } catch (err) {
        console.warn("Could not delete prospect from Supabase:", err);
      }
    }
  };

  const handlePlaceAsBespokeOrder = (
    prospect: ProspectOrder,
    bespokeData: Partial<BespokeOrder>,
    advanceAmount: number,
    advanceMethod: string
  ) => {
    const newBespokeId = `BSK-${String(Date.now()).slice(-4)}`;
    const fullBespokeOrder: BespokeOrder = {
      id: newBespokeId,
      customerName: bespokeData.customerName || prospect.customerName,
      customerEmail: bespokeData.customerEmail || prospect.customerEmail || 'client@atelier.lumora.com',
      customerPhone: bespokeData.customerPhone || prospect.customerPhone,
      craftsmanId: bespokeData.craftsmanId || 'CRF-01',
      craftsmanName: bespokeData.craftsmanName || 'Master Hiroshi',
      metalType: bespokeData.metalType || 'Gold',
      metalPurity: bespokeData.metalPurity || '18k',
      metalWeight: Number(bespokeData.metalWeight || 12.0),
      metalCostPerGram: Number(bespokeData.metalCostPerGram || 6200),
      stones: bespokeData.stones || [],
      diamonds: bespokeData.diamonds || [],
      makingCostPerGram: Number(bespokeData.makingCostPerGram || 950),
      additionalExpenses: Number(bespokeData.additionalExpenses || 3500),
      specifications: bespokeData.specifications || prospect.designDetails?.specifications || '',
      samplePhotos: bespokeData.samplePhotos && bespokeData.samplePhotos.length > 0 ? bespokeData.samplePhotos : (prospect.designDetails?.samplePhotos || []),
      totalAmount: Number(bespokeData.totalAmount || prospect.estimatedQuote || prospect.targetBudget || 250000),
      advancePaid: Number(advanceAmount || 0),
      status: 'In Progress',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setBespokeOrders(prev => [fullBespokeOrder, ...prev]);
    syncEntity('bespoke_orders', fullBespokeOrder);

    if (advanceAmount > 0) {
      const ledgerEntry: LedgerEntry = {
        id: `LED-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'customer_advance',
        category: 'Inflow',
        amount: advanceAmount,
        relatedId: newBespokeId,
        relatedName: prospect.customerName,
        description: `Advance deposit for Bespoke Commission ${newBespokeId} (${prospect.title}) via ${advanceMethod}`,
        status: 'completed'
      };
      setLedger(prev => [ledgerEntry, ...prev]);
      syncEntity('ledger', ledgerEntry);
    }

    const updatedLog = [
      {
        id: `act-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'status_change' as const,
        text: `Finalized specifications & placed as Bespoke Workshop Order #${newBespokeId}. Advance recorded: ₹${advanceAmount.toLocaleString()} via ${advanceMethod}.`,
        author: 'Studio Director'
      },
      ...(prospect.activityLog || [])
    ];

    handleUpdateProspect(prospect.id, {
      status: 'converted_to_order',
      convertedOrderId: newBespokeId,
      convertedOrderType: 'bespoke',
      convertedAt: new Date().toISOString().split('T')[0],
      advanceReceived: advanceAmount,
      activityLog: updatedLog
    });
  };

  const handlePlaceAsStandardOrder = (
    prospect: ProspectOrder,
    orderData: any,
    advanceAmount: number,
    advanceMethod: string
  ) => {
    const newOrderId = `ORD-${String(Date.now()).slice(-4)}`;
    const fullOrder = {
      id: newOrderId,
      customer: orderData.customer || prospect.customerName,
      total: Number(orderData.total || prospect.estimatedQuote || 150000),
      status: 'In Production',
      channel: orderData.channel || 'Offline',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      craftsmanId: orderData.craftsmanId || 'CRF-01',
      craftsmanName: orderData.craftsmanName || 'Master Hiroshi',
      specifications: orderData.specifications || prospect.designDetails?.specifications || '',
      samplePhotos: orderData.samplePhotos || prospect.designDetails?.samplePhotos || []
    };

    setOrders(prev => [fullOrder, ...prev]);

    if (advanceAmount > 0) {
      const ledgerEntry: LedgerEntry = {
        id: `LED-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'customer_advance',
        category: 'Inflow',
        amount: advanceAmount,
        relatedId: newOrderId,
        relatedName: prospect.customerName,
        description: `Advance deposit for Order ${newOrderId} (${prospect.title}) via ${advanceMethod}`,
        status: 'completed'
      };
      setLedger(prev => [ledgerEntry, ...prev]);
      syncEntity('ledger', ledgerEntry);
    }

    const updatedLog = [
      {
        id: `act-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'status_change' as const,
        text: `Placed as Standard Atelier Order #${newOrderId}. Advance recorded: ₹${advanceAmount.toLocaleString()} via ${advanceMethod}.`,
        author: 'Studio Director'
      },
      ...(prospect.activityLog || [])
    ];

    handleUpdateProspect(prospect.id, {
      status: 'converted_to_order',
      convertedOrderId: newOrderId,
      convertedOrderType: 'standard',
      convertedAt: new Date().toISOString().split('T')[0],
      advanceReceived: advanceAmount,
      activityLog: updatedLog
    });
  };

  const [bespokeOrders, setBespokeOrders] = useState<BespokeOrder[]>(MOCK_BESPOKE_ORDERS);
  const [isBespokeModalOpen, setIsBespokeModalOpen] = useState(false);
  const [editingBespoke, setEditingBespoke] = useState<BespokeOrder | null>(null);
  const [bespokeModalStep, setBespokeModalStep] = useState(1);
  
  // Detailed Bespoke Breakdown State
  const [bespokeMetalType, setBespokeMetalType] = useState('gold');
  const [bespokeMetalWeight, setBespokeMetalWeight] = useState(0);
  const [bespokeMetalPurity, setBespokeMetalPurity] = useState('18k');
  const [bespokeMetalCost, setBespokeMetalCost] = useState(0);
  const [bespokePolishComments, setBespokePolishComments] = useState('');
  const [bespokeStones, setBespokeStones] = useState<BespokeItem[]>([]);
  const [bespokeDiamonds, setBespokeDiamonds] = useState<BespokeItem[]>([]);
  const [bespokeMakingCost, setBespokeMakingCost] = useState(0);
  const [bespokeAdditionalExpenses, setBespokeAdditionalExpenses] = useState(0);
  const [bespokeMargins, setBespokeMargins] = useState({
    metal: 0,
    stones: 40,
    diamonds: 40,
    overheads: 40
  });

  const [isJobCardOpen, setIsJobCardOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [selectedBespoke, setSelectedBespoke] = useState<BespokeOrder | null>(null);
  const [partnerViewMode, setPartnerViewMode] = useState<'directory' | 'inventory'>('directory');
  const [bespokeUploadedImages, setBespokeUploadedImages] = useState<string[]>([]);
  const [orderUploadedImages, setOrderUploadedImages] = useState<string[]>([]);
  const resellerFileInputRef = useRef<HTMLInputElement>(null);
  const customerFileInputRef = useRef<HTMLInputElement>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);

  const handleDirectPutToProduction = (orderId: string, isBespoke: boolean, isStock?: boolean) => {
    // If job already exists and NOT reordering for stock, highlight and navigate
    if (!isStock) {
      const existingJob = productionJobs.find(j => j.orderId === orderId);
      if (existingJob) {
        setHighlightedProductionJobId(orderId);
        setActiveTab('production');
        return;
      }
    }

    const finalOrderId = isStock 
      ? `STOCK-${Math.floor(Math.random() * 9000) + 1000}` 
      : orderId;

    let productName = '';
    let productImage = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800';
    let stoneSetterName = 'Master Hiroshi';
    let jobSamplePhotos: string[] = [];

    if (isBespoke) {
      const bo = bespokeOrders.find(b => b.id === orderId);
      if (bo) {
        productName = isStock 
          ? `Stock Replenishment: Bespoke Style ${bo.metalType} Piece`
          : `Bespoke Commission: ${bo.customerName} - ${bo.metalType} Piece`;
        if (bo.samplePhotos && bo.samplePhotos[0]) {
          productImage = bo.samplePhotos[0];
        }
        if (bo.craftsmanName) {
          stoneSetterName = bo.craftsmanName;
        }
        jobSamplePhotos = bo.samplePhotos || [];
      } else {
        productName = `Bespoke Order ${orderId}`;
      }
    } else {
      const o = orders.find(ord => ord.id === orderId);
      if (o) {
        productName = isStock
          ? `Stock Replenishment: Standard Style (${orderId})`
          : `Standard Order: Premium Piece for ${o.customer}`;
        if (o.samplePhotos && o.samplePhotos[0]) {
          productImage = o.samplePhotos[0];
        }
        if (o.craftsmanName) {
          stoneSetterName = o.craftsmanName;
        }
        jobSamplePhotos = o.samplePhotos || [];
      } else {
        productName = `Standard Order ${orderId}`;
      }
    }

    const defaultSteps: ProductionStep[] = [
      { id: 'step-1', name: 'Design & CAD', status: 'In Progress', craftsmanName: 'Elena Rossi', estimateCost: 500, estimateDays: 3 },
      { id: 'step-2', name: 'Metal Casting', status: 'Pending', craftsmanName: 'Marcus Thorne', estimateCost: 1200, estimateDays: 5 },
      { id: 'step-3', name: 'Stone Setting', status: 'Pending', craftsmanName: stoneSetterName, estimateCost: 1500, estimateDays: 4 },
      { id: 'step-4', name: 'Polishing & Finishing', status: 'Pending' },
      { id: 'step-5', name: 'Quality Assay & Hallmarking', status: 'Pending' }
    ];

    const newJob: ProductionJob = {
      id: `JOB-${Math.floor(Math.random() * 9000) + 1000}`,
      orderId: finalOrderId,
      productName: productName,
      productImage: productImage,
      steps: defaultSteps,
      status: 'Live',
      updatedAt: new Date().toISOString().split('T')[0],
      samplePhotos: jobSamplePhotos
    };

    setProductionJobs(prev => [newJob, ...prev]);

    if (!isStock) {
      if (isBespoke) {
        setBespokeOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'In Progress' } : o));
      } else {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'In Production' } : o));
      }
    }

    setHighlightedProductionJobId(finalOrderId);
    setActiveTab('production');
  };

  const generateAIForBulkItem = async (tempId: string, base64Image: string) => {
    setGeneratingBulkItemIds(prev => [...prev, tempId]);
    try {
      const response = await fetch('/api/gemini/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: base64Image }),
      });
      
      if (!response.ok) throw new Error('Failed to describe piece');
      const result = await response.json();
      
      setBulkUploadItems(prev => prev.map(item => {
        if (item.id === tempId) {
          return {
            ...item,
            name: result.name || item.name,
            description: result.description || item.description,
            category: result.category || item.category,
            material: result.material || item.material,
            price: result.price !== undefined ? Number(result.price) : item.price,
          };
        }
        return item;
      }));
    } catch (err) {
      console.error("Failed bulk AI generation for item", tempId, err);
      setBulkUploadItems(prev => prev.map(item => {
        if (item.id === tempId) {
          return {
            ...item,
            material: '18k Gold',
            description: 'A finely crafted bespoke jewelry piece, created with attention to detail and exquisite materials.'
          };
        }
        return item;
      }));
    } finally {
      setGeneratingBulkItemIds(prev => prev.filter(id => id !== tempId));
    }
  };

  const handleBulkUpload = (files: FileList) => {
    const newItems: Partial<Product>[] = [];
    const filesArray = Array.from(files);
    let processedCount = 0;

    filesArray.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const tempId = `TEMP-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`;
        const base64Data = reader.result as string;
        
        newItems.push({
          id: tempId,
          name: file.name.split('.')[0].replace(/[-_]/g, ' '),
          images: [base64Data, 'https://picsum.photos/seed/detail1/800/1000', 'https://picsum.photos/seed/detail2/800/1000'],
          sku: `LUM-${Math.floor(Math.random() * 10000)}`,
          category: 'Necklaces',
          price: 0,
          stock: 1,
          material: 'Analyzing...',
          description: 'Analyzing image and generating description...',
          status: 'Available',
          channels: [ChannelType.WEBSITE]
        });
        processedCount++;
        
        if (processedCount === filesArray.length) {
          setBulkUploadItems(prev => [...prev, ...newItems]);
          setIsBulkUploadModalOpen(true);
          
          // Trigger AI analysis for each item
          newItems.forEach(item => {
            generateAIForBulkItem(item.id!, item.images?.[0] || '');
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveBulkUpload = () => {
    const finalProducts: Product[] = bulkUploadItems.map(item => ({
      ...item,
      id: item.id?.startsWith('TEMP-') ? `LUM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : item.id,
    } as Product));

    setProducts(prev => [...finalProducts, ...prev]);
    setIsBulkUploadModalOpen(false);
    setBulkUploadItems([]);
  };

  const downloadProductTemplate = () => {
    const headers = ["ID", "Name", "SKU", "Category", "Price", "Stock", "Material", "Channels", "Description", "Image_URLs"];
    const rows = [
      ["PROD-001", "Solitaire Diamond Ring", "LUM-1001", "Rings", "4500", "5", "18k White Gold", "WEBSITE,OFFLINE", "Exquisite 1-carat round brilliant cut solitaire diamond ring in 18k white gold.", "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"],
      ["PROD-002", "Classic Sapphire Pendant", "LUM-1002", "Necklaces", "3200", "3", "18k Yellow Gold", "WEBSITE,INSTAGRAM", "A stunning oval sapphire necklace surrounded by a diamond halo.", "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"],
      ["PROD-003", "Emerald Tennis Bracelet", "LUM-1003", "Bracelets", "7500", "2", "Platinum", "OFFLINE,WHATSAPP", "Vibrant Colombian emerald tennis bracelet set in pure platinum.", "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80"]
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Lumora_Masterpiece_Bulk_Upload_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProductCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processProductData(results.data);
        },
        error: (error: any) => {
          alert("Error parsing CSV: " + error.message);
        }
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          processProductData(jsonData);
        } catch (err) {
          alert("Error parsing Excel file.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a CSV or Excel file.");
    }
    
    // Reset input
    if (productFileInputRef.current) productFileInputRef.current.value = '';
  };

  const processProductData = (data: any[]) => {
    if (!data || data.length === 0) {
      alert("No data found in the file.");
      return;
    }

    const getValue = (row: any, keys: string[]) => {
      for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null) return row[key];
        const foundKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
        if (foundKey) return row[foundKey];
      }
      return undefined;
    };

    const newProducts: Product[] = data.map((item: any, index: number) => {
      const channelsString = String(getValue(item, ['channels', 'Channels', 'Sales Channels']) || 'WEBSITE');
      const channels = channelsString.split(',').map(c => c.trim().toUpperCase() as ChannelType);

      const imagesString = String(getValue(item, ['images', 'Images', 'Image_URLs', 'Image URLs']) || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80');
      const images = imagesString.split(',').map(img => img.trim());

      return {
        id: String(getValue(item, ['id', 'ID', 'Id']) || `PROD-${Date.now()}-${index}`),
        name: String(getValue(item, ['name', 'Name', 'Title']) || 'Unnamed Piece'),
        sku: String(getValue(item, ['sku', 'SKU', 'Sku', 'Ref']) || `LUM-${Math.floor(1000 + Math.random() * 9000)}`),
        category: String(getValue(item, ['category', 'Category', 'Type']) || 'Rings'),
        price: Number(getValue(item, ['price', 'Price', 'Value', 'Cost']) || 0),
        stock: Number(getValue(item, ['stock', 'Stock', 'Quantity', 'Qty']) || 1),
        images: images,
        material: String(getValue(item, ['material', 'Material', 'Metal']) || '18k Gold'),
        status: (getValue(item, ['status', 'Status']) || 'Available') as ProductStatus,
        channels: channels,
        description: String(getValue(item, ['description', 'Description', 'Notes']) || '')
      };
    });

    setProducts(prev => [...newProducts, ...prev]);
    alert(`Successfully imported ${newProducts.length} new masterpieces into your collection.`);
  };

  const handleConnect = (platform: string) => {
    setConnectingPlatform(platform as 'Pinterest' | 'Instagram' | 'Facebook');
    setIsSocialConnectModalOpen(true);
  };

  const addBespokeItem = (type: 'stones' | 'diamonds') => {
    const newItem: BespokeItem = type === 'stones'
      ? { id: Math.random().toString(36).substr(2, 9), name: 'Emerald', weight: 0, unit: 'ct', unitCost: 0, gemstoneType: 'natural' }
      : { id: Math.random().toString(36).substr(2, 9), name: 'VS-H Round', weight: 0, unit: 'ct', unitCost: 0, diamondType: 'natural' };
    if (type === 'stones') setBespokeStones(prev => [...prev, newItem]);
    else setBespokeDiamonds(prev => [...prev, newItem]);
  };

  const updateBespokeItem = (type: 'stones' | 'diamonds', id: string, field: string, value: any) => {
    const setter = type === 'stones' ? setBespokeStones : setBespokeDiamonds;
    setter(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeBespokeItem = (type: 'stones' | 'diamonds', id: string) => {
    const setter = type === 'stones' ? setBespokeStones : setBespokeDiamonds;
    setter(prev => prev.filter(item => item.id !== id));
  };

  const handleExportPartnerInventory = () => {
    const data = partnerInventory.map(pi => {
      const product = products.find(p => p.id === pi.productId);
      const reseller = resellers.find(r => r.id === pi.resellerId);
      return {
        'Product Name': product?.name || 'Unknown',
        'SKU': product?.sku || '',
        'Category': product?.category || '',
        'Partner': reseller?.name || 'Unknown',
        'Pricing Model': pi.pricingModel,
        'Partner Price': pi.partnerPrice,
        'Status': pi.status,
        'Assigned Date': pi.assignedDate,
        'Photograph URL': product?.images[0] || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Partner Inventory');
    XLSX.writeFile(workbook, 'Lumora_Partner_Inventory.xlsx');
  };

  const handlePrintPartnerInventory = async () => {
    // Create a temporary element for printing
    const printEl = document.createElement('div');
    printEl.style.position = 'absolute';
    printEl.style.left = '-9999px';
    printEl.style.width = '210mm'; // A4 width
    printEl.className = 'bg-white p-12 space-y-10';
    
    // Add header
    printEl.innerHTML = `
      <div class="border-b-2 border-lumora-gold pb-6 flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-serif font-bold text-lumora-charcoal">Inventory Distribution Report</h1>
          <p class="text-sm text-lumora-taupe uppercase tracking-widest font-bold">LUMORA LUXURY ATELIER</p>
        </div>
        <div class="text-right">
          <p class="text-[10px] text-lumora-taupe uppercase font-bold">Report Date</p>
          <p class="text-xs font-bold">${new Date().toLocaleDateString()}</p>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-8 pt-8">
        ${partnerInventory.map(pi => {
          const product = products.find(p => p.id === pi.productId);
          const reseller = resellers.find(r => r.id === pi.resellerId);
          return `
            <div class="flex gap-8 border border-black/5 p-6 bg-lumora-bone/20">
              <div class="w-32 h-32 bg-white border border-black/5 overflow-hidden flex-shrink-0">
                <img src="${product?.images[0]}" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p class="text-[8px] text-lumora-taupe uppercase font-bold tracking-widest">Product Details</p>
                  <p class="text-sm font-serif font-bold text-lumora-charcoal">${product?.name}</p>
                  <p class="text-[9px] text-lumora-taupe lowercase font-mono">${product?.sku}</p>
                </div>
                <div>
                  <p class="text-[8px] text-lumora-taupe uppercase font-bold tracking-widest">Partner Assignment</p>
                  <p class="text-[11px] font-bold text-lumora-charcoal">${reseller?.name}</p>
                  <p class="text-[9px] text-lumora-taupe uppercase tracking-widest">${pi.status} • ${pi.assignedDate}</p>
                </div>
                <div>
                  <p class="text-[8px] text-lumora-taupe uppercase font-bold tracking-widest">Pricing Model</p>
                  <p class="text-[10px] font-bold text-lumora-charcoal">${pi.pricingModel}</p>
                </div>
                <div>
                  <p class="text-[8px] text-lumora-taupe uppercase font-bold tracking-widest">Partner Price</p>
                  <p class="text-[10px] font-bold text-lumora-gold">$${pi.partnerPrice.toLocaleString()}</p>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    
    document.body.appendChild(printEl);
    
    try {
      const canvas = await html2canvas(printEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const contentWidth = pdfWidth;
      const contentHeight = (imgProps.height * contentWidth) / imgProps.width;
      
      let heightLeft = contentHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, contentWidth, contentHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - contentHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, contentWidth, contentHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save('Lumora_Inventory_Catalog.pdf');
    } catch (err) {
      console.error(err);
    } finally {
      document.body.removeChild(printEl);
    }
  };

  const handleSaveBespoke = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingBespoke?.id || `BSK-${Math.floor(Math.random() * 900) + 100}`;
    const advancePaid = Number(formData.get('advancePaid'));
    const totalAmount = Number(formData.get('totalAmount'));
    const craftsmanId = formData.get('craftsmanId') as string;
    const craftsman = MOCK_CRAFTSMEN.find(c => c.id === craftsmanId);

    const bespokeData: BespokeOrder = {
      id,
      customerName: formData.get('customerName') as string,
      customerEmail: formData.get('customerEmail') as string,
      customerPhone: formData.get('customerPhone') as string,
      craftsmanId,
      craftsmanName: craftsman?.name || 'Unknown',
      metalType: bespokeMetalType,
      metalPurity: bespokeMetalPurity,
      metalWeight: bespokeMetalWeight,
      metalCostPerGram: bespokeMetalCost,
      stones: bespokeStones,
      diamonds: bespokeDiamonds,
      makingCostPerGram: bespokeMakingCost,
      additionalExpenses: bespokeAdditionalExpenses,
      margins: bespokeMargins,
      specifications: formData.get('specifications') as string,
      samplePhotos: bespokeUploadedImages.length > 0 ? bespokeUploadedImages : (editingBespoke?.samplePhotos || []),
      totalAmount,
      advancePaid,
      status: formData.get('status') as BespokeOrder['status'],
      createdAt: editingBespoke?.createdAt || new Date().toISOString().split('T')[0],
      savedGoldRate: editingBespoke?.savedGoldRate || metalRates[marketView]?.gold?.['24k'] || 0,
      savedSilverRate: editingBespoke?.savedSilverRate || metalRates[marketView]?.silver?.['99.99'] || 0,
      savedMarket: editingBespoke?.savedMarket || marketView,
      polishComments: bespokePolishComments
    };

    // If new advance payment is made, record it in ledger
    if (!editingBespoke && advancePaid > 0) {
      const ledgerEntry: LedgerEntry = {
        id: `TXN-${Math.floor(Math.random() * 9000) + 1000}`,
        date: new Date().toISOString().split('T')[0],
        type: 'customer_advance',
        amount: advancePaid,
        relatedId: id,
        relatedName: bespokeData.customerName,
        description: `Advance payment for bespoke order ${id}`,
        status: 'completed',
        category: 'Inflow'
      };
      setLedger(prev => [ledgerEntry, ...prev]);
    } else if (editingBespoke && advancePaid !== editingBespoke.advancePaid) {
        // Handle update of advance payment if needed (simplified for now: only record new ones)
    }

    if (editingBespoke) {
      setBespokeOrders(prev => prev.map(o => o.id === editingBespoke.id ? bespokeData : o));
    } else {
      setBespokeOrders(prev => [bespokeData, ...prev]);
    }
    setIsBespokeModalOpen(false);
    setEditingBespoke(null);
    setBespokeUploadedImages([]);
  };

  const handleSaveReseller = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newReseller: Reseller = {
      id: `RES-${Math.floor(Math.random() * 9000) + 1000}`,
      name: formData.get('name') as string,
      type: formData.get('type') as Reseller['type'],
      contact: formData.get('contact') as string,
      email: formData.get('email') as string,
      location: formData.get('location') as string,
      facebookUrl: formData.get('facebookUrl') as string,
      instagramUrl: formData.get('instagramUrl') as string,
      status: 'Active'
    };
    setResellers(prev => [...prev, newReseller]);
    setIsResellerModalOpen(false);
  };

  const handleSaveMaterial = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const type = formData.get('type') as 'Stone' | 'Metal' | 'Packaging';
    const quantity = parseFloat(formData.get('quantity') as string) || 0;
    const unit = formData.get('unit') as string;
    const value = parseFloat(formData.get('value') as string) || 0;

    if (editingMaterial) {
      setMasterInventory(prev => prev.map(item => item.id === editingMaterial.id ? { ...item, name, type, quantity, unit, value } : item));
      setEditingMaterial(null);
    } else {
      const newMaterial: InventoryItem = {
        id: `RM-${String(masterInventory.length + 1).padStart(3, '0')}`,
        name,
        type,
        quantity,
        unit,
        value
      };
      setMasterInventory(prev => [...prev, newMaterial]);
    }
    setIsMaterialModalOpen(false);
  };

  const handleSaveAudit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemId = formData.get('itemId') as string;
    const actualQuantity = parseFloat(formData.get('actualQuantity') as string) || 0;
    const notes = formData.get('notes') as string;
    const auditor = formData.get('auditor') as string;

    const item = masterInventory.find(i => i.id === itemId);
    if (!item) return;

    const previousQuantity = item.quantity;
    const variance = actualQuantity - previousQuantity;

    // Update the item quantity in inventory
    setMasterInventory(prev => prev.map(i => i.id === itemId ? { ...i, quantity: actualQuantity } : i));

    // Create the audit log
    const newAudit: InventoryAuditLog = {
      id: `AUD-${String(auditLogs.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      itemId,
      itemName: item.name,
      previousQuantity,
      newQuantity: actualQuantity,
      variance,
      notes,
      auditor
    };

    setAuditLogs(prev => [newAudit, ...prev]);
    setIsAuditModalOpen(false);
  };

  const handleResellerBulkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processResellerData(results.data);
        },
        error: (error: any) => {
          alert("Error parsing CSV: " + error.message);
        }
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          processResellerData(jsonData);
        } catch (err) {
          alert("Error parsing Excel file.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a CSV or Excel file.");
    }
    
    // Reset input
    if (resellerFileInputRef.current) resellerFileInputRef.current.value = '';
  };

  const processResellerData = (data: any[]) => {
    if (!data || data.length === 0) {
      alert("No data found in the file.");
      return;
    }

    const getValue = (row: any, keys: string[]) => {
      for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null) return row[key];
        const foundKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
        if (foundKey) return row[foundKey];
      }
      return undefined;
    };

    const newResellers: Reseller[] = data.map((item: any, index: number) => ({
      id: String(getValue(item, ['id', 'ID', 'Id']) || `RES-${Date.now()}-${index}`),
      name: String(getValue(item, ['name', 'Name', 'Partner Name', 'Reseller Name']) || 'Unknown'),
      type: (getValue(item, ['type', 'Type', 'Partner Type']) || 'Boutique') as Reseller['type'],
      contact: String(getValue(item, ['contact', 'Contact', 'phone', 'Phone', 'Mobile']) || ''),
      email: String(getValue(item, ['email', 'Email', 'Mail']) || ''),
      location: String(getValue(item, ['location', 'Location', 'Address', 'City']) || ''),
      status: 'Active'
    }));

    setResellers(prev => [...newResellers, ...prev]);
    alert(`Successfully uploaded ${newResellers.length} resellers.`);
  };

  const handleCustomerBulkUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processCustomerData(results.data);
        },
        error: (error: any) => {
          alert("Error parsing CSV: " + error.message);
        }
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          processCustomerData(jsonData);
        } catch (err) {
          alert("Error parsing Excel file.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a CSV or Excel file.");
    }
    
    if (customerFileInputRef.current) customerFileInputRef.current.value = '';
  };

  const processCustomerData = (data: any[]) => {
    if (!data || data.length === 0) {
      alert("No data found in the file.");
      return;
    }

    const updatedCustomers = [...customers];
    let addedCount = 0;
    let updatedCount = 0;

    const getValue = (row: any, keys: string[]) => {
      for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null) return row[key];
        // Check case-insensitive
        const foundKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
        if (foundKey) return row[foundKey];
      }
      return undefined;
    };

    data.forEach((row: any) => {
      const email = String(getValue(row, ['email', 'Email Address', 'Mail']) || '');
      const id = String(getValue(row, ['id', 'ID', 'Id', 'Customer ID', 'Client ID']) || '');
      const name = String(getValue(row, ['name', 'Name', 'Full Name', 'Customer Name', 'Client Name']) || '');
      
      const index = updatedCustomers.findIndex(c => (id && c.id === id) || (email && c.email === email));
      
      const customerData: Partial<Customer> = {
        name: name || (index !== -1 ? updatedCustomers[index].name : 'Unknown'),
        email: email || (index !== -1 ? updatedCustomers[index].email : ''),
        phone: String(getValue(row, ['phone', 'Phone Number', 'Phone', 'Mobile', 'Mobile Number', 'Contact', 'Contact Number']) || (index !== -1 ? (updatedCustomers[index].phone || '') : '')),
        otherPhone: String(getValue(row, ['otherPhone', 'Other Phone', 'Secondary Phone', 'Alternate Phone']) || (index !== -1 ? (updatedCustomers[index].otherPhone || '') : '')),
        totalSpend: Number(getValue(row, ['totalSpend', 'Total Spend', 'Spent', 'Revenue']) || (index !== -1 ? updatedCustomers[index].totalSpend : 0)),
        lastOrder: String(getValue(row, ['lastOrder', 'Last Order', 'Last Purchase']) || (index !== -1 ? updatedCustomers[index].lastOrder : 'N/A')),
        status: String(getValue(row, ['status', 'Status', 'Segment']) || (index !== -1 ? updatedCustomers[index].status : 'New')),
        country: String(getValue(row, ['country', 'Country']) || (index !== -1 ? (updatedCustomers[index].country || '') : '')),
        state: String(getValue(row, ['state', 'State', 'Province']) || (index !== -1 ? (updatedCustomers[index].state || '') : '')),
        city: String(getValue(row, ['city', 'City', 'Town']) || (index !== -1 ? (updatedCustomers[index].city || '') : '')),
        area: String(getValue(row, ['area', 'Area', 'Neighborhood']) || (index !== -1 ? (updatedCustomers[index].area || '') : '')),
        location: String(getValue(row, ['location', 'Location', 'Address']) || (index !== -1 ? (updatedCustomers[index].location || '') : '')),
        leadSource: String(getValue(row, ['leadSource', 'Lead Source', 'Source']) || (index !== -1 ? (updatedCustomers[index].leadSource || '') : '')),
        ageGroup: String(getValue(row, ['ageGroup', 'Age Group', 'Age']) || (index !== -1 ? (updatedCustomers[index].ageGroup || '') : '')),
        aliasName: String(getValue(row, ['aliasName', 'Alias', 'Nick Name']) || (index !== -1 ? (updatedCustomers[index].aliasName || '') : '')),
        relationType: String(getValue(row, ['relationType', 'Relation', 'Type']) || (index !== -1 ? (updatedCustomers[index].relationType || '') : '')),
        notes: String(getValue(row, ['notes', 'Notes', 'Remarks']) || (index !== -1 ? (updatedCustomers[index].notes || '') : '')),
        shippingAddress: String(getValue(row, ['shippingAddress', 'Shipping Address']) || (index !== -1 ? (updatedCustomers[index].shippingAddress || '') : '')),
      };

      if (index !== -1) {
        // Update existing
        updatedCustomers[index] = {
          ...updatedCustomers[index],
          ...customerData
        } as Customer;
        updatedCount++;
      } else {
        // Add new
        updatedCustomers.push({
          id: id || `CUS-${Math.floor(Math.random() * 9000) + 1000}`,
          ...customerData
        } as Customer);
        addedCount++;
      }
    });

    setCustomers(updatedCustomers);
    alert(`Bulk update complete: ${updatedCount} updated, ${addedCount} added.`);
  };

  const handleExportCustomersCSV = () => {
    if (customers.length === 0) {
      alert("No client data to export.");
      return;
    }
    
    // Header row matching Customer interface
    const headers = [
      "ID", "Name", "Alias Name", "Email", "Phone", "Other Phone", 
      "Relation Type", "Country", "State", "City", "Area", "Location", 
      "Shipping Address", "Lead Source", "Age Group", "Total Spend", 
      "Last Order", "Status", "Notes"
    ];
    
    // Rows
    const rows = customers.map(c => [
      c.id || '',
      c.name || '',
      c.aliasName || '',
      c.email || '',
      c.phone || '',
      c.otherPhone || '',
      c.relationType || '',
      c.country || '',
      c.state || '',
      c.city || '',
      c.area || '',
      c.location || '',
      c.shippingAddress || '',
      c.leadSource || '',
      c.ageGroup || '',
      String(c.totalSpend || 0),
      c.lastOrder || '',
      c.status || '',
      c.notes || ''
    ]);
    
    // Format into standard safe CSV with double quote escaping
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => {
        const str = String(val === undefined || val === null ? '' : val).replace(/"/g, '""');
        return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
      }).join(','))
    ].join('\n');
    
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `lumora_clientele_directory_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Failed to export client directory. Please try again.");
    }
  };

  const handleExportAllDataJSON = () => {
    try {
      const fullBackup = {
        exportDate: new Date().toISOString(),
        system: "Lumora Luxury Atelier ERP",
        version: "1.2.0",
        data: {
          customers,
          products,
          productionJobs,
          ledger,
          resellers,
          bespokeOrders,
          repairJobs
        }
      };
      
      const jsonString = JSON.stringify(fullBackup, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `lumora_complete_atelier_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Failed to export database data. Please try again.");
    }
  };

  const handleAssignProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedReseller) return;
    const formData = new FormData(e.currentTarget);
    const productId = formData.get('productId') as string;
    
    // Find the product
    const product = products.find(p => p.id === productId);
    if (!product) {
      alert("Product not found.");
      return;
    }
    if (product.stock <= 0) {
      alert(`Product "${product.name}" is currently out of stock.`);
      return;
    }

    const assignment: PartnerInventory = {
      id: `PI-${Math.floor(Math.random() * 9000) + 1000}`,
      resellerId: selectedReseller.id,
      productId: productId,
      pricingModel: formData.get('pricingModel') as PartnerInventory['pricingModel'],
      partnerPrice: Number(formData.get('partnerPrice')),
      assignedDate: new Date().toISOString().split('T')[0],
      status: 'On Display'
    };

    // Deduct 1 from stock
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: Math.max(0, p.stock - 1) } : p));
    setPartnerInventory(prev => [...prev, assignment]);
    setIsAssignModalOpen(false);
  };

  const handleMarkPartnerInventorySold = (piId: string) => {
    setPartnerInventory(prev => prev.map(pi => {
      if (pi.id === piId) {
        if (pi.status === 'Sold') return pi; // already sold
        
        const product = products.find(p => p.id === pi.productId);
        const reseller = resellers.find(r => r.id === pi.resellerId);
        
        // Add ledger entry
        const newLedgerEntry: LedgerEntry = {
          id: `TXN-${Math.floor(Math.random() * 90000) + 10000}`,
          date: new Date().toISOString().split('T')[0],
          type: 'sale',
          amount: pi.partnerPrice,
          relatedId: reseller?.id || 'Unknown Partner',
          relatedName: reseller?.name || 'Unknown Partner',
          description: `Partner Sale: ${product?.name || 'Unknown Item'} sold by ${reseller?.name || 'Partner'}`,
          status: 'completed',
          category: 'Inflow'
        };
        
        setLedger(prevLedger => [newLedgerEntry, ...prevLedger]);
        
        return { ...pi, status: 'Sold' as const };
      }
      return pi;
    }));
  };

  const handleMarkPartnerInventoryReturned = (piId: string) => {
    setPartnerInventory(prev => prev.map(pi => {
      if (pi.id === piId) {
        if (pi.status === 'Returned') return pi; // already returned
        
        // Add 1 back to the product stock
        setProducts(prevProd => prevProd.map(p => p.id === pi.productId ? { ...p, stock: p.stock + 1 } : p));
        
        return { ...pi, status: 'Returned' as const };
      }
      return pi;
    }));
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    setOrderToDelete(null);
  };

  const handleSaveOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const craftsmanId = formData.get('craftsmanId') as string || '';
    const craftsman = MOCK_CRAFTSMEN.find(c => c.id === craftsmanId);

    const orderData = {
      id: editingOrder?.id || `ORD-${Math.floor(Math.random() * 9000) + 1000}`,
      customer: formData.get('customer') as string,
      channel: formData.get('channel') as string,
      total: Number(formData.get('total')),
      status: formData.get('status') as string,
      craftsmanId: craftsmanId,
      craftsmanName: craftsman ? craftsman.name : '',
      specifications: formData.get('specifications') as string || '',
      samplePhotos: orderUploadedImages,
      date: editingOrder?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      savedGoldRate: editingOrder?.savedGoldRate || metalRates[marketView]?.gold?.['24k'] || 0,
      savedSilverRate: editingOrder?.savedSilverRate || metalRates[marketView]?.silver?.['99.99'] || 0,
      savedMarket: editingOrder?.savedMarket || marketView
    };

    if (editingOrder) {
      setOrders(prev => prev.map(o => o.id === editingOrder.id ? orderData : o));
    } else {
      setOrders(prev => [orderData, ...prev]);
    }
    setIsOrderModalOpen(false);
    setEditingOrder(null);
    setOrderUploadedImages([]);
  };

  const handleSaveCustomer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customerData = {
      id: editingCustomer?.id || `CUS-${Math.floor(Math.random() * 900) + 100}`,
      name: formData.get('name') as string,
      aliasName: formData.get('aliasName') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      country: formData.get('country') as string,
      state: formData.get('state') as string,
      city: formData.get('city') as string,
      location: formData.get('location') as string || formData.get('city') as string,
      area: formData.get('area') as string,
      leadSource: formData.get('leadSource') as string,
      relationType: formData.get('relationType') as string,
      ageGroup: formData.get('ageGroup') as string,
      notes: formData.get('notes') as string,
      shippingAddress: formData.get('shippingAddress') as string,
      otherPhone: formData.get('otherPhone') as string,
      status: formData.get('status') as string,
      totalSpend: editingCustomer?.totalSpend || 0,
      lastOrder: editingCustomer?.lastOrder || 'N/A'
    };

    setCustomers(prev => {
      if (editingCustomer) {
        return prev.map(c => c.id === editingCustomer.id ? customerData : c);
      } else {
        return [customerData, ...prev];
      }
    });
    setIsCustomerModalOpen(false);
    setEditingCustomer(null);
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    setCustomerToDelete(null);
  };

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newProduct: Product = {
      id: editingProduct?.id || `lp-${Math.random().toString(36).substr(2, 9)}`,
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      category: formData.get('category') as string,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      material: formData.get('material') as string,
      status: 'Available',
      description: formData.get('description') as string,
      images: productPreviews.length > 0 ? productPreviews : (editingProduct?.images || ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800']),
      video: videoPreview || editingProduct?.video,
      channels: [ChannelType.WEBSITE]
    };

    setProducts(prev => {
      if (editingProduct) {
        return prev.map(p => p.id === editingProduct.id ? newProduct : p);
      } else {
        return [...prev, newProduct];
      }
    });
    setIsProductModalOpen(false);
    setEditingProduct(null);
    setProductPreviews([]);
    setVideoPreview(null);
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const generateMagicDescription = async (productName: string, imageData?: string) => {
    setIsGeneratingDescription(true);
    try {
      const response = await fetch('/api/gemini/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData, productName }),
      });
      
      if (!response.ok) throw new Error('Failed to describe piece via server');
      return await response.json();
    } catch (e) {
      console.error(e);
      return { name: productName || 'New Masterpiece', description: '' };
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const fetchLiveRates = async () => {
    const savedMode = localStorage.getItem('lumora_rate_mode') || 'custom';
    if (savedMode === 'custom') {
      return metalRates;
    }
    try {
      const res = await fetch('/api/metal-rates');
      if (res.ok) {
        const data = await res.json();
        if (data && data.india && data.global) {
          setMetalRates(data);
          return data;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch live metal rates (using local high-precision defaults):', e);
    }
    return null;
  };

  const handleCustomRateChange = (metal: 'gold' | 'silver', value: number) => {
    const numericValue = isNaN(value) ? 0 : value;
    setMetalRates(prev => {
      const updated = JSON.parse(JSON.stringify(prev)); // Deep copy safely
      const market = marketView; // 'india' or 'global'
      
      if (!updated[market]) {
        updated[market] = { gold: {}, silver: {} };
      }
      if (!updated[market].gold) updated[market].gold = {};
      if (!updated[market].silver) updated[market].silver = {};

      if (metal === 'gold') {
        updated[market].gold['24k'] = numericValue;
        // Bifurcations: 22k = 91.67%, 20k = 83.33%, 18k = 75.0%, 14k = 58.33%, 9k = 37.5%
        updated[market].gold['22k'] = Number((numericValue * 22 / 24).toFixed(2));
        updated[market].gold['20k'] = Number((numericValue * 20 / 24).toFixed(2));
        updated[market].gold['18k'] = Number((numericValue * 18 / 24).toFixed(2));
        updated[market].gold['14k'] = Number((numericValue * 14 / 24).toFixed(2));
        updated[market].gold['9k'] = Number((numericValue * 9 / 24).toFixed(2));
      } else {
        updated[market].silver['99.99'] = numericValue;
        // Bifurcation: Sterling Silver 92.5%
        updated[market].silver['92.5'] = Number((numericValue * 0.925).toFixed(2));
      }
      
      updated.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('lumora_metal_rates', JSON.stringify(updated));
      return updated;
    });
  };

  const generateIntelligenceReport = async () => {
    setIsGeneratingReport(true);
    try {
      const liveRates = await fetchLiveRates() || metalRates;
      const ai = new GoogleGenAI({ apiKey: getApiKey() });
      const context = `
        Inventory: ${products.length} pieces, Total Value: $${products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}
        Customers: ${customers.length} total, ${customers.filter(c => c.status === 'VVIP').length} VVIPs.
        Top Sellers: ${products.slice(0, 3).map(p => p.name).join(', ')}
        Category Performance:
        ${MOCK_CATEGORY_SALES.map(c => `- ${c.category}: ${c.sales}% of sales, ${c.growth} growth, ${c.demand} demand`).join('\n')}
        Live Metal Spot Prices (India Market):
        - Gold 24k: ₹${liveRates.india.gold['24k']}/g
        - Gold 22k: ₹${liveRates.india.gold['22k']}/g
        - Gold 18k: ₹${liveRates.india.gold['18k']}/g
        - Gold 14k: ₹${liveRates.india.gold['14k']}/g
        - Gold 9k: ₹${liveRates.india.gold['9k']}/g
        - Silver 99.99: ₹${liveRates.india.silver['99.99']}/g
        - Silver 92.5: ₹${liveRates.india.silver['92.5']}/g
        Live Metal Spot Prices (Global Market):
        - Gold 24k: $${liveRates.global.gold['24k']}/g
        - Gold 18k: $${liveRates.global.gold['18k']}/g
        - Silver 99.99: $${liveRates.global.silver['99.99']}/g
      `;
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Analyze this business data and provide a high-level executive summary for a luxury jewelry brand. 
        Focus on inventory health, customer loyalty, and growth opportunities. 
        Analyze the category performance to suggest production adjustments (which categories to prioritize or scale back) based on market demand.
        Incorporate the live metal spot rates of the India Market (specifically 24k, 22k, and 18k gold purities and silver prices) and Global Market into your margin optimization recommendations.
        Keep it professional, highly insightful, and formatted for an executive dashboard. Context: ${context}`,
      });
      setIntelligenceReport(response.text || 'Analysis complete.');
    } catch (e) {
      console.error(e);
      setIntelligenceReport('Unable to generate intelligence report at this time.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleGenerateAiPredictiveReport = async (resellerId: string) => {
    const reseller = resellers.find(r => r.id === resellerId) || resellers[0];
    if (!reseller) return;
    
    setIsGeneratingAiPredictive(true);
    setAiPredictiveReport(null);
    try {
      const ai = new GoogleGenAI({ apiKey: getApiKey() });
      const prompt = `Analyze luxury jewelry demand and market trends for our esteemed B2B Partner: "${reseller.name}" located in "${reseller.location}". 
      This store type is classified as "${reseller.type}". 
      In elegant, concise, and professional bullet points, draft a highly localized luxury stocking strategy recommending:
      1. What style categories to target (e.g. bold solitaire rings, minimal drop earrings, statement necklaces)
      2. The optimal metal purities (e.g., 18k Rose Gold, Platinum 950)
      3. Suggested price ranges suited for their locale
      4. A specific high-margin production item recommendation.
      Format the output with clear markdown bullets. Keep it executive-friendly, exclusive, and under 200 words.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt
      });
      
      setAiPredictiveReport(response.text || 'Analysis completed.');
    } catch (e) {
      console.error(e);
      setAiPredictiveReport('Unable to compile AI analysis at this time. Please ensure your Gemini API key is configured in the settings.');
    } finally {
      setIsGeneratingAiPredictive(false);
    }
  };

  const publishToSocial = (productId: string, platform: 'Pinterest' | 'Instagram' | 'Facebook', initialImages?: string[]) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setPublishingProduct(product);
      setPublishingPlatform(platform);
      setPublishingImages(initialImages && initialImages.length > 0 ? initialImages : (product.images.length > 0 ? [product.images[0]] : []));
    }
  };

  const handleFinalPublish = async (message: string, imagesToPublish?: string[]) => {
    if (!publishingProduct || !publishingPlatform) return;
    
    setIsPublishing(publishingProduct.id);
    // High-fidelity publishing simulation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const txId = `LUM-TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const targetImages = (imagesToPublish && imagesToPublish.length > 0) 
      ? imagesToPublish 
      : (publishingImages.length > 0 ? publishingImages : (publishingProduct.images.length > 0 ? [publishingProduct.images[0]] : []));
    
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      productName: publishingProduct.name,
      platform: publishingPlatform,
      message: message,
      timestamp: new Date().toLocaleString(),
      status: 'Success' as const,
      txId: txId
    };

    setSocialPublishHistory(prev => [newLog, ...prev]);
    setIsPublishing(null);
    setPublishingProduct(null);
    setPublishingPlatform(null);
    setPublishingImages([]);
    setSocialToast({
      show: true,
      platform: publishingPlatform,
      txId: txId,
      count: targetImages.length
    });
  };

  const renderContent = () => {
    if (isMagicMode && selectedProduct) return <MagicStudio initialImage={selectedProduct.images[0]} onBack={() => setIsMagicMode(false)} onSave={(newImg) => {
      setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, images: [newImg, ...p.images.slice(1)] } : p));
      setIsMagicMode(false);
    }} />;
    
    switch (activeTab) {
      case 'prospects':
        return (
          <ProspectsPipeline
            prospects={prospects}
            onAddProspect={handleAddProspect}
            onUpdateProspect={handleUpdateProspect}
            onDeleteProspect={handleDeleteProspect}
            onPlaceAsBespokeOrder={handlePlaceAsBespokeOrder}
            onPlaceAsStandardOrder={handlePlaceAsStandardOrder}
            customers={customers}
            craftsmenList={MOCK_CRAFTSMEN.map(c => ({ id: c.id, name: c.name }))}
            onNavigateToTab={(tab) => {
              setActiveTab(tab as any);
              setIsMagicMode(false);
              setIsDetailMode(false);
            }}
          />
        );

      case 'ai_concierge':
        return (
          <AiVoiceConcierge
            customers={customers}
            products={products}
            ledger={ledger}
            bespokeOrders={bespokeOrders}
            repairJobs={repairJobs}
            metalRates={metalRates}
            marketView={marketView}
            activeLocation="Mumbai Flagship"
            onRecordPayment={handleAiRecordPayment}
            onAddCustomer={handleAiAddCustomer}
            onAdjustStock={handleAiAdjustStock}
            onAddProduct={handleAiAddProduct}
            onCreateBespokeOrder={handleAiCreateBespokeOrder}
            onUpdateMetalRates={handleAiUpdateMetalRates}
            onLogRepair={handleAiLogRepair}
            onDeleteProduct={handleAiDeleteProduct}
            onDeleteCustomer={handleAiDeleteCustomer}
            onDeleteOrder={handleAiDeleteOrder}
            onUpdateProduct={(data) => handleAiUpdateProduct(data.idOrSku, data.updates)}
            onUpdateCustomer={(data) => handleAiUpdateCustomer(data.idOrName, data.updates)}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setIsMagicMode(false);
              setIsDetailMode(false);
            }}
          />
        );
      case 'gallery':
        return (
          <ProductGallery 
            products={products} 
            onEditProduct={(p) => {
              setEditingProduct(p);
              setProductPreviews(p.images);
              setVideoPreview(p.video || null);
              setIsProductModalOpen(true);
            }} 
            onDeleteProduct={(id) => {
              setProducts(prev => prev.filter(p => p.id !== id));
            }}
            onPublishImages={(images, product, platform) => {
              const targetProduct = product || products.find(p => p.images.some(img => images.includes(img))) || products[0];
              setPublishingProduct(targetProduct);
              setPublishingImages(images);
              setPublishingPlatform(platform || 'Instagram');
            }}
            onUseInStudio={(image) => {
              const matched = products.find(p => p.images.includes(image));
              if (matched) {
                setSelectedProduct(matched);
                setIsMagicMode(true);
              } else {
                setActiveTab('studio');
              }
            }}
            onTrackPayments={(product) => {
              setSelectedPaymentProductId(product.id);
              setActiveTab('payments');
            }}
            onAddProduct={() => {
              setEditingProduct(null);
              setProductPreviews([]);
              setVideoPreview(null);
              setIsProductModalOpen(true);
            }}
          />
        );
      case 'payments':
        return (
          <PaymentsView
            products={products}
            customers={customers}
            onSyncLedger={(entry) => {
              setLedger(prev => [entry, ...prev]);
              syncEntity('ledger', entry);
            }}
            preselectedProductId={selectedPaymentProductId || undefined}
            onNavigateToProduct={(pId) => {
              const found = products.find(p => p.id === pId);
              if (found) {
                setEditingProduct(found);
                setProductPreviews(found.images);
                setVideoPreview(found.video || null);
                setIsProductModalOpen(true);
              }
            }}
          />
        );
      case 'marketing':
        return <MarketingPlanner products={products} />;
      case 'calculator':
        return <PricingCalculator market={marketView} currentRates={metalRates} />;
      case 'dashboard':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Smart Insights Banner */}
            <div className="bg-lumora-charcoal text-white p-10 rounded-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                <Sparkles size={120} />
              </div>
              <div className="relative z-10 space-y-6 max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-lumora-gold rounded-full flex items-center justify-center">
                    <Zap size={16} className="text-white" />
                  </div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.4em]">Intelligence Briefing</h3>
                </div>
                <h2 className="text-3xl font-serif font-bold leading-tight">
                  Inventory value has increased by <span className="text-lumora-gold">12.4%</span> this quarter. 
                  High demand detected for <span className="italic">Bespoke Emeralds</span>.
                </h2>
                <div className="flex gap-6 pt-4">
                  <button onClick={() => setActiveTab('analytics')} className="text-[10px] font-bold uppercase tracking-widest border-b border-lumora-gold pb-1 hover:text-lumora-gold transition-colors">View Full Report</button>
                  <button onClick={() => setActiveTab('inventory')} className="text-[10px] font-bold uppercase tracking-widest border-b border-white/20 pb-1 hover:border-white transition-colors">Optimize Stock</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                label="Total Inventory" 
                value={`$${(products.reduce((acc, p) => acc + (p.price * p.stock), 0)).toLocaleString()}`} 
                trend="+2.4%" 
                icon={<Gem />} 
                onClick={() => setDrillDownType('inventory')}
              />
              <StatCard 
                label="Sold This Month" 
                value="142 Pieces" 
                trend="+12%" 
                icon={<Layers />} 
                onClick={() => setDrillDownType('sales')}
              />
              <StatCard 
                label="Monthly Revenue" 
                value="$428,500" 
                trend="+14%" 
                icon={<TrendingUp />} 
                onClick={() => setDrillDownType('revenue')}
              />
              <StatCard 
                label="Active Orders" 
                value={orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length.toString()} 
                icon={<ShoppingCart />} 
                onClick={() => setDrillDownType('orders')}
              />
            </div>

            {/* AI Smart Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white border border-black/[0.03] p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-lumora-gold" />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest">Intelligence Alerts</h4>
                </div>
                <div className="space-y-4">
                  {products.filter(p => p.stock < 5).map(p => (
                    <div key={p.id} className="flex justify-between items-center p-4 bg-red-50/50 border border-red-100 rounded-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-red-100 flex items-center justify-center text-red-600">
                          <Package size={16} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-lumora-charcoal">{p.name}</p>
                          <p className="text-[9px] text-red-600 uppercase font-bold tracking-widest">Critical Stock: {p.stock} remaining</p>
                        </div>
                      </div>
                      <button onClick={() => setActiveTab('inventory')} className="text-[9px] font-bold uppercase tracking-widest text-lumora-charcoal hover:underline">Restock</button>
                    </div>
                  ))}
                  {products.filter(p => p.stock < 5).length === 0 && (
                    <div className="py-8 text-center opacity-30">
                      <CheckCircle2 size={24} className="mx-auto mb-2" />
                      <p className="text-[9px] uppercase font-bold tracking-widest">All inventory levels optimal</p>
                    </div>
                  )}
                </div>
              </div>

              <div 
                onClick={() => setDrillDownType('predictive_demand')}
                className="bg-white border border-black/[0.03] p-8 space-y-6 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <TrendingUp size={18} className="text-lumora-gold" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Predictive Demand</h4>
                  </div>
                  <span className="text-[9px] font-bold text-lumora-gold group-hover:translate-x-1 transition-transform">Explore Report →</span>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-lumora-bone/50 border border-black/5 rounded-sm flex justify-between items-center">
                    <div>
                      <p className="text-[11px] font-bold text-lumora-charcoal">Bridal Season Surge</p>
                      <p className="text-[9px] text-lumora-taupe uppercase font-bold tracking-widest">Expected +25% in Solitaire Rings</p>
                    </div>
                    <div className="text-green-600"><ArrowUpRight size={16} /></div>
                  </div>
                  <div className="p-4 bg-lumora-bone/50 border border-black/5 rounded-sm flex justify-between items-center">
                    <div>
                      <p className="text-[11px] font-bold text-lumora-charcoal">Regional Trend: Singapore</p>
                      <p className="text-[9px] text-lumora-taupe uppercase font-bold tracking-widest">High interest in Rose Gold bands</p>
                    </div>
                    <div className="text-lumora-gold"><Globe size={16} /></div>
                  </div>
                </div>
                <div className="pt-2 text-center border-t border-black/[0.03]">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-lumora-gold group-hover:text-lumora-charcoal transition-colors">
                    Click to Open Production Target Report & Market Predictions
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white border border-black/[0.03] p-10 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-lumora-charcoal">Performance Intelligence</h3>
                    <p className="text-[10px] text-lumora-taupe uppercase tracking-widest font-bold">Revenue stream intelligence</p>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_SALES_TREND}>
                      <defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C5A059" stopOpacity={0.15}/><stop offset="95%" stopColor="#C5A059" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#8E8279'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#8E8279'}} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #f0f0f0', borderRadius: '0px', fontSize: '10px' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#C5A059" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-black/[0.03] p-10 shadow-sm flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-serif font-bold text-lumora-charcoal">Order Status Distribution</h3>
                  <p className="text-[10px] text-lumora-taupe uppercase tracking-widest font-bold">Current production pipeline</p>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={Object.entries(
                        orders.reduce((acc, order) => {
                          acc[order.status] = (acc[order.status] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([status, count]) => ({ status, count }))}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f5" />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="status" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 9, fill: '#8E8279', fontWeight: 'bold'}} 
                        width={100}
                      />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #f0f0f0', borderRadius: '0px', fontSize: '10px' }} 
                      />
                      <Bar dataKey="count" fill="#C5A059" radius={[0, 2, 2, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Drill Down Modal */}
            {drillDownType && (() => {
              const sortedBestSellers = [...products].map(p => {
                const stat = PRODUCT_STATS_INFO[p.id] || { salesCount: 0, margin: 0.5 };
                return { ...p, salesCount: stat.salesCount, revenue: p.price * stat.salesCount };
              }).sort((a, b) => b.salesCount - a.salesCount);

              const sortedMostProfitable = [...products].map(p => {
                const stat = PRODUCT_STATS_INFO[p.id] || { salesCount: 0, margin: 0.5 };
                const profitPerPiece = p.price * stat.margin;
                return {
                  ...p,
                  marginPercent: Math.round(stat.margin * 100),
                  profitPerPiece,
                  totalProfit: profitPerPiece * stat.salesCount,
                  salesCount: stat.salesCount
                };
              }).sort((a, b) => b.totalProfit - a.totalProfit);

              const lowStockItems = products.filter(p => p.stock <= 3);
              const highStockItems = products.filter(p => p.stock >= 8);

              return (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
                  <div className="bg-white w-full max-w-4xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                    <div className="p-8 bg-lumora-bone border-b border-black/5 flex justify-between items-center">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-lumora-charcoal">
                          {drillDownType === 'inventory' && 'Inventory Valuation Details'}
                          {drillDownType === 'sales' && 'Business Performance & Best Sellers'}
                          {drillDownType === 'revenue' && 'Business Performance & Best Sellers'}
                          {drillDownType === 'orders' && 'Active Orders Tracking'}
                          {drillDownType === 'predictive_demand' && 'Targeted Production & Demand Predictions'}
                        </h3>
                        <p className="text-[10px] text-lumora-taupe uppercase tracking-widest font-bold">Detailed Intelligence Report</p>
                      </div>
                      <button onClick={() => setDrillDownType(null)} className="text-lumora-taupe hover:text-black transition-colors">
                        <ChevronRight size={24} />
                      </button>
                    </div>
                    <div className="p-8 overflow-y-auto">
                      {drillDownType === 'inventory' && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="p-4 bg-lumora-bone/50 border border-black/5">
                              <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Total Items</p>
                              <p className="text-xl font-serif font-bold">{products.length}</p>
                            </div>
                            <div className="p-4 bg-lumora-bone/50 border border-black/5">
                              <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Stock Units</p>
                              <p className="text-xl font-serif font-bold">{products.reduce((acc, p) => acc + p.stock, 0)}</p>
                            </div>
                            <div className="p-4 bg-lumora-bone/50 border border-black/5">
                              <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Avg. Item Value</p>
                              <p className="text-xl font-serif font-bold">${Math.round(products.reduce((acc, p) => acc + p.price, 0) / products.length).toLocaleString()}</p>
                            </div>
                          </div>
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-black/5">
                                <th className="py-4 text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Product</th>
                                <th className="py-4 text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Stock</th>
                                <th className="py-4 text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Unit Price</th>
                                <th className="py-4 text-[9px] uppercase font-bold tracking-widest text-lumora-taupe text-right">Total Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {products.sort((a, b) => (b.price * b.stock) - (a.price * a.stock)).slice(0, 10).map(p => (
                                <tr key={p.id} className="border-b border-black/[0.02]">
                                  <td className="py-4 text-[11px] font-bold">{p.name}</td>
                                  <td className="py-4 text-[11px]">{p.stock}</td>
                                  <td className="py-4 text-[11px]">${p.price.toLocaleString()}</td>
                                  <td className="py-4 text-[11px] font-bold text-right">${(p.price * p.stock).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {drillDownType === 'orders' && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-3 gap-4 mb-8">
                            {['Pending', 'In Production', 'Ready'].map(status => (
                              <div key={status} className="p-4 bg-lumora-bone/50 border border-black/5">
                                <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">{status}</p>
                                <p className="text-xl font-serif font-bold">{orders.filter(o => o.status === status).length}</p>
                              </div>
                            ))}
                          </div>
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-black/5">
                                <th className="py-4 text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Order ID</th>
                                <th className="py-4 text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Customer</th>
                                <th className="py-4 text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Status</th>
                                <th className="py-4 text-[9px] uppercase font-bold tracking-widest text-lumora-taupe text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').map(o => (
                                <tr key={o.id} className="border-b border-black/[0.02]">
                                  <td className="py-4 text-[11px] font-bold">{o.id}</td>
                                  <td className="py-4 text-[11px]">{o.customer}</td>
                                  <td className="py-4">
                                    <span className={`text-[8px] uppercase font-bold tracking-widest px-2 py-1 rounded-full ${
                                      o.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                                      o.status === 'In Production' ? 'bg-blue-50 text-blue-600' :
                                      'bg-green-50 text-green-600'
                                    }`}>
                                      {o.status}
                                    </span>
                                  </td>
                                  <td className="py-4 text-[11px] font-bold text-right">${o.total.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {(drillDownType === 'sales' || drillDownType === 'revenue') && (
                        <div className="space-y-8">
                          {/* Strategic Summary Row */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-5 bg-lumora-bone/40 border border-black/5 rounded-sm">
                              <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Highest Revenue This Year</p>
                              <p className="text-xl font-serif font-bold text-lumora-charcoal mt-1">
                                $340,000 <span className="text-[10px] font-sans font-medium text-lumora-gold">(June)</span>
                              </p>
                              <p className="text-[8px] text-lumora-taupe uppercase tracking-wider mt-1">Year-To-Date: $1,500,000</p>
                            </div>
                            <div className="p-5 bg-lumora-bone/40 border border-black/5 rounded-sm">
                              <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Most Selling Piece</p>
                              <p className="text-sm font-serif font-bold text-lumora-charcoal mt-1 line-clamp-1">{sortedBestSellers[0]?.name || 'N/A'}</p>
                              <p className="text-[8px] font-bold text-lumora-gold uppercase tracking-wider mt-1">{sortedBestSellers[0]?.salesCount || 0} units sold</p>
                            </div>
                            <div className="p-5 bg-lumora-bone/40 border border-black/5 rounded-sm">
                              <p className="text-[8px] uppercase font-bold tracking-widest text-lumora-taupe">Most Profitable Piece</p>
                              <p className="text-sm font-serif font-bold text-lumora-charcoal mt-1 line-clamp-1">{sortedMostProfitable[0]?.name || 'N/A'}</p>
                              <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider mt-1">+${Math.round(sortedMostProfitable[0]?.totalProfit || 0).toLocaleString()} net profit</p>
                            </div>
                          </div>

                          {/* Inner Tabs Navigation */}
                          <div className="flex border-b border-black/5">
                            <button 
                              onClick={() => setModalTab('bestsellers')} 
                              className={`px-5 py-3 text-[10px] uppercase tracking-wider font-bold border-b-2 transition-all ${modalTab === 'bestsellers' ? 'border-lumora-gold text-lumora-gold' : 'border-transparent text-lumora-taupe hover:text-lumora-charcoal'}`}
                            >
                              Most Selling Pieces
                            </button>
                            <button 
                              onClick={() => setModalTab('profitability')} 
                              className={`px-5 py-3 text-[10px] uppercase tracking-wider font-bold border-b-2 transition-all ${modalTab === 'profitability' ? 'border-lumora-gold text-lumora-gold' : 'border-transparent text-lumora-taupe hover:text-lumora-charcoal'}`}
                            >
                              Most Profitable Pieces
                            </button>
                            <button 
                              onClick={() => setModalTab('stock')} 
                              className={`px-5 py-3 text-[10px] uppercase tracking-wider font-bold border-b-2 transition-all ${modalTab === 'stock' ? 'border-lumora-gold text-lumora-gold' : 'border-transparent text-lumora-taupe hover:text-lumora-charcoal'}`}
                            >
                              Stock Levels (High/Low)
                            </button>
                            <button 
                              onClick={() => setModalTab('revenue')} 
                              className={`px-5 py-3 text-[10px] uppercase tracking-wider font-bold border-b-2 transition-all ${modalTab === 'revenue' ? 'border-lumora-gold text-lumora-gold' : 'border-transparent text-lumora-taupe hover:text-lumora-charcoal'}`}
                            >
                              Yearly Monthly Ledger
                            </button>
                          </div>

                          {/* Tab Contents */}
                          {modalTab === 'bestsellers' && (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h4 className="text-xs font-serif font-bold text-lumora-charcoal uppercase tracking-wider">Most Selling Jewelry Pieces</h4>
                                <span className="text-[9px] text-lumora-taupe uppercase font-bold tracking-widest">Ranked by volume</span>
                              </div>
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-black/5 text-lumora-taupe">
                                    <th className="py-3 text-[9px] uppercase font-bold tracking-widest">Piece</th>
                                    <th className="py-3 text-[9px] uppercase font-bold tracking-widest">SKU</th>
                                    <th className="py-3 text-[9px] uppercase font-bold tracking-widest">Unit Price</th>
                                    <th className="py-3 text-[9px] uppercase font-bold tracking-widest">Units Sold</th>
                                    <th className="py-3 text-[9px] uppercase font-bold tracking-widest text-right">Cumulative Revenue</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sortedBestSellers.map((p, index) => (
                                    <tr key={p.id} className="border-b border-black/[0.02] hover:bg-lumora-bone/20">
                                      <td className="py-3 flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-lumora-gold font-mono">#0{index + 1}</span>
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-black/5 flex-shrink-0">
                                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        </div>
                                        <span className="text-[11px] font-bold text-lumora-charcoal">{p.name}</span>
                                      </td>
                                      <td className="py-3 text-[10px] font-mono text-lumora-taupe">{p.sku}</td>
                                      <td className="py-3 text-[11px]">${p.price.toLocaleString()}</td>
                                      <td className="py-3 text-[11px] font-bold">{p.salesCount} units</td>
                                      <td className="py-3 text-[11px] font-bold text-right text-lumora-charcoal">${p.revenue.toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {modalTab === 'profitability' && (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h4 className="text-xs font-serif font-bold text-lumora-charcoal uppercase tracking-wider">Most Profitable Pieces</h4>
                                <span className="text-[9px] text-lumora-taupe uppercase font-bold tracking-widest">Ranked by Cumulative Net Profit</span>
                              </div>
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-black/5 text-lumora-taupe">
                                    <th className="py-3 text-[9px] uppercase font-bold tracking-widest">Piece</th>
                                    <th className="py-3 text-[9px] uppercase font-bold tracking-widest">Retail Price</th>
                                    <th className="py-3 text-[9px] uppercase font-bold tracking-widest">Est. Profit Margin</th>
                                    <th className="py-3 text-[9px] uppercase font-bold tracking-widest">Net Profit/Unit</th>
                                    <th className="py-3 text-[9px] uppercase font-bold tracking-widest text-right">Cumulative Net Profit</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sortedMostProfitable.map((p, index) => (
                                    <tr key={p.id} className="border-b border-black/[0.02] hover:bg-lumora-bone/20">
                                      <td className="py-3 flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-emerald-600 font-mono">#0{index + 1}</span>
                                        <span className="text-[11px] font-bold text-lumora-charcoal">{p.name}</span>
                                      </td>
                                      <td className="py-3 text-[11px]">${p.price.toLocaleString()}</td>
                                      <td className="py-3 text-[11px]">
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{p.marginPercent}%</span>
                                      </td>
                                      <td className="py-3 text-[11px] text-emerald-600 font-medium">${Math.round(p.profitPerPiece).toLocaleString()}</td>
                                      <td className="py-3 text-[11px] font-bold text-right text-lumora-charcoal">${Math.round(p.totalProfit).toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {modalTab === 'stock' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {/* Low Stock Side */}
                              <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-black/5 pb-2">
                                  <h4 className="text-xs font-serif font-bold text-red-600 uppercase tracking-wider">Low Stock items</h4>
                                  <span className="text-[8px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Reorder / Alert</span>
                                </div>
                                <div className="space-y-3">
                                  {lowStockItems.map(p => (
                                    <div key={p.id} className="p-4 bg-red-50/30 border border-red-100 rounded-sm flex justify-between items-center">
                                      <div>
                                        <p className="text-[11px] font-bold text-lumora-charcoal">{p.name}</p>
                                        <p className="text-[9px] text-red-600 font-bold uppercase mt-0.5">Stock Level: {p.stock} remaining</p>
                                      </div>
                                      <button onClick={() => { setActiveTab('inventory'); setDrillDownType(null); }} className="text-[9px] font-bold uppercase tracking-wider bg-white border border-red-200 px-3 py-1.5 hover:bg-red-50 text-red-600">Restock</button>
                                    </div>
                                  ))}
                                  {lowStockItems.length === 0 && (
                                    <p className="text-xs text-lumora-taupe italic">No items are currently below low stock thresholds.</p>
                                  )}
                                </div>
                              </div>

                              {/* High Stock Side */}
                              <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-black/5 pb-2">
                                  <h4 className="text-xs font-serif font-bold text-emerald-600 uppercase tracking-wider">Optimal / High Stock Items</h4>
                                  <span className="text-[8px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Optimal</span>
                                </div>
                                <div className="space-y-3">
                                  {highStockItems.map(p => (
                                    <div key={p.id} className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-sm flex justify-between items-center">
                                      <div>
                                        <p className="text-[11px] font-bold text-lumora-charcoal">{p.name}</p>
                                        <p className="text-[9px] text-emerald-600 font-bold uppercase mt-0.5">Stock Level: {p.stock} units available</p>
                                      </div>
                                      <button onClick={() => { setActiveTab('resellers'); setDrillDownType(null); }} className="text-[9px] font-bold uppercase tracking-wider bg-white border border-emerald-200 px-3 py-1.5 hover:bg-emerald-50 text-emerald-600">Allocate B2B</button>
                                    </div>
                                  ))}
                                  {highStockItems.length === 0 && (
                                    <p className="text-xs text-lumora-taupe italic">No items are currently over ideal stocking thresholds.</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {modalTab === 'revenue' && (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h4 className="text-xs font-serif font-bold text-lumora-charcoal uppercase tracking-wider">Monthly Revenue Stream (Current Fiscal Year)</h4>
                                <span className="text-[9px] text-lumora-taupe uppercase font-bold tracking-widest">Active Ledger Summary</span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {MOCK_SALES_TREND.map(s => {
                                  const isHighest = s.revenue === 340000;
                                  return (
                                    <div key={s.month} className={`p-5 rounded-sm border transition-all ${isHighest ? 'bg-lumora-charcoal text-white border-lumora-gold shadow-lg scale-102' : 'bg-lumora-bone/40 border-black/5'}`}>
                                      <div className="flex justify-between items-start">
                                        <span className="text-xs font-serif font-bold">{s.month} 2026</span>
                                        {isHighest && (
                                          <span className="bg-lumora-gold text-lumora-charcoal text-[7px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full">Highest Revenue</span>
                                        )}
                                      </div>
                                      <p className={`text-2xl font-serif font-bold mt-2 ${isHighest ? 'text-lumora-gold' : 'text-lumora-charcoal'}`}>
                                        ${s.revenue.toLocaleString()}
                                      </p>
                                      <p className="text-[8px] opacity-70 uppercase tracking-widest mt-1">Multi-channel sales</p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {drillDownType === 'predictive_demand' && (
                        <div className="space-y-8">
                          {/* Top Overview and Spot Rates */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <TrendingUp size={16} className="text-lumora-gold" />
                                <h4 className="text-sm font-serif font-bold text-lumora-charcoal uppercase tracking-wider">Predictive Demand Alignment</h4>
                              </div>
                              <p className="text-[11px] leading-relaxed text-lumora-taupe">
                                In jewelry production management, capital efficiency is driven by target resource optimization. By modeling sales metrics, channel velocities, and material pricing, our predictive algorithm advises adjusting casting and stone allocation.
                              </p>
                              <div className="p-4 bg-amber-50/20 border border-amber-200/30 rounded-sm">
                                <p className="text-[10px] font-bold text-lumora-charcoal uppercase tracking-wider">Strategic Business Recommendation:</p>
                                <p className="text-[11px] leading-relaxed text-lumora-taupe mt-1">
                                  Target future production towards 18k and Platinum solitaire items to meet the expected <strong className="text-lumora-gold">25% surge in upcoming bridal demand</strong>, specifically prioritizing 18k Rose Gold chevron bands which are trending strongly in active Singapore and Paris reseller markets.
                                </p>
                              </div>
                            </div>

                            <div className="bg-lumora-bone/50 p-6 border border-black/5 rounded-sm space-y-4">
                              <span className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Spot Rate & Hedging Dashboard</span>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white border border-black/5">
                                  <p className="text-[8px] uppercase font-bold text-lumora-taupe">Gold (24K)</p>
                                  <p className="text-lg font-serif font-bold text-lumora-charcoal">$78.50 / g</p>
                                  <p className="text-[7px] text-green-600 font-bold uppercase mt-0.5">Bullish (+1.8%)</p>
                                </div>
                                <div className="p-3 bg-white border border-black/5">
                                  <p className="text-[8px] uppercase font-bold text-lumora-taupe">Platinum 950</p>
                                  <p className="text-lg font-serif font-bold text-lumora-charcoal">$36.12 / g</p>
                                  <p className="text-[7px] text-red-500 font-bold uppercase mt-0.5">Stable (-0.4%)</p>
                                </div>
                              </div>
                              <div className="p-3 bg-white border border-black/5">
                                <p className="text-[8px] uppercase font-bold text-lumora-taupe">Production Hedging Advice</p>
                                <p className="text-[10px] text-lumora-taupe leading-relaxed">
                                  Platinum prices are highly favorable. Pre-cast high-ticket solitaire components in Platinum 950 to secure lower raw material costs while keeping margin heights.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Targeted Production Matrix */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-serif font-bold text-lumora-charcoal uppercase tracking-wider border-b border-black/5 pb-2">Targeted Production Matrix</h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="p-4 bg-white border border-black/5 rounded-sm space-y-2">
                                <span className="bg-emerald-50 text-emerald-700 text-[8px] uppercase font-bold px-2 py-0.5 rounded-full">Rings: Scale Up (+35%)</span>
                                <p className="text-xs font-bold text-lumora-charcoal">High Velocity Category</p>
                                <p className="text-[10px] text-lumora-taupe leading-relaxed">
                                  Rings constitute 48% of B2B boutique purchases. Target production: Aura Diamond Bands and classic Solitaire rings.
                                </p>
                              </div>
                              <div className="p-4 bg-white border border-black/5 rounded-sm space-y-2">
                                <span className="bg-emerald-50 text-emerald-700 text-[8px] uppercase font-bold px-2 py-0.5 rounded-full">Earrings: Expand (+20%)</span>
                                <p className="text-xs font-bold text-lumora-charcoal">Steady Turnover Category</p>
                                <p className="text-[10px] text-lumora-taupe leading-relaxed">
                                  Strong seasonal performance. Focus gold grain castings on 18k Rose and Yellow Gold drop earrings.
                                </p>
                              </div>
                              <div className="p-4 bg-white border border-black/5 rounded-sm space-y-2">
                                <span className="bg-amber-50 text-amber-700 text-[8px] uppercase font-bold px-2 py-0.5 rounded-full">Necklaces: Bespoke Only</span>
                                <p className="text-xs font-bold text-lumora-charcoal">Low Velocity / High Capital</p>
                                <p className="text-[10px] text-lumora-taupe leading-relaxed">
                                  High ticket size locked up too much gold. Recommended: Only target production for custom private-agent orders.
                                </p>
                              </div>
                              <div className="p-4 bg-white border border-black/5 rounded-sm space-y-2">
                                <span className="bg-black/5 text-lumora-taupe text-[8px] uppercase font-bold px-2 py-0.5 rounded-full">Bracelets: Maintain</span>
                                <p className="text-xs font-bold text-lumora-charcoal">Niche Premium Segment</p>
                                <p className="text-[10px] text-lumora-taupe leading-relaxed">
                                  Emerald Serenade shows slow turn rate. Limit material lockups; manufacture on backorder requests.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Interactive Partner Demand AI Advisor */}
                          <div className="p-6 bg-lumora-bone border border-black/5 rounded-sm space-y-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="text-xs font-serif font-bold text-lumora-charcoal uppercase tracking-wider">Partner Demand & localization AI advisor</h4>
                                <p className="text-[10px] text-lumora-taupe">Select a B2B partner to model localized production guidelines via Gemini AI</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <select 
                                  value={predictiveLocationId} 
                                  onChange={(e) => setPredictiveLocationId(e.target.value)}
                                  className="text-[11px] bg-white border border-black/10 px-4 py-2 uppercase font-bold tracking-wider rounded-none"
                                >
                                  {resellers.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} ({r.location})</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleGenerateAiPredictiveReport(predictiveLocationId)}
                                  disabled={isGeneratingAiPredictive}
                                  className="bg-lumora-charcoal text-white px-5 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-lumora-gold transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                  {isGeneratingAiPredictive ? (
                                    <>
                                      <Loader2 size={12} className="animate-spin" />
                                      Analyzing...
                                    </>
                                  ) : (
                                    'Analyze Demand'
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Gemini Output Window */}
                            {aiPredictiveReport ? (
                              <div className="p-6 bg-amber-50/20 border border-amber-200/40 rounded-sm animate-in fade-in duration-300">
                                <div className="flex items-center gap-2 mb-3 text-lumora-gold text-[10px] font-bold uppercase tracking-widest border-b border-black/5 pb-1">
                                  <Sparkles size={12} />
                                  <span>Gemini Localization Recommendations</span>
                                </div>
                                <div className="text-[11px] leading-relaxed text-lumora-taupe space-y-2 whitespace-pre-wrap">
                                  {aiPredictiveReport}
                                </div>
                              </div>
                            ) : (
                              <div className="py-6 text-center border border-dashed border-black/5 text-lumora-taupe text-[10px] italic">
                                Select a reseller boutique above and click "Analyze Demand" to request localized stock advice.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-6 bg-lumora-bone border-t border-black/5 text-right">
                      <button 
                        onClick={() => setDrillDownType(null)}
                        className="bg-lumora-charcoal text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-lumora-gold transition-all"
                      >
                        Close Report
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      case 'inventory':
        return (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h3 className="text-xl font-serif font-bold">Master Collection & Tag Scanner</h3>
                <p className="text-[10px] text-lumora-taupe uppercase tracking-widest font-bold">Curating the world's finest jewelry · Instant QR Tag & Ledger Verification</p>
                
                {/* Inventory Mode Switcher */}
                <div className="flex items-center gap-1 bg-lumora-bone p-1 border border-black/5 mt-3 w-fit">
                  <button
                    onClick={() => {
                      setInventoryViewMode('gallery');
                      setScannerTargetProductId(null);
                    }}
                    className={`px-4 py-1.5 text-[9px] uppercase font-bold tracking-widest transition-all flex items-center gap-2 ${
                      inventoryViewMode === 'gallery'
                        ? 'bg-lumora-charcoal text-white shadow-sm'
                        : 'text-lumora-taupe hover:text-lumora-charcoal'
                    }`}
                  >
                    <Grid size={12} /> Showcase Gallery ({products.length})
                  </button>
                  <button
                    onClick={() => setInventoryViewMode('scanner')}
                    className={`px-4 py-1.5 text-[9px] uppercase font-bold tracking-widest transition-all flex items-center gap-2 ${
                      inventoryViewMode === 'scanner'
                        ? 'bg-lumora-gold text-white shadow-sm'
                        : 'text-lumora-taupe hover:text-lumora-gold'
                    }`}
                  >
                    <Scan size={12} /> QR Tag Scanner & Ledger Hub
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <button 
                  onClick={() => {
                    setScannerTargetProductId(null);
                    setIsTagScannerModalOpen(true);
                  }}
                  className="bg-lumora-charcoal text-white hover:bg-lumora-gold px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 active:scale-95 shadow-sm border border-lumora-gold/30"
                  title="Launch quick camera QR code scanner"
                >
                  <Scan size={14} className="text-lumora-gold" /> Scan Jewelry Tag
                </button>
                <button 
                  onClick={() => {
                    setEditingProduct(null);
                    setProductPreviews([]);
                    setVideoPreview(null);
                    setIsProductModalOpen(true);
                  }}
                  className="bg-lumora-gold text-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-lumora-gold/90 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
                  title="Add new luxury jewelry piece to inventory"
                >
                  <Plus size={14} /> Add Product
                </button>
                <input 
                  type="file" 
                  ref={productFileInputRef} 
                  onChange={handleProductCSVUpload} 
                  accept=".csv, .xlsx, .xls" 
                  className="hidden" 
                />
                <button 
                  onClick={downloadProductTemplate}
                  className="bg-white text-lumora-gold border border-lumora-gold/20 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-lumora-gold hover:text-white transition-all flex items-center gap-2 active:scale-95"
                  title="Download CSV bulk upload template"
                >
                  <Download size={14} /> Template
                </button>
                <button 
                  onClick={() => productFileInputRef.current?.click()}
                  className="bg-lumora-bone text-lumora-charcoal border border-black/10 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black/5 transition-all flex items-center gap-2 active:scale-95"
                  title="Upload CSV to bulk import products"
                >
                  <Upload size={14} /> Import CSV
                </button>
              </div>
            </div>

            {inventoryViewMode === 'scanner' ? (
              <JewelryTagScanner
                products={products}
                ledger={ledger}
                auditLogs={auditLogs}
                metalRates={metalRates}
                marketView={marketView}
                initialProductId={scannerTargetProductId || undefined}
                onUpdateProduct={(updated) => {
                  setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
                  syncEntity('products', updated);
                }}
                onAddLedgerEntry={(entry) => {
                  setLedger(prev => [entry, ...prev]);
                  syncEntity('ledger', entry);
                }}
                onAddAuditLog={(log) => {
                  setAuditLogs(prev => [log, ...prev]);
                  syncEntity('audit_logs', log);
                }}
                onOpenProductModal={(product) => {
                  setEditingProduct(product);
                  setProductPreviews(product.images);
                  setVideoPreview(product.video || null);
                  setIsProductModalOpen(true);
                }}
              />
            ) : (
              <ProductGallery 
                products={products.filter(p => 
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.category.toLowerCase().includes(searchQuery.toLowerCase())
                )} 
                onEditProduct={(p) => {
                  setEditingProduct(p);
                  setProductPreviews(p.images);
                  setVideoPreview(p.video || null);
                  setIsProductModalOpen(true);
                }} 
                onDeleteProduct={(id) => {
                  setProducts(prev => prev.filter(p => p.id !== id));
                }}
                onScanTag={(productId) => {
                  setScannerTargetProductId(productId || null);
                  setInventoryViewMode('scanner');
                }}
                onPublishImages={(images, product, platform) => {
                  const targetProduct = product || products.find(p => p.images.some(img => images.includes(img))) || products[0];
                  setPublishingProduct(targetProduct);
                  setPublishingImages(images);
                  setPublishingPlatform(platform || 'Instagram');
                }}
                onUseInStudio={(image) => {
                  const matched = products.find(p => p.images.includes(image));
                  if (matched) {
                    setSelectedProduct(matched);
                    setIsMagicMode(true);
                  } else {
                    setActiveTab('studio');
                  }
                }}
                onTrackPayments={(product) => {
                  setSelectedPaymentProductId(product.id);
                  setActiveTab('payments');
                }}
                onAddProduct={() => {
                  setEditingProduct(null);
                  setProductPreviews([]);
                  setVideoPreview(null);
                  setIsProductModalOpen(true);
                }}
              />
            )}
          </div>
        );
      case 'production':
        return (
          <ProductionWorkflowView
            jobs={productionJobs}
            craftsmen={MOCK_CRAFTSMEN}
            onUpdateJob={(job) => {
              setProductionJobs(prev => prev.map(j => j.id === job.id ? job : j));
            }}
            orders={orders}
            bespokeOrders={bespokeOrders}
            onInitiateJob={(newJob) => {
              setProductionJobs(prev => [newJob, ...prev]);
            }}
            initiateOrderId={initiateProductionForOrderId}
            onClearInitiateOrderId={() => setInitiateProductionForOrderId(null)}
            highlightedJobId={highlightedProductionJobId}
            onClearHighlightedJobId={() => setHighlightedProductionJobId(null)}
            products={products}
            repairJobs={repairJobs}
            onUpdateRepairJob={(job) => {
              setRepairJobs(prev => prev.map(j => j.id === job.id ? job : j));
            }}
            onAddRepairJob={(job) => {
              setRepairJobs(prev => [job, ...prev]);
            }}
            onDeleteRepairJob={(id) => {
              setRepairJobs(prev => prev.filter(j => j.id !== id));
            }}
            onOpenJobCard={(order) => {
              setSelectedBespoke(order);
              setIsJobCardOpen(true);
            }}
          />
        );
      case 'studio':
        return <CreativeStudioView />;
      case 'settings':
        return (
          <SettingsView
            isAccountConnected={isAccountConnected}
            setIsAccountConnected={setIsAccountConnected}
            accountLinks={accountLinks}
            setAccountLinks={setAccountLinks}
            socialCredentials={socialCredentials}
            setSocialCredentials={setSocialCredentials}
            socialPublishHistory={socialPublishHistory}
            onConnect={(platform) => handleConnect(platform as any)}
            brandConfig={brandConfig}
            setBrandConfig={setBrandConfig}
          />
        );
      case 'analytics':
        return <MarketAnalysisView market={marketView} />;
      default:
        return (
          <div className="py-20 text-center opacity-40">
            <Activity size={48} className="mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-lumora-charcoal italic">Section under curation</h3>
            <p className="text-[10px] uppercase font-bold tracking-widest mt-2">Available in the next Atelier release</p>
          </div>
        );
    }
  };

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} strokeWidth={1.5} />, label: 'Dashboard' },
    { id: 'prospects', icon: <Sparkles size={18} strokeWidth={1.5} />, label: 'Enquiries / Prospects' },
    { id: 'ai_concierge', icon: <Mic size={18} strokeWidth={1.5} />, label: 'AI Voice Concierge' },
    { id: 'inventory', icon: <Package size={18} strokeWidth={1.5} />, label: 'Inventory' },
    { id: 'production', icon: <Layers size={18} strokeWidth={1.5} />, label: 'Production' },
    { id: 'payments', icon: <Receipt size={18} strokeWidth={1.5} />, label: 'Payments & Advances' },
    { id: 'studio', icon: <Wand2 size={18} strokeWidth={1.5} />, label: 'AI Studio' },
    { id: 'gallery', icon: <LucideImage size={18} strokeWidth={1.5} />, label: 'Gallery' },
    { id: 'marketing', icon: <Share2 size={18} strokeWidth={1.5} />, label: 'Marketing' },
    { id: 'calculator', icon: <Calculator size={18} strokeWidth={1.5} />, label: 'Pricing Calculator' },
    { id: 'analytics', icon: <Activity size={18} strokeWidth={1.5} />, label: 'Market Intelligence' },
    { id: 'settings', icon: <Zap size={18} strokeWidth={1.5} />, label: 'Settings & Integrations' },
  ];

  return (
    <div className="flex min-h-screen bg-lumora-bone font-sans selection:bg-lumora-gold/20 selection:text-lumora-gold">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-black/[0.04] fixed h-full flex flex-col z-50 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div className="p-8 pb-10 border-b border-black/[0.02]">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <h1 className="text-2xl font-serif font-bold tracking-tighter text-lumora-charcoal flex flex-col group cursor-default">
                LUMORA
                <span className="text-[8px] uppercase tracking-[0.5em] text-lumora-taupe mt-0.5 font-bold group-hover:text-lumora-gold transition-colors duration-500">
                  Fine Jewelry
                </span>
              </h1>
            )}
            {isSidebarCollapsed && (
              <span className="text-xl font-serif font-bold text-lumora-gold mx-auto">L</span>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => { 
                setActiveTab(item.id as any); 
                setIsMagicMode(false); 
                setIsDetailMode(false); 
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-sm transition-all relative group text-left ${activeTab === item.id ? 'text-lumora-gold bg-lumora-bone/80 font-bold' : 'text-lumora-taupe hover:text-lumora-charcoal hover:bg-black/[0.02]'}`}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              {activeTab === item.id && <div className="absolute left-0 top-1 bottom-1 w-1 bg-lumora-gold rounded-r-full" />}
              <div className={`shrink-0 ${activeTab === item.id ? 'text-lumora-gold' : 'group-hover:text-lumora-gold transition-colors'}`}>
                {item.icon}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[10px] uppercase font-bold tracking-[0.15em] truncate">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-black/5 bg-lumora-bone/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-lumora-charcoal flex items-center justify-center text-white font-serif text-sm font-bold shrink-0">
              JV
            </div>
            {!isSidebarCollapsed && (
              <div className="truncate">
                <p className="text-[10px] font-bold text-lumora-charcoal truncate">Julian Vane</p>
                <p className="text-[8px] text-lumora-taupe uppercase tracking-widest truncate">Global Director</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        <header className="sticky top-0 bg-lumora-bone/90 backdrop-blur-md z-40 px-10 py-6 flex justify-between items-center border-b border-black/[0.04]">
          <div className="space-y-0.5">
            <h2 className="text-xl font-serif font-bold text-lumora-charcoal capitalize tracking-tight">
              {isMagicMode ? 'Asset Refinement Studio' : (navItems.find(n => n.id === activeTab)?.label || `${activeTab} Hub`)}
            </h2>
            <p className="text-[9px] text-lumora-taupe uppercase font-bold tracking-[0.25em]">
              Lumora Atelier <ChevronRight size={8} className="inline mx-1 opacity-40" /> {activeTab}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-lumora-taupe group-focus-within:text-lumora-gold transition-colors" size={15} />
              <input 
                type="text" 
                placeholder="Search collection, orders, clients..." 
                className="bg-transparent border-b border-black/10 focus:border-lumora-gold rounded-none py-1.5 pl-6 text-[11px] focus:outline-none w-48 transition-all focus:w-64"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <button 
              onClick={() => setIsFloatingAiOpen(true)}
              className="bg-lumora-charcoal text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-lumora-gold transition-all flex items-center gap-2 active:scale-95 shadow-sm"
            >
              <Sparkles size={13} className="text-lumora-gold" /> AI Assistant
            </button>
          </div>
        </header>

        <div className="p-10">
          {renderContent()}
        </div>
      </main>

      {/* Floating AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isFloatingAiOpen}
        onClose={() => setIsFloatingAiOpen(false)}
        customers={customers}
        products={products}
        ledger={ledger}
        bespokeOrders={bespokeOrders}
        repairJobs={repairJobs}
        metalRates={metalRates}
        marketView={marketView}
        onRecordPayment={handleAiRecordPayment}
        onAddCustomer={handleAiAddCustomer}
        onAdjustStock={handleAiAdjustStock}
        onCreateBespokeOrder={handleAiCreateBespokeOrder}
        onUpdateMetalRates={handleAiUpdateMetalRates}
        onLogRepair={handleAiLogRepair}
      />

      {/* Social Publish Modal */}
      {publishingProduct && publishingPlatform && (
        <SocialPublishModal
          product={publishingProduct}
          platform={publishingPlatform}
          isConnected={!!isAccountConnected[publishingPlatform]}
          onConnect={() => {
            setConnectingPlatform(publishingPlatform);
            setIsSocialConnectModalOpen(true);
          }}
          onClose={() => {
            setPublishingProduct(null);
            setPublishingPlatform(null);
            setPublishingImages([]);
          }}
          onPublish={(msg, imgs) => handleFinalPublish(msg, imgs)}
          isPublishing={isPublishing === publishingProduct.id}
          initialSelectedImages={publishingImages}
          onPlatformChange={(plat) => setPublishingPlatform(plat)}
        />
      )}

      {/* Social Publish Success Toast */}
      {socialToast && socialToast.show && (
        <div className="fixed bottom-8 right-8 z-[200] bg-lumora-charcoal text-white px-6 py-4 rounded-sm shadow-2xl border border-lumora-gold/40 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-300 max-w-md">
          <div className="w-10 h-10 rounded-full bg-lumora-gold/20 flex items-center justify-center text-lumora-gold shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div className="flex-1 pr-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-lumora-gold">
              Broadcast Dispatched to {socialToast.platform}
            </p>
            <p className="text-xs font-serif font-bold text-white mt-0.5">
              {socialToast.count} {socialToast.count === 1 ? 'image' : 'images'} successfully published
            </p>
            <p className="text-[9px] font-mono text-white/50 mt-0.5">API TX: {socialToast.txId}</p>
          </div>
          <button 
            type="button"
            onClick={() => setSocialToast(null)}
            className="text-white/40 hover:text-white transition-colors p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Social Connect Modal */}
      {isSocialConnectModalOpen && connectingPlatform && (
        <SocialConnectModal
          platform={connectingPlatform}
          onClose={() => {
            setIsSocialConnectModalOpen(false);
            setConnectingPlatform(null);
          }}
          onConnect={(token, accId) => {
            setSocialCredentials(prev => ({
              ...prev,
              [connectingPlatform]: { token, accountId: accId }
            }));
            setIsAccountConnected(prev => ({
              ...prev,
              [connectingPlatform]: true
            }));
            setIsSocialConnectModalOpen(false);
            setConnectingPlatform(null);
          }}
        />
      )}

      {/* Bespoke Confirmation Modal */}
      {isConfirmationOpen && selectedBespoke && (
        <OrderConfirmationModal
          order={selectedBespoke}
          onClose={() => {
            setIsConfirmationOpen(false);
            setSelectedBespoke(null);
          }}
        />
      )}

      {/* Job Card Modal */}
      {isJobCardOpen && selectedBespoke && (
        <JobCardModal
          order={selectedBespoke}
          onClose={() => {
            setIsJobCardOpen(false);
            setSelectedBespoke(null);
          }}
        />
      )}

      {/* Jewelry Tag QR Scanner Modal */}
      {isTagScannerModalOpen && (
        <JewelryTagScanner
          isModal={true}
          initialProductId={scannerTargetProductId || undefined}
          products={products}
          ledger={ledger}
          auditLogs={auditLogs}
          metalRates={metalRates}
          marketView={marketView}
          onClose={() => {
            setIsTagScannerModalOpen(false);
            setScannerTargetProductId(null);
          }}
          onUpdateProduct={(updated) => {
            setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
            syncEntity('products', updated);
          }}
          onAddLedgerEntry={(entry) => {
            setLedger(prev => [entry, ...prev]);
            syncEntity('ledger', entry);
          }}
          onAddAuditLog={(log) => {
            setAuditLogs(prev => [log, ...prev]);
            syncEntity('audit_logs', log);
          }}
          onOpenProductModal={(product) => {
            setIsTagScannerModalOpen(false);
            setEditingProduct(product);
            setProductPreviews(product.images);
            setVideoPreview(product.video || null);
            setIsProductModalOpen(true);
          }}
        />
      )}

      {/* Product Add & Edit Modal */}
      {isProductModalOpen && (
        <ProductModal
          isOpen={isProductModalOpen}
          initialProduct={editingProduct}
          customers={customers}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
            setProductPreviews([]);
            setVideoPreview(null);
          }}
          onSave={(savedProduct) => {
            setProducts(prev => {
              const exists = prev.some(p => p.id === savedProduct.id);
              if (exists) {
                return prev.map(p => p.id === savedProduct.id ? savedProduct : p);
              } else {
                return [savedProduct, ...prev];
              }
            });
            syncEntity('products', savedProduct);
            setIsProductModalOpen(false);
            setEditingProduct(null);
            setProductPreviews([]);
            setVideoPreview(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
