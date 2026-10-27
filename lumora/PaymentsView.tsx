import React, { useState, useMemo, useEffect } from 'react';
import { Product, Customer, LedgerEntry } from './types';
import {
  Search,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  FileText,
  User,
  Phone,
  Mail,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Printer,
  Tag,
  Receipt,
  CreditCard,
  Building2,
  Wallet,
  Check,
  X,
  Gem,
  Package,
  Layers,
  Store,
  DollarSign,
  TrendingUp,
  Download,
  Share2,
  ExternalLink,
  Hammer
} from 'lucide-react';

export type PieceTagType = 'customer' | 'stock';

export interface CustomerTransaction {
  id: string;
  date: string;
  type: 'Booking Advance' | 'Milestone Advance' | 'Final Settlement' | 'Full Upfront';
  amount: number;
  paymentMethod: 'Wire Transfer' | 'Credit Card' | 'Debit Card' | 'Cash' | 'Cheque' | 'Escrow' | 'UPI';
  referenceNo: string;
  clientName: string;
  status: 'Completed' | 'Pending Verification';
  notes?: string;
}

export interface CraftsmanTransaction {
  id: string;
  date: string;
  craftsmanName: string;
  craftsmanSpecialty: 'Master Goldsmith' | 'Stone Setter' | 'Casting & Foundry' | 'Polishing & Rhodium' | 'Gemstone Lapidary' | 'Assay & Hallmarking' | 'CAD Designer';
  workDescription: string;
  type: 'Production Advance' | 'Material Advance' | 'Milestone Payment' | 'Final Settlement' | 'Full Payment';
  amount: number;
  paymentMethod: 'Bank Transfer / NEFT' | 'Wire / Swift' | 'Company Cheque' | 'Corporate Card' | 'Cash' | 'UPI';
  referenceNo: string;
  status: 'Completed' | 'Scheduled';
  notes?: string;
}

export interface PiecePaymentRecord {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productImage: string;
  category: string;
  material: string;

  // Tagging: Customer vs Stock
  tag: PieceTagType;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  orderId?: string;
  stockLocation?: string;

  // Track 1: Customer Payments & Advances Received
  customerRetailPrice: number;
  customerDueDate?: string;
  customerTransactions: CustomerTransaction[];

  // Track 2: Craftsman Payments & Advances Disbursed
  craftsmanBudgetedCost: number;
  craftsmanTransactions: CraftsmanTransaction[];

  notes?: string;
}

// Initial Mock Records with 2 distinct tracks per piece
export const INITIAL_PIECE_PAYMENTS: PiecePaymentRecord[] = [
  {
    id: 'PMR-001',
    productId: 'lp-001',
    productName: 'Celestial Empress Necklace',
    productSku: 'LMR-N-001-PLAT',
    productImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
    category: 'Necklaces',
    material: 'Platinum 950',
    tag: 'customer',
    customerId: 'CUS-001',
    customerName: 'Eleanor Rigby',
    customerEmail: 'eleanor@abbeyroad.com',
    customerPhone: '+44 7700 900122',
    orderId: 'ORD-7721',
    customerRetailPrice: 65000,
    customerDueDate: '2026-03-28',
    customerTransactions: [
      {
        id: 'TX-C-101',
        date: '2026-03-01',
        type: 'Booking Advance',
        amount: 20000,
        paymentMethod: 'Wire Transfer',
        referenceNo: 'ENBD-DXB-77412',
        clientName: 'Eleanor Rigby',
        status: 'Completed',
        notes: 'Initial 30% advance deposit received via Emirates NBD Wire'
      },
      {
        id: 'TX-C-102',
        date: '2026-03-10',
        type: 'Milestone Advance',
        amount: 15000,
        paymentMethod: 'Credit Card',
        referenceNo: 'AMEX-CENT-99120',
        clientName: 'Eleanor Rigby',
        status: 'Completed',
        notes: 'Mid-production milestone advance upon platinum skeleton QA approval'
      }
    ],
    craftsmanBudgetedCost: 19500,
    craftsmanTransactions: [
      {
        id: 'TX-V-201',
        date: '2026-03-04',
        craftsmanName: 'Valenza Platinum Foundry',
        craftsmanSpecialty: 'Casting & Foundry',
        workDescription: 'Precision vacuum induction casting in Platinum 950 with articulated micro-hinges',
        type: 'Production Advance',
        amount: 4000,
        paymentMethod: 'Wire / Swift',
        referenceNo: 'BNP-MIL-55190',
        status: 'Completed',
        notes: 'Initial platinum grain and casting mold advance'
      },
      {
        id: 'TX-V-202',
        date: '2026-03-06',
        craftsmanName: 'Master Hiroshi',
        craftsmanSpecialty: 'Stone Setter',
        workDescription: 'Microscope claw and pavé setting of 38 center diamonds and 124 accent diamonds',
        type: 'Production Advance',
        amount: 5000,
        paymentMethod: 'Wire / Swift',
        referenceNo: 'MUFG-TYO-99120',
        status: 'Completed',
        notes: 'Bench reservation retainer advance for master setter'
      },
      {
        id: 'TX-V-203',
        date: '2026-03-12',
        craftsmanName: 'Valenza Platinum Foundry',
        craftsmanSpecialty: 'Casting & Foundry',
        workDescription: 'Final batch casting delivery and dimensional ultrasound verification',
        type: 'Final Settlement',
        amount: 4500,
        paymentMethod: 'Bank Transfer / NEFT',
        referenceNo: 'BNP-MIL-55448',
        status: 'Completed',
        notes: 'Settlement upon QA sign-off of platinum links'
      }
    ],
    notes: 'Bespoke commissioned piece. 54% customer advance received, 69% craftsman advances settled.'
  },
  {
    id: 'PMR-002',
    productId: 'lp-002',
    productName: 'Solitaire Royal Ring',
    productSku: 'LMR-R-002-GOLD',
    productImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
    category: 'Rings',
    material: '18k Yellow Gold',
    tag: 'stock',
    stockLocation: 'Flagship Showroom Boutique (Mumbai)',
    customerRetailPrice: 18500,
    customerDueDate: '2026-04-15',
    customerTransactions: [],
    craftsmanBudgetedCost: 4800,
    craftsmanTransactions: [
      {
        id: 'TX-V-204',
        date: '2026-02-20',
        craftsmanName: 'Elena Rossi',
        craftsmanSpecialty: 'Master Goldsmith',
        workDescription: 'Hand-carved gold gallery and comfort-fit shank forging',
        type: 'Production Advance',
        amount: 2000,
        paymentMethod: 'Bank Transfer / NEFT',
        referenceNo: 'INT-MIL-8812',
        status: 'Completed',
        notes: 'Gold forging advance'
      },
      {
        id: 'TX-V-205',
        date: '2026-03-02',
        craftsmanName: 'Elena Rossi',
        craftsmanSpecialty: 'Master Goldsmith',
        workDescription: 'Final bench assembly and mirror buffing',
        type: 'Final Settlement',
        amount: 1600,
        paymentMethod: 'Bank Transfer / NEFT',
        referenceNo: 'INT-MIL-8994',
        status: 'Completed',
        notes: 'Bench balance settled upon delivery'
      },
      {
        id: 'TX-V-206',
        date: '2026-03-11',
        craftsmanName: 'Geneva Assay & Hallmarking Bureau',
        craftsmanSpecialty: 'Assay & Hallmarking',
        workDescription: 'Purity XRF spectrography, laser hallmark engraving, Swiss St. Bernard stamp',
        type: 'Full Payment',
        amount: 1200,
        paymentMethod: 'Corporate Card',
        referenceNo: 'UBS-GVA-44810',
        status: 'Completed',
        notes: 'Official hallmark fee paid in full'
      }
    ],
    notes: 'Crafted for Showroom Stock. 100% craftsman fabrication costs paid. Available for client acquisition.'
  },
  {
    id: 'PMR-003',
    productId: 'lp-003',
    productName: 'Aura Diamond Drop Earrings',
    productSku: 'LMR-E-003-ROSE',
    productImage: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800',
    category: 'Earrings',
    material: '18k Rose Gold',
    tag: 'customer',
    customerId: 'CUS-003',
    customerName: 'Sofia Coppola',
    customerEmail: 'sofia@lostintranslation.com',
    customerPhone: '+971 50 123 4567',
    orderId: 'ORD-7725',
    customerRetailPrice: 32000,
    customerDueDate: '2026-03-30',
    customerTransactions: [
      {
        id: 'TX-C-103',
        date: '2026-03-08',
        type: 'Booking Advance',
        amount: 10000,
        paymentMethod: 'Wire Transfer',
        referenceNo: 'ENBD-DXB-99014',
        clientName: 'Sofia Coppola',
        status: 'Completed',
        notes: 'Initial booking deposit received from Dubai'
      }
    ],
    craftsmanBudgetedCost: 8200,
    craftsmanTransactions: [
      {
        id: 'TX-V-207',
        date: '2026-03-09',
        craftsmanName: 'Master Hiroshi',
        craftsmanSpecialty: 'Stone Setter',
        workDescription: 'Drop articulated diamond setting with hidden safety clasps',
        type: 'Production Advance',
        amount: 3500,
        paymentMethod: 'Wire / Swift',
        referenceNo: 'MUFG-TYO-99450',
        status: 'Completed',
        notes: 'Artisan advance for bench reservation'
      }
    ],
    notes: 'Rose gold tear-drop diamonds. 31% customer advance in hand, setter advance disbursed.'
  },
  {
    id: 'PMR-004',
    productId: 'lp-004',
    productName: 'Emerald Serenade Bracelet',
    productSku: 'LMR-B-004-WHT',
    productImage: 'https://images.unsplash.com/photo-1611591475879-166299d63c56?auto=format&fit=crop&q=80&w=800',
    category: 'Bracelets',
    material: '18k White Gold',
    tag: 'customer',
    customerId: 'CUS-005',
    customerName: 'Maharani Gayatri Singhania',
    customerEmail: 'gayatri.singhania@heritagecorp.in',
    customerPhone: '+91 98200 44881',
    orderId: 'ORD-7726',
    customerRetailPrice: 48000,
    customerDueDate: '2026-04-05',
    customerTransactions: [],
    craftsmanBudgetedCost: 14000,
    craftsmanTransactions: [
      {
        id: 'TX-V-208',
        date: '2026-03-04',
        craftsmanName: 'Jaipur Gem Lapidary',
        craftsmanSpecialty: 'Gemstone Lapidary',
        workDescription: 'Color calibration and step-cut faceting of 14 matched Zambian emeralds',
        type: 'Material Advance',
        amount: 4000,
        paymentMethod: 'Bank Transfer / NEFT',
        referenceNo: 'HDFC-JPR-772911',
        status: 'Completed',
        notes: 'Parcel sorting and lab certification advance'
      }
    ],
    notes: 'High jewelry tennis bracelet. Craftsman lapidary advance paid; client booking advance pending.'
  },
  {
    id: 'PMR-005',
    productId: 'lp-005',
    productName: 'Imperial Sapphire Pendant',
    productSku: 'LMR-P-005-PLAT',
    productImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800',
    category: 'Pendants',
    material: 'Platinum 950',
    tag: 'stock',
    stockLocation: 'Atelier Private Vault (Geneva)',
    customerRetailPrice: 27500,
    customerDueDate: '2026-04-20',
    customerTransactions: [],
    craftsmanBudgetedCost: 6900,
    craftsmanTransactions: [
      {
        id: 'TX-V-209',
        date: '2026-02-15',
        craftsmanName: 'Marcus Thorne',
        craftsmanSpecialty: 'Casting & Foundry',
        workDescription: 'Platinum micro-filigree basket casting with royal sapphire mount',
        type: 'Production Advance',
        amount: 3000,
        paymentMethod: 'Bank Transfer / NEFT',
        referenceNo: 'BARC-LON-12009',
        status: 'Completed',
        notes: 'Platinum casting deposit'
      },
      {
        id: 'TX-V-210',
        date: '2026-03-01',
        craftsmanName: 'Marcus Thorne',
        craftsmanSpecialty: 'Casting & Foundry',
        workDescription: 'Finished piece assembly and rhodium flash',
        type: 'Final Settlement',
        amount: 3900,
        paymentMethod: 'Bank Transfer / NEFT',
        referenceNo: 'BARC-LON-12340',
        status: 'Completed',
        notes: 'Full casting and fabrication settled'
      }
    ],
    notes: 'Archival showcase stock. 100% production costs settled ($6,900 invested). Ready for acquisition.'
  },
  {
    id: 'PMR-006',
    productId: 'lp-006',
    productName: 'Luminara Pavé Eternity Band',
    productSku: 'LMR-R-006-WHT',
    productImage: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&q=80&w=800',
    category: 'Rings',
    material: '18k White Gold',
    tag: 'stock',
    stockLocation: 'Online Atelier Showcase',
    customerRetailPrice: 12500,
    customerDueDate: '2026-04-10',
    customerTransactions: [],
    craftsmanBudgetedCost: 3200,
    craftsmanTransactions: [
      {
        id: 'TX-V-211',
        date: '2026-03-05',
        craftsmanName: 'Elena Rossi',
        craftsmanSpecialty: 'Master Goldsmith',
        workDescription: 'Continuous channel drilling and French pavé setting',
        type: 'Production Advance',
        amount: 1500,
        paymentMethod: 'Bank Transfer / NEFT',
        referenceNo: 'INT-MIL-9110',
        status: 'Completed',
        notes: 'Initial production advance'
      }
    ],
    notes: 'Showroom stock band. Elena Rossi is finishing the French pavé setting.'
  }
];

export const PaymentsView: React.FC<{
  products: Product[];
  customers: Customer[];
  onSyncLedger?: (entry: LedgerEntry) => void;
  preselectedProductId?: string;
  onNavigateToProduct?: (productId: string) => void;
}> = ({ products, customers, onSyncLedger, preselectedProductId, onNavigateToProduct }) => {
  // Main State
  const [pieces, setPieces] = useState<PiecePaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('lumora_dual_track_piece_payments');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PIECE_PAYMENTS;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lumora_dual_track_piece_payments', JSON.stringify(pieces));
    } catch (e) {
      console.error(e);
    }
  }, [pieces]);

  // Filtering & Search
  const [tagFilter, setTagFilter] = useState<'all' | 'customer' | 'stock'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'customer_pending' | 'customer_advance' | 'craftsman_pending' | 'fully_settled'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  // Modals state
  const [selectedPieceForCustomerPayment, setSelectedPieceForCustomerPayment] = useState<PiecePaymentRecord | null>(null);
  const [selectedPieceForCraftsmanPayment, setSelectedPieceForCraftsmanPayment] = useState<PiecePaymentRecord | null>(null);
  const [selectedPieceForTagging, setSelectedPieceForTagging] = useState<PiecePaymentRecord | null>(null);
  const [isAddPieceModalOpen, setIsAddPieceModalOpen] = useState(false);
  const [receiptToPrint, setReceiptToPrint] = useState<{
    type: 'customer' | 'craftsman';
    piece: PiecePaymentRecord;
    tx: any;
  } | null>(null);

  // Form State: Customer Payment
  const [custPayType, setCustPayType] = useState<CustomerTransaction['type']>('Booking Advance');
  const [custPayAmount, setCustPayAmount] = useState<number | ''>('');
  const [custPayMethod, setCustPayMethod] = useState<CustomerTransaction['paymentMethod']>('Wire Transfer');
  const [custPayRef, setCustPayRef] = useState('');
  const [custPayNotes, setCustPayNotes] = useState('');

  // Form State: Craftsman Payment
  const [craftsmanName, setCraftsmanName] = useState('Master Hiroshi');
  const [craftsmanSpecialty, setCraftsmanSpecialty] = useState<CraftsmanTransaction['craftsmanSpecialty']>('Stone Setter');
  const [craftsmanWorkDesc, setCraftsmanWorkDesc] = useState('');
  const [craftsmanPayType, setCraftsmanPayType] = useState<CraftsmanTransaction['type']>('Production Advance');
  const [craftsmanPayAmount, setCraftsmanPayAmount] = useState<number | ''>('');
  const [craftsmanPayMethod, setCraftsmanPayMethod] = useState<CraftsmanTransaction['paymentMethod']>('Bank Transfer / NEFT');
  const [craftsmanPayRef, setCraftsmanPayRef] = useState('');
  const [craftsmanPayNotes, setCraftsmanPayNotes] = useState('');

  // Form State: Tag / Allocate Piece
  const [tagModalType, setTagModalType] = useState<PieceTagType>('customer');
  const [tagCustomerId, setTagCustomerId] = useState('');
  const [tagCustomName, setTagCustomName] = useState('');
  const [tagCustomPhone, setTagCustomPhone] = useState('');
  const [tagCustomEmail, setTagCustomEmail] = useState('');
  const [tagOrderId, setTagOrderId] = useState('');
  const [tagStockLocation, setTagStockLocation] = useState('Flagship Showroom Boutique (Mumbai)');

  // Form State: Add New Piece to Payments
  const [newPieceProductId, setNewPieceProductId] = useState(products[0]?.id || '');
  const [newPieceTag, setNewPieceTag] = useState<PieceTagType>('customer');
  const [newPieceCustomerId, setNewPieceCustomerId] = useState(customers[0]?.id || '');
  const [newPieceRetailPrice, setNewPieceRetailPrice] = useState<number | ''>(products[0]?.price || 25000);
  const [newPieceCraftsmanCost, setNewPieceCraftsmanCost] = useState<number | ''>(products[0] ? Math.round(products[0].price * 0.3) : 7500);

  // Open Customer Payment Modal with smart defaults
  const openCustomerPaymentModal = (piece: PiecePaymentRecord) => {
    setSelectedPieceForCustomerPayment(piece);
    const totalRec = piece.customerTransactions.filter(t => t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);
    const balance = Math.max(0, piece.customerRetailPrice - totalRec);
    
    if (totalRec === 0) {
      setCustPayType('Booking Advance');
      setCustPayAmount(Math.round(piece.customerRetailPrice * 0.3)); // 30% standard deposit
    } else if (balance > 0) {
      setCustPayType('Final Settlement');
      setCustPayAmount(balance);
    } else {
      setCustPayType('Milestone Advance');
      setCustPayAmount('');
    }
    setCustPayRef(`REC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);
    setCustPayNotes(`Customer advance/settlement for ${piece.productName}`);
  };

  // Open Craftsman Payment Modal with smart defaults
  const openCraftsmanPaymentModal = (piece: PiecePaymentRecord) => {
    setSelectedPieceForCraftsmanPayment(piece);
    const totalPaid = piece.craftsmanTransactions.filter(t => t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);
    const balance = Math.max(0, piece.craftsmanBudgetedCost - totalPaid);

    if (totalPaid === 0) {
      setCraftsmanPayType('Production Advance');
      setCraftsmanPayAmount(Math.round(piece.craftsmanBudgetedCost * 0.4)); // 40% artisan retainer
    } else if (balance > 0) {
      setCraftsmanPayType('Final Settlement');
      setCraftsmanPayAmount(balance);
    } else {
      setCraftsmanPayType('Material Advance');
      setCraftsmanPayAmount('');
    }
    setCraftsmanPayRef(`UTR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);
    setCraftsmanWorkDesc(`Artisan craftsmanship & bench execution for ${piece.productName}`);
    setCraftsmanPayNotes(`Advance disbursement for ${piece.productName}`);
  };

  // Open Tagging Modal
  const openTagModal = (piece: PiecePaymentRecord) => {
    setSelectedPieceForTagging(piece);
    setTagModalType(piece.tag);
    setTagCustomerId(piece.customerId || customers[0]?.id || '');
    setTagCustomName(piece.customerName || '');
    setTagCustomPhone(piece.customerPhone || '');
    setTagCustomEmail(piece.customerEmail || '');
    setTagOrderId(piece.orderId || `ORD-${Math.floor(1000 + Math.random() * 9000)}`);
    setTagStockLocation(piece.stockLocation || 'Flagship Showroom Boutique (Mumbai)');
  };

  // Submit Customer Payment
  const handleSaveCustomerPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPieceForCustomerPayment || !custPayAmount || Number(custPayAmount) <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const piece = selectedPieceForCustomerPayment;
    const clientName = piece.customerName || 'Private Client';

    const newTx: CustomerTransaction = {
      id: `TX-C-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      type: custPayType,
      amount: Number(custPayAmount),
      paymentMethod: custPayMethod,
      referenceNo: custPayRef || `REC-${Date.now().toString().slice(-6)}`,
      clientName: clientName,
      status: 'Completed',
      notes: custPayNotes
    };

    setPieces(prev => prev.map(p => {
      if (p.id === piece.id) {
        return {
          ...p,
          customerTransactions: [newTx, ...p.customerTransactions]
        };
      }
      return p;
    }));

    // Sync to global Atelier Ledger
    if (onSyncLedger) {
      onSyncLedger({
        id: newTx.id,
        date: newTx.date,
        type: newTx.type.includes('Advance') ? 'customer_advance' : 'sale',
        amount: newTx.amount,
        relatedId: piece.productId,
        relatedName: `${piece.productName} (${clientName})`,
        description: `${newTx.type} received from ${clientName} for ${piece.productName}. Ref: ${newTx.referenceNo}`,
        status: 'completed',
        category: 'Inflow'
      });
    }

    setSelectedPieceForCustomerPayment(null);
    showToast(`Customer payment of $${Number(custPayAmount).toLocaleString()} recorded for ${piece.productName}!`);
  };

  // Submit Craftsman Payment
  const handleSaveCraftsmanPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPieceForCraftsmanPayment || !craftsmanPayAmount || Number(craftsmanPayAmount) <= 0) {
      alert('Please enter a valid advance or payment amount.');
      return;
    }

    const piece = selectedPieceForCraftsmanPayment;
    const newTx: CraftsmanTransaction = {
      id: `TX-V-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      craftsmanName: craftsmanName,
      craftsmanSpecialty: craftsmanSpecialty,
      workDescription: craftsmanWorkDesc || `Artisanal execution for ${piece.productName}`,
      type: craftsmanPayType,
      amount: Number(craftsmanPayAmount),
      paymentMethod: craftsmanPayMethod,
      referenceNo: craftsmanPayRef || `UTR-${Date.now().toString().slice(-6)}`,
      status: 'Completed',
      notes: craftsmanPayNotes
    };

    setPieces(prev => prev.map(p => {
      if (p.id === piece.id) {
        return {
          ...p,
          craftsmanTransactions: [newTx, ...p.craftsmanTransactions]
        };
      }
      return p;
    }));

    // Sync to global Atelier Ledger
    if (onSyncLedger) {
      onSyncLedger({
        id: newTx.id,
        date: newTx.date,
        type: newTx.type.includes('Advance') ? 'craftsman_advance' : 'craftsman_payment',
        amount: newTx.amount,
        relatedId: piece.productId,
        relatedName: `${craftsmanName} (${piece.productName})`,
        description: `${newTx.type} paid to ${craftsmanName} for ${piece.productName}. Ref: ${newTx.referenceNo}`,
        status: 'completed',
        category: 'Outflow'
      });
    }

    setSelectedPieceForCraftsmanPayment(null);
    showToast(`Disbursed $${Number(craftsmanPayAmount).toLocaleString()} advance/payment to ${craftsmanName} for ${piece.productName}!`);
  };

  // Save Tagging / Allocation
  const handleSaveTagging = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPieceForTagging) return;

    const piece = selectedPieceForTagging;
    let updatedCustomerName = '';
    let updatedEmail = '';
    let updatedPhone = '';

    if (tagModalType === 'customer') {
      const foundCustomer = customers.find(c => c.id === tagCustomerId);
      if (foundCustomer) {
        updatedCustomerName = foundCustomer.name;
        updatedEmail = foundCustomer.email;
        updatedPhone = foundCustomer.phone || '';
      } else {
        updatedCustomerName = tagCustomName || 'Private Client';
        updatedEmail = tagCustomEmail;
        updatedPhone = tagCustomPhone;
      }
    }

    setPieces(prev => prev.map(p => {
      if (p.id === piece.id) {
        return {
          ...p,
          tag: tagModalType,
          customerId: tagModalType === 'customer' ? (tagCustomerId || undefined) : undefined,
          customerName: tagModalType === 'customer' ? updatedCustomerName : undefined,
          customerEmail: tagModalType === 'customer' ? updatedEmail : undefined,
          customerPhone: tagModalType === 'customer' ? updatedPhone : undefined,
          orderId: tagModalType === 'customer' ? tagOrderId : undefined,
          stockLocation: tagModalType === 'stock' ? tagStockLocation : undefined,
        };
      }
      return p;
    }));

    setSelectedPieceForTagging(null);
    showToast(
      tagModalType === 'customer'
        ? `${piece.productName} is now tagged to customer ${updatedCustomerName} (${tagOrderId})!`
        : `${piece.productName} is now designated For Stock (${tagStockLocation})!`
    );
  };

  // Add New Piece
  const handleAddNewPiece = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === newPieceProductId) || products[0];
    if (!product) return;

    let custName = '';
    let custEmail = '';
    let custPhone = '';
    if (newPieceTag === 'customer') {
      const cust = customers.find(c => c.id === newPieceCustomerId) || customers[0];
      if (cust) {
        custName = cust.name;
        custEmail = cust.email;
        custPhone = cust.phone || '';
      }
    }

    const newRecord: PiecePaymentRecord = {
      id: `PMR-${Math.random().toString(36).substr(2, 7).toUpperCase()}`,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      productImage: product.images[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
      category: product.category,
      material: product.material || '18k Gold',
      tag: newPieceTag,
      customerId: newPieceTag === 'customer' ? newPieceCustomerId : undefined,
      customerName: newPieceTag === 'customer' ? custName : undefined,
      customerEmail: newPieceTag === 'customer' ? custEmail : undefined,
      customerPhone: newPieceTag === 'customer' ? custPhone : undefined,
      orderId: newPieceTag === 'customer' ? `ORD-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      stockLocation: newPieceTag === 'stock' ? 'Flagship Showroom Boutique' : undefined,
      customerRetailPrice: Number(newPieceRetailPrice) || product.price,
      customerDueDate: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
      customerTransactions: [],
      craftsmanBudgetedCost: Number(newPieceCraftsmanCost) || Math.round(product.price * 0.35),
      craftsmanTransactions: [],
      notes: newPieceTag === 'customer' ? `Bespoke piece for ${custName}` : 'Produced for Atelier Stock'
    };

    setPieces(prev => [newRecord, ...prev]);
    setIsAddPieceModalOpen(false);
    showToast(`${product.name} added to Payments & Advances tracker!`);
  };

  // Quick Settle Balance
  const handleQuickSettleCustomer = (piece: PiecePaymentRecord) => {
    const totalRec = piece.customerTransactions.filter(t => t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);
    const balance = Math.max(0, piece.customerRetailPrice - totalRec);
    if (balance <= 0) {
      showToast(`${piece.productName} is already fully paid by customer!`);
      return;
    }

    const newTx: CustomerTransaction = {
      id: `TX-C-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'Final Settlement',
      amount: balance,
      paymentMethod: 'Wire Transfer',
      referenceNo: `SET-${Date.now().toString().slice(-6)}`,
      clientName: piece.customerName || 'Private Client',
      status: 'Completed',
      notes: 'Final balance settlement'
    };

    setPieces(prev => prev.map(p => p.id === piece.id ? { ...p, customerTransactions: [newTx, ...p.customerTransactions] } : p));
    if (onSyncLedger) {
      onSyncLedger({
        id: newTx.id,
        date: newTx.date,
        type: 'sale',
        amount: newTx.amount,
        relatedId: piece.productId,
        relatedName: `${piece.productName} (${piece.customerName})`,
        description: `Final settlement from ${piece.customerName} for ${piece.productName}`,
        status: 'completed',
        category: 'Inflow'
      });
    }
    showToast(`Customer balance of $${balance.toLocaleString()} settled for ${piece.productName}!`);
  };

  const handleQuickSettleCraftsman = (piece: PiecePaymentRecord) => {
    const totalPaid = piece.craftsmanTransactions.filter(t => t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);
    const balance = Math.max(0, piece.craftsmanBudgetedCost - totalPaid);
    if (balance <= 0) {
      showToast(`Craftsman costs for ${piece.productName} are already fully settled!`);
      return;
    }

    const newTx: CraftsmanTransaction = {
      id: `TX-V-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      craftsmanName: piece.craftsmanTransactions[0]?.craftsmanName || 'Master Goldsmith',
      craftsmanSpecialty: piece.craftsmanTransactions[0]?.craftsmanSpecialty || 'Master Goldsmith',
      workDescription: 'Final fabrication milestone settlement',
      type: 'Final Settlement',
      amount: balance,
      paymentMethod: 'Bank Transfer / NEFT',
      referenceNo: `SET-V-${Date.now().toString().slice(-6)}`,
      status: 'Completed',
      notes: 'Final artisan settlement'
    };

    setPieces(prev => prev.map(p => p.id === piece.id ? { ...p, craftsmanTransactions: [newTx, ...p.craftsmanTransactions] } : p));
    if (onSyncLedger) {
      onSyncLedger({
        id: newTx.id,
        date: newTx.date,
        type: 'craftsman_payment',
        amount: newTx.amount,
        relatedId: piece.productId,
        relatedName: `${newTx.craftsmanName} (${piece.productName})`,
        description: `Final balance paid to ${newTx.craftsmanName} for ${piece.productName}`,
        status: 'completed',
        category: 'Outflow'
      });
    }
    showToast(`Craftsman balance of $${balance.toLocaleString()} settled for ${piece.productName}!`);
  };

  // Filtered List
  const filteredPieces = useMemo(() => {
    return pieces.filter(p => {
      // Preselected filter
      if (preselectedProductId && p.productId !== preselectedProductId) return false;

      // Tag filter
      if (tagFilter !== 'all' && p.tag !== tagFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;

      // Search query
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.productName.toLowerCase().includes(q) ||
        p.productSku.toLowerCase().includes(q) ||
        (p.customerName && p.customerName.toLowerCase().includes(q)) ||
        (p.orderId && p.orderId.toLowerCase().includes(q)) ||
        p.material.toLowerCase().includes(q) ||
        p.craftsmanTransactions.some(t => t.craftsmanName.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Status filter
      const totalCustomer = p.customerTransactions.filter(t => t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);
      const totalCraftsman = p.craftsmanTransactions.filter(t => t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);

      const isCustomerPending = totalCustomer === 0;
      const isCustomerAdvance = totalCustomer > 0 && totalCustomer < p.customerRetailPrice;
      const isCraftsmanPending = totalCraftsman < p.craftsmanBudgetedCost;
      const isFullySettled = totalCustomer >= p.customerRetailPrice && totalCraftsman >= p.craftsmanBudgetedCost;

      if (statusFilter === 'customer_pending') return isCustomerPending;
      if (statusFilter === 'customer_advance') return isCustomerAdvance;
      if (statusFilter === 'craftsman_pending') return isCraftsmanPending;
      if (statusFilter === 'fully_settled') return isFullySettled;

      return true;
    });
  }, [pieces, tagFilter, statusFilter, categoryFilter, searchQuery, preselectedProductId]);

  // Overall Financial KPIs
  const kpis = useMemo(() => {
    let customerTotalQuoted = 0;
    let customerTotalReceived = 0;
    let craftsmanTotalBudgeted = 0;
    let craftsmanTotalPaid = 0;
    let customerPiecesCount = 0;
    let stockPiecesCount = 0;

    pieces.forEach(p => {
      customerTotalQuoted += p.customerRetailPrice;
      const custRec = p.customerTransactions.filter(t => t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);
      customerTotalReceived += custRec;

      craftsmanTotalBudgeted += p.craftsmanBudgetedCost;
      const craftPaid = p.craftsmanTransactions.filter(t => t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);
      craftsmanTotalPaid += craftPaid;

      if (p.tag === 'customer') customerPiecesCount++;
      if (p.tag === 'stock') stockPiecesCount++;
    });

    const customerOutstanding = Math.max(0, customerTotalQuoted - customerTotalReceived);
    const craftsmanOutstanding = Math.max(0, craftsmanTotalBudgeted - craftsmanTotalPaid);
    const netRealizedCashflow = customerTotalReceived - craftsmanTotalPaid;
    const customerRealizationRate = customerTotalQuoted > 0 ? Math.round((customerTotalReceived / customerTotalQuoted) * 100) : 0;
    const craftsmanDisbursementRate = craftsmanTotalBudgeted > 0 ? Math.round((craftsmanTotalPaid / craftsmanTotalBudgeted) * 100) : 0;

    return {
      customerTotalQuoted,
      customerTotalReceived,
      customerOutstanding,
      customerRealizationRate,
      craftsmanTotalBudgeted,
      craftsmanTotalPaid,
      craftsmanOutstanding,
      craftsmanDisbursementRate,
      netRealizedCashflow,
      customerPiecesCount,
      stockPiecesCount
    };
  }, [pieces]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    pieces.forEach(p => set.add(p.category));
    return Array.from(set);
  }, [pieces]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-16">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed top-6 right-6 z-50 bg-lumora-charcoal text-white px-5 py-3.5 rounded-sm shadow-2xl border border-lumora-gold/40 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={16} className="text-lumora-gold shrink-0" />
          <span className="text-xs font-serif">{notificationToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-black/5 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-serif font-bold text-lumora-charcoal">Piece Payments & Advances</h2>
            <span className="bg-lumora-gold/10 text-lumora-gold text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-lumora-gold/20">
              Dual-Track Ledger
            </span>
          </div>
          <p className="text-xs text-lumora-taupe mt-1 max-w-3xl leading-relaxed">
            Every jewelry creation features parallel tracks for <strong>Craftsman Advances & Disbursements</strong> alongside <strong>Customer Advances & Payments Received</strong>, with distinct tags for bespoke client commissions vs atelier showroom stock.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddPieceModalOpen(true)}
            className="px-5 py-2.5 bg-lumora-charcoal text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-lumora-gold transition-all flex items-center gap-2 rounded-sm shadow-md"
          >
            <Plus size={14} className="text-lumora-gold" />
            + Track New Piece
          </button>
        </div>
      </div>

      {/* Top Level Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Customer Track Summary */}
        <div className="bg-white p-5 border border-black/[0.04] rounded-sm shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-lumora-taupe">Track 1: Customer Advances Received</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft size={14} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif font-bold text-lumora-charcoal font-mono">
              ${kpis.customerTotalReceived.toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-[10px] text-lumora-taupe mt-1">
              <span>Quoted: ${kpis.customerTotalQuoted.toLocaleString()}</span>
              <span className="font-bold text-emerald-600 font-mono">{kpis.customerRealizationRate}% Realized</span>
            </div>
          </div>
          <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${kpis.customerRealizationRate}%` }} />
          </div>
          <div className="text-[9px] text-amber-700 font-medium mt-2 font-mono">
            Balance Due: ${kpis.customerOutstanding.toLocaleString()}
          </div>
        </div>

        {/* Craftsman Track Summary */}
        <div className="bg-white p-5 border border-black/[0.04] rounded-sm shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-lumora-taupe">Track 2: Craftsman Advances Paid</span>
            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowUpRight size={14} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif font-bold text-lumora-charcoal font-mono">
              ${kpis.craftsmanTotalPaid.toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-[10px] text-lumora-taupe mt-1">
              <span>Budgeted: ${kpis.craftsmanTotalBudgeted.toLocaleString()}</span>
              <span className="font-bold text-blue-600 font-mono">{kpis.craftsmanDisbursementRate}% Settled</span>
            </div>
          </div>
          <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${kpis.craftsmanDisbursementRate}%` }} />
          </div>
          <div className="text-[9px] text-blue-700 font-medium mt-2 font-mono">
            Artisan Balance: ${kpis.craftsmanOutstanding.toLocaleString()}
          </div>
        </div>

        {/* Net Cashflow Realized */}
        <div className="bg-white p-5 border border-black/[0.04] rounded-sm shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-lumora-taupe">Net Atelier Cashflow Position</span>
            <div className="w-7 h-7 rounded-full bg-lumora-gold/10 text-lumora-gold flex items-center justify-center">
              <DollarSign size={14} />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-serif font-bold font-mono ${kpis.netRealizedCashflow >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {kpis.netRealizedCashflow >= 0 ? '+' : ''}${kpis.netRealizedCashflow.toLocaleString()}
            </div>
            <p className="text-[10px] text-lumora-taupe mt-1">
              Customer Inflows minus Craftsman Outflows
            </p>
          </div>
          <div className="mt-3 text-[9px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
            <CheckCircle2 size={11} /> Positive Operating Realization
          </div>
        </div>

        {/* Pieces Tagging Breakdown */}
        <div className="bg-white p-5 border border-black/[0.04] rounded-sm shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-lumora-taupe">Inventory Allocation Tagging</span>
            <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Tag size={14} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif font-bold text-lumora-charcoal font-mono">
              {pieces.length} <span className="text-sm font-normal text-lumora-taupe">Pieces</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] mt-2 font-medium">
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-sm border border-emerald-100 flex items-center gap-1">
                <User size={10} /> {kpis.customerPiecesCount} Customer
              </span>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-sm border border-amber-100 flex items-center gap-1">
                <Store size={10} /> {kpis.stockPiecesCount} Stock
              </span>
            </div>
          </div>
          <div className="mt-3 text-[9px] text-lumora-taupe">
            Click any piece tag to re-assign or allocate to client
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-5 border border-black/[0.04] rounded-sm shadow-sm space-y-4">
        {/* Tag Filters (Customer vs Stock vs All) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.03] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-lumora-taupe mr-1">View Tag:</span>
            <button
              onClick={() => setTagFilter('all')}
              className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                tagFilter === 'all'
                  ? 'bg-lumora-charcoal text-white shadow-xs'
                  : 'bg-black/5 text-lumora-charcoal hover:bg-black/10'
              }`}
            >
              All Pieces ({pieces.length})
            </button>
            <button
              onClick={() => setTagFilter('customer')}
              className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                tagFilter === 'customer'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/50'
              }`}
            >
              <User size={11} /> Tagged to Customer ({kpis.customerPiecesCount})
            </button>
            <button
              onClick={() => setTagFilter('stock')}
              className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                tagFilter === 'stock'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/50'
              }`}
            >
              <Store size={11} /> For Stock ({kpis.stockPiecesCount})
            </button>
          </div>

          {preselectedProductId && (
            <div className="flex items-center gap-2 bg-lumora-gold/10 text-lumora-gold text-[10px] font-bold px-3 py-1 rounded-sm border border-lumora-gold/30">
              <span>Filtered to selected jewelry piece</span>
              <button
                onClick={() => {
                  window.history.replaceState({}, document.title, window.location.pathname);
                  window.location.reload();
                }}
                className="hover:text-lumora-charcoal"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Search and Secondary Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lumora-taupe" />
            <input
              type="text"
              placeholder="Search piece, SKU, customer name, order ID, or craftsman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-lumora-bone/40 border border-black/10 rounded-sm text-xs focus:outline-none focus:border-lumora-gold transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Payment Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-white border border-black/10 rounded-sm text-[10px] font-bold uppercase tracking-wider text-lumora-charcoal focus:outline-none focus:border-lumora-gold"
            >
              <option value="all">All Payment Statuses</option>
              <option value="customer_pending">Customer Advance Pending</option>
              <option value="customer_advance">Customer Advance Received</option>
              <option value="craftsman_pending">Craftsman Balance Pending</option>
              <option value="fully_settled">Fully Settled (Both Tracks)</option>
            </select>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-black/10 rounded-sm text-[10px] font-bold uppercase tracking-wider text-lumora-charcoal focus:outline-none focus:border-lumora-gold"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Piece Cards with Dual Tracks */}
      <div className="space-y-6">
        {filteredPieces.length === 0 ? (
          <div className="bg-white p-12 text-center border border-black/5 rounded-sm">
            <Receipt size={36} className="mx-auto text-lumora-taupe/40 mb-3" />
            <h3 className="text-base font-serif font-bold text-lumora-charcoal">No Jewelry Pieces Found</h3>
            <p className="text-xs text-lumora-taupe mt-1">Try adjusting your search query, category filter, or tag selection.</p>
          </div>
        ) : (
          filteredPieces.map((piece) => {
            // Customer track computations
            const customerTotalRec = piece.customerTransactions.filter(t => t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);
            const customerBalance = Math.max(0, piece.customerRetailPrice - customerTotalRec);
            const customerRate = piece.customerRetailPrice > 0 ? Math.min(100, Math.round((customerTotalRec / piece.customerRetailPrice) * 100)) : 0;

            // Craftsman track computations
            const craftsmanTotalPaid = piece.craftsmanTransactions.filter(t => t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);
            const craftsmanBalance = Math.max(0, piece.craftsmanBudgetedCost - craftsmanTotalPaid);
            const craftsmanRate = piece.craftsmanBudgetedCost > 0 ? Math.min(100, Math.round((craftsmanTotalPaid / piece.craftsmanBudgetedCost) * 100)) : 0;

            // Piece net position
            const netCashflow = customerTotalRec - craftsmanTotalPaid;
            const projectedMargin = piece.customerRetailPrice - piece.craftsmanBudgetedCost;
            const marginPercent = piece.customerRetailPrice > 0 ? Math.round((projectedMargin / piece.customerRetailPrice) * 100) : 0;

            return (
              <div
                key={piece.id}
                className="bg-white border border-black/[0.06] rounded-sm shadow-xs hover:border-black/15 transition-all overflow-hidden"
              >
                {/* Piece Header Bar with Imagery, SKU, and Tagging Badge */}
                <div className="p-5 bg-lumora-bone/25 border-b border-black/[0.04] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-sm overflow-hidden border border-black/10 shrink-0 bg-white group">
                      <img
                        src={piece.productImage}
                        alt={piece.productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif font-bold text-base text-lumora-charcoal">{piece.productName}</h3>
                        <span className="text-[9px] font-mono text-lumora-taupe bg-white px-2 py-0.5 rounded border border-black/5">
                          {piece.productSku}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-lumora-taupe px-2 py-0.5 bg-black/5 rounded">
                          {piece.category} · {piece.material}
                        </span>
                      </div>

                      {/* Tagging Display & Re-assign Trigger */}
                      <div className="flex items-center gap-2 mt-2">
                        {piece.tag === 'customer' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-semibold">
                            <User size={11} className="text-emerald-600" />
                            <span>Tagged to Customer: <strong>{piece.customerName}</strong></span>
                            {piece.orderId && <span className="opacity-70 font-mono text-[9px]">({piece.orderId})</span>}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-semibold">
                            <Store size={11} className="text-amber-600" />
                            <span>For Stock: <strong>{piece.stockLocation || 'Showroom Display'}</strong></span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => openTagModal(piece)}
                          className="text-[9px] uppercase font-bold tracking-wider text-lumora-taupe hover:text-lumora-gold transition-colors underline decoration-dotted"
                          title="Change tag between Customer Order and Stock Inventory"
                        >
                          {piece.tag === 'customer' ? 'Re-tag Piece' : 'Allocate to Customer'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Net Realized Cash Position & Navigation */}
                  <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                    <div className="text-right">
                      <span className="text-[8px] uppercase tracking-wider font-bold text-lumora-taupe block">Net Realized Cash</span>
                      <span className={`text-base font-serif font-bold font-mono ${netCashflow >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {netCashflow >= 0 ? '+' : ''}${netCashflow.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-lumora-taupe block font-mono">
                        Proj. Margin: ${projectedMargin.toLocaleString()} ({marginPercent}%)
                      </span>
                    </div>

                    {onNavigateToProduct && (
                      <button
                        onClick={() => onNavigateToProduct(piece.productId)}
                        className="p-2 border border-black/10 rounded-sm text-lumora-taupe hover:text-lumora-charcoal hover:border-black/30 transition-all"
                        title="View & Edit Product Specifications"
                      >
                        <ExternalLink size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* THE DUAL PARALLEL TRACKS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-black/[0.06]">
                  {/* ========================================================================= */}
                  {/* TRACK 1: CUSTOMER PAYMENTS & ADVANCES (INFLOW)                           */}
                  {/* ========================================================================= */}
                  <div className="p-5 flex flex-col justify-between space-y-4 bg-white">
                    <div className="space-y-3">
                      {/* Track 1 Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                              <ArrowDownLeft size={13} />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-lumora-charcoal">
                              Track 1: Customer Advances & Payments
                            </h4>
                          </div>
                          <p className="text-[10px] text-lumora-taupe mt-0.5">
                            {piece.tag === 'customer'
                              ? `Commissioned by ${piece.customerName} · Due by ${piece.customerDueDate || 'Scheduled Delivery'}`
                              : 'Piece currently for Atelier Stock (Customer payment recorded upon sale/booking deposit)'}
                          </p>
                        </div>

                        {/* Customer Realization Badge */}
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          customerBalance === 0 && piece.customerTransactions.length > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : customerTotalRec > 0
                            ? 'bg-blue-50 text-blue-800 border border-blue-100'
                            : piece.tag === 'stock'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {customerBalance === 0 && piece.customerTransactions.length > 0
                            ? 'Fully Settled'
                            : customerTotalRec > 0
                            ? `${customerRate}% Advance Paid`
                            : piece.tag === 'stock'
                            ? 'Stock Available'
                            : 'Advance Pending'}
                        </span>
                      </div>

                      {/* Customer Numbers Row */}
                      <div className="grid grid-cols-3 gap-2 bg-lumora-bone/30 p-3 rounded-sm text-center border border-black/[0.03]">
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-lumora-taupe block font-bold">Quoted Retail</span>
                          <span className="text-sm font-bold text-lumora-charcoal font-mono">${piece.customerRetailPrice.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-emerald-700 block font-bold">Advances Received</span>
                          <span className="text-sm font-bold text-emerald-700 font-mono">${customerTotalRec.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-amber-700 block font-bold">Balance Receivable</span>
                          <span className="text-sm font-bold text-amber-700 font-mono">${customerBalance.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-lumora-taupe font-mono">
                          <span>Customer Realization</span>
                          <span>{customerRate}%</span>
                        </div>
                        <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${customerRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Customer Transaction Chronology */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[8px] uppercase tracking-wider font-bold text-lumora-taupe block">
                          Advances & Payments Chronology ({piece.customerTransactions.length})
                        </span>
                        {piece.customerTransactions.length === 0 ? (
                          <div className="text-[10px] text-lumora-taupe italic p-2 bg-black/[0.01] border border-dashed border-black/10 rounded text-center">
                            No advances logged yet from client.
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {piece.customerTransactions.map((tx) => (
                              <div
                                key={tx.id}
                                className="flex items-center justify-between p-2 bg-lumora-bone/20 border border-black/[0.03] rounded text-[10px]"
                              >
                                <div>
                                  <div className="flex items-center gap-1.5 font-medium text-lumora-charcoal">
                                    <span className="font-bold">{tx.type}</span>
                                    <span className="text-[9px] text-lumora-taupe">via {tx.paymentMethod}</span>
                                    <span className="text-[8px] font-mono text-lumora-taupe opacity-70">({tx.referenceNo})</span>
                                  </div>
                                  <span className="text-[9px] text-lumora-taupe">{tx.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-emerald-700">+${tx.amount.toLocaleString()}</span>
                                  <button
                                    onClick={() => setReceiptToPrint({ type: 'customer', piece, tx })}
                                    className="p-1 hover:text-lumora-gold text-lumora-taupe transition-colors"
                                    title="Print Customer Payment Receipt"
                                  >
                                    <Printer size={11} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customer Action Footer */}
                    <div className="flex items-center gap-2 pt-2 border-t border-black/[0.04]">
                      <button
                        type="button"
                        onClick={() => openCustomerPaymentModal(piece)}
                        className="flex-1 py-2 px-3 bg-emerald-700 text-white hover:bg-emerald-800 text-[9px] font-bold uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Plus size={12} /> Record Customer Advance / Payment
                      </button>

                      {customerBalance > 0 && piece.tag === 'customer' && (
                        <button
                          type="button"
                          onClick={() => handleQuickSettleCustomer(piece)}
                          className="py-2 px-3 border border-emerald-600/30 text-emerald-800 hover:bg-emerald-50 text-[9px] font-bold uppercase tracking-wider rounded-sm transition-all whitespace-nowrap"
                        >
                          Settle Balance
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* TRACK 2: CRAFTSMAN PAYMENTS & ADVANCES (OUTFLOW)                          */}
                  {/* ========================================================================= */}
                  <div className="p-5 flex flex-col justify-between space-y-4 bg-white">
                    <div className="space-y-3">
                      {/* Track 2 Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                              <Hammer size={13} />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-lumora-charcoal">
                              Track 2: Craftsman Advances & Costs
                            </h4>
                          </div>
                          <p className="text-[10px] text-lumora-taupe mt-0.5">
                            Goldsmiths, setters, casting foundries, lapidaries & assay bureaus
                          </p>
                        </div>

                        {/* Craftsman Disbursement Badge */}
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          craftsmanBalance === 0 && piece.craftsmanTransactions.length > 0
                            ? 'bg-blue-100 text-blue-800'
                            : craftsmanTotalPaid > 0
                            ? 'bg-indigo-50 text-indigo-800 border border-indigo-100'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {craftsmanBalance === 0 && piece.craftsmanTransactions.length > 0
                            ? 'Costs Fully Settled'
                            : craftsmanTotalPaid > 0
                            ? `${craftsmanRate}% Advance Paid`
                            : 'Advances Pending'}
                        </span>
                      </div>

                      {/* Craftsman Numbers Row */}
                      <div className="grid grid-cols-3 gap-2 bg-lumora-bone/30 p-3 rounded-sm text-center border border-black/[0.03]">
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-lumora-taupe block font-bold">Agreed Production</span>
                          <span className="text-sm font-bold text-lumora-charcoal font-mono">${piece.craftsmanBudgetedCost.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-blue-700 block font-bold">Advances Disbursed</span>
                          <span className="text-sm font-bold text-blue-700 font-mono">${craftsmanTotalPaid.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-indigo-700 block font-bold">Payable Balance</span>
                          <span className="text-sm font-bold text-indigo-700 font-mono">${craftsmanBalance.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-lumora-taupe font-mono">
                          <span>Craftsman Disbursement</span>
                          <span>{craftsmanRate}%</span>
                        </div>
                        <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${craftsmanRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Craftsman Transaction Chronology */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[8px] uppercase tracking-wider font-bold text-lumora-taupe block">
                          Craftsmen Advances & Settlements ({piece.craftsmanTransactions.length})
                        </span>
                        {piece.craftsmanTransactions.length === 0 ? (
                          <div className="text-[10px] text-lumora-taupe italic p-2 bg-black/[0.01] border border-dashed border-black/10 rounded text-center">
                            No craftsman advances or payments disbursed yet.
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {piece.craftsmanTransactions.map((tx) => (
                              <div
                                key={tx.id}
                                className="flex items-center justify-between p-2 bg-lumora-bone/20 border border-black/[0.03] rounded text-[10px]"
                              >
                                <div>
                                  <div className="flex items-center gap-1.5 font-medium text-lumora-charcoal">
                                    <span className="font-bold">{tx.craftsmanName}</span>
                                    <span className="text-[8px] bg-black/5 px-1 py-0.2 rounded text-lumora-taupe">{tx.craftsmanSpecialty}</span>
                                    <span className="text-[9px] text-lumora-taupe">({tx.type})</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[8px] text-lumora-taupe mt-0.5">
                                    <span>{tx.date}</span>
                                    <span>Ref: {tx.referenceNo}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-blue-700">-${tx.amount.toLocaleString()}</span>
                                  <button
                                    onClick={() => setReceiptToPrint({ type: 'craftsman', piece, tx })}
                                    className="p-1 hover:text-lumora-gold text-lumora-taupe transition-colors"
                                    title="Print Craftsman Disbursement Voucher"
                                  >
                                    <Printer size={11} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Craftsman Action Footer */}
                    <div className="flex items-center gap-2 pt-2 border-t border-black/[0.04]">
                      <button
                        type="button"
                        onClick={() => openCraftsmanPaymentModal(piece)}
                        className="flex-1 py-2 px-3 bg-blue-700 text-white hover:bg-blue-800 text-[9px] font-bold uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Plus size={12} /> Record Craftsman Advance / Payment
                      </button>

                      {craftsmanBalance > 0 && (
                        <button
                          type="button"
                          onClick={() => handleQuickSettleCraftsman(piece)}
                          className="py-2 px-3 border border-blue-600/30 text-blue-800 hover:bg-blue-50 text-[9px] font-bold uppercase tracking-wider rounded-sm transition-all whitespace-nowrap"
                        >
                          Settle Artisan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: RECORD CUSTOMER ADVANCE / PAYMENT                                */}
      {/* ========================================================================= */}
      {selectedPieceForCustomerPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg w-full p-6 border border-black/10 rounded-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-black/5 pb-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-emerald-700 font-bold block mb-1">
                  Track 1 · Inflow Record
                </span>
                <h3 className="font-serif font-bold text-lg text-lumora-charcoal">
                  Record Customer Advance / Payment
                </h3>
              </div>
              <button
                onClick={() => setSelectedPieceForCustomerPayment(null)}
                className="text-lumora-taupe hover:text-lumora-charcoal p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomerPayment} className="space-y-4 pt-4">
              {/* Piece Banner */}
              <div className="flex items-center gap-3 p-3 bg-lumora-bone/40 border border-black/5 rounded-sm">
                <img
                  src={selectedPieceForCustomerPayment.productImage}
                  alt=""
                  className="w-12 h-12 object-cover rounded border border-black/10"
                />
                <div className="text-xs">
                  <h4 className="font-serif font-bold text-lumora-charcoal">{selectedPieceForCustomerPayment.productName}</h4>
                  <p className="text-[10px] text-lumora-taupe font-mono">
                    SKU: {selectedPieceForCustomerPayment.productSku} · Price: ${selectedPieceForCustomerPayment.customerRetailPrice.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    Customer: {selectedPieceForCustomerPayment.customerName || 'Private Client'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-lumora-taupe block mb-1">
                    Payment Classification
                  </label>
                  <select
                    value={custPayType}
                    onChange={(e) => setCustPayType(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-black/10 rounded-sm text-xs focus:outline-none focus:border-lumora-gold font-medium"
                  >
                    <option value="Booking Advance">Booking Advance (Initial Token)</option>
                    <option value="Milestone Advance">Milestone Advance (Mid-Production)</option>
                    <option value="Final Settlement">Final Settlement (Pre-Delivery)</option>
                    <option value="Full Upfront">Full Upfront Payment (100%)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-lumora-taupe block mb-1">
                    Amount Received ($ USD)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 15000"
                    value={custPayAmount}
                    onChange={(e) => setCustPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-black/10 rounded-sm text-xs font-mono font-bold focus:outline-none focus:border-lumora-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-lumora-taupe block mb-1">
                    Payment Method
                  </label>
                  <select
                    value={custPayMethod}
                    onChange={(e) => setCustPayMethod(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-black/10 rounded-sm text-xs focus:outline-none focus:border-lumora-gold"
                  >
                    <option value="Wire Transfer">Wire Transfer / SWIFT</option>
                    <option value="Credit Card">Credit Card (Amex / Visa / MC)</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cheque">Cashier / Banker Cheque</option>
                    <option value="Cash">Vault Cash Counter</option>
                    <option value="Escrow">Luxury Escrow Service</option>
                    <option value="UPI">UPI / Digital Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-lumora-taupe block mb-1">
                    Reference / UTR / Receipt No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ENBD-DXB-9921"
                    value={custPayRef}
                    onChange={(e) => setCustPayRef(e.target.value)}
                    className="w-full p-2.5 bg-white border border-black/10 rounded-sm text-xs font-mono focus:outline-none focus:border-lumora-gold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-lumora-taupe block mb-1">
                  Private Atelier Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Received via Dubai Emirates NBD private client desk"
                  value={custPayNotes}
                  onChange={(e) => setCustPayNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-black/10 rounded-sm text-xs focus:outline-none focus:border-lumora-gold"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setSelectedPieceForCustomerPayment(null)}
                  className="flex-1 py-2.5 border border-black/10 text-lumora-charcoal text-[10px] font-bold uppercase tracking-wider hover:bg-black/5 rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-800 rounded-sm shadow-md"
                >
                  Confirm Customer Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RECORD CRAFTSMAN ADVANCE / PAYMENT                               */}
      {/* ========================================================================= */}
      {selectedPieceForCraftsmanPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg w-full p-6 border border-black/10 rounded-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-black/5 pb-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-blue-700 font-bold block mb-1">
                  Track 2 · Outflow Disbursement
                </span>
                <h3 className="font-serif font-bold text-lg text-lumora-charcoal">
                  Record Craftsman Advance / Payment
                </h3>
              </div>
              <button
                onClick={() => setSelectedPieceForCraftsmanPayment(null)}
                className="text-lumora-taupe hover:text-lumora-charcoal p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCraftsmanPayment} className="space-y-4 pt-4">
              {/* Piece Banner */}
              <div className="flex items-center gap-3 p-3 bg-lumora-bone/40 border border-black/5 rounded-sm">
                <img
                  src={selectedPieceForCraftsmanPayment.productImage}
                  alt=""
                  className="w-12 h-12 object-cover rounded border border-black/10"
                />
                <div className="text-xs">
                  <h4 className="font-serif font-bold text-lumora-charcoal">{selectedPieceForCraftsmanPayment.productName}</h4>
                  <p className="text-[10px] text-lumora-taupe font-mono">
                    SKU: {selectedPieceForCraftsmanPayment.productSku} · Budgeted Production: ${selectedPieceForCraftsmanPayment.craftsmanBudgetedCost.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-lumora-taupe block mb-1">
                    Craftsman / Vendor Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Hiroshi"
                    value={craftsmanName}
                    onChange={(e) => setCraftsmanName(e.target.value)}
                    className="w-full p-2.5 bg-white border border-black/10 rounded-sm text-xs font-semibold focus:outline-none focus:border-lumora-gold"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-lumora-taupe block mb-1">
                    Artisan Specialty
                  </label>
                  <select
                    value={craftsmanSpecialty}
                    onChange={(e) => setCraftsmanSpecialty(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-black/10 rounded-sm text-xs focus:outline-none focus:border-lumora-gold"
                  >
                    <option value="Master Goldsmith">Master Goldsmith</option>
                    <option value="Stone Setter">Stone Setter</option>
                    <option value="Casting & Foundry">Casting & Foundry</option>
                    <option value="Polishing & Rhodium">Polishing & Rhodium</option>
                    <option value="Gemstone Lapidary">Gemstone Lapidary</option>
                    <option value="Assay & Hallmarking">Assay & Hallmarking</option>
                    <option value="CAD Designer">CAD Designer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-lumora-taupe block mb-1">
                  Work / Craftsmanship Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Micro-pavé setting of 124 accent diamonds on platinum gallery"
                  value={craftsmanWorkDesc}
                  onChange={(e) => setCraftsmanWorkDesc(e.target.value)}
                  className="w-full p-2.5 bg-white border border-black/10 rounded-sm text-xs focus:outline-none focus:border-lumora-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-lumora-taupe block mb-1">
                    Disbursement Type
                  </label>
                  <select
                    value={craftsmanPayType}
                    onChange={(e) => setCraftsmanPayType(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-black/10 rounded-sm text-xs focus:outline-none focus:border-lumora-gold font-medium"
                  >
                    <option value="Production Advance">Production Advance (Bench Retainer)</option>
                    <option value="Material Advance">Material Advance (Metal/Gems)</option>
                    <option value="Milestone Payment">Milestone Payment (Mid-Stage)</option>
                    <option value="Final Settlement">Final Settlement (QA Delivery)</option>
                    <option value="Full Payment">Full Payment Upfront</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-lumora-taupe block mb-1">
                    Disbursement Amount ($ USD)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 4000"
                    value={craftsmanPayAmount}
                    onChange={(e) => setCraftsmanPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-black/10 rounded-sm text-xs font-mono font-bold focus:outline-none focus:border-lumora-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-lumora-taupe block mb-1">
                    Payout Method
                  </label>
                  <select
                    value={craftsmanPayMethod}
                    onChange={(e) => setCraftsmanPayMethod(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-black/10 rounded-sm text-xs focus:outline-none focus:border-lumora-gold"
                  >
                    <option value="Bank Transfer / NEFT">Bank Transfer / NEFT / RTGS</option>
                    <option value="Wire / Swift">International Wire / SWIFT</option>
                    <option value="Company Cheque">Company Cheque</option>
                    <option value="Corporate Card">Corporate Atelier Card</option>
                    <option value="Cash">Cash Voucher</option>
                    <option value="UPI">UPI Direct</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-lumora-taupe block mb-1">
                    Bank Reference / UTR No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UTR-994102"
                    value={craftsmanPayRef}
                    onChange={(e) => setCraftsmanPayRef(e.target.value)}
                    className="w-full p-2.5 bg-white border border-black/10 rounded-sm text-xs font-mono focus:outline-none focus:border-lumora-gold"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setSelectedPieceForCraftsmanPayment(null)}
                  className="flex-1 py-2.5 border border-black/10 text-lumora-charcoal text-[10px] font-bold uppercase tracking-wider hover:bg-black/5 rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-blue-800 rounded-sm shadow-md"
                >
                  Disburse Artisan Advance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TAG PIECE (CUSTOMER VS FOR STOCK)                                */}
      {/* ========================================================================= */}
      {selectedPieceForTagging && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-6 border border-black/10 rounded-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-black/5 pb-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-lumora-gold font-bold block mb-1">
                  Inventory Allocation
                </span>
                <h3 className="font-serif font-bold text-lg text-lumora-charcoal">
                  Tag Piece Designation
                </h3>
              </div>
              <button
                onClick={() => setSelectedPieceForTagging(null)}
                className="text-lumora-taupe hover:text-lumora-charcoal p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTagging} className="space-y-4 pt-4">
              <div className="p-3 bg-lumora-bone/30 rounded border border-black/5 text-xs">
                <p className="font-serif font-bold text-lumora-charcoal">{selectedPieceForTagging.productName}</p>
                <p className="text-[10px] text-lumora-taupe font-mono">SKU: {selectedPieceForTagging.productSku}</p>
              </div>

              {/* Tag Selection Radio Buttons */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-wider text-lumora-taupe block">
                  Select Designation
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTagModalType('customer')}
                    className={`p-3 rounded-sm border text-left transition-all ${
                      tagModalType === 'customer'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs'
                        : 'border-black/10 hover:bg-black/5 text-lumora-charcoal'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User size={14} className={tagModalType === 'customer' ? 'text-emerald-700' : 'text-lumora-taupe'} />
                      <span className="text-xs font-bold">Tagged to Customer</span>
                    </div>
                    <p className="text-[9px] text-lumora-taupe mt-1">Bespoke order or client reservation</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTagModalType('stock')}
                    className={`p-3 rounded-sm border text-left transition-all ${
                      tagModalType === 'stock'
                        ? 'border-amber-600 bg-amber-50/70 text-amber-900 shadow-xs'
                        : 'border-black/10 hover:bg-black/5 text-lumora-charcoal'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Store size={14} className={tagModalType === 'stock' ? 'text-amber-700' : 'text-lumora-taupe'} />
                      <span className="text-xs font-bold">For Stock</span>
                    </div>
                    <p className="text-[9px] text-lumora-taupe mt-1">Showroom display or vault inventory</p>
                  </button>
                </div>
              </div>

              {/* Customer Allocation Fields */}
              {tagModalType === 'customer' ? (
                <div className="space-y-3 p-3 bg-emerald-50/40 border border-emerald-100 rounded-sm">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-emerald-900 block mb-1">
                      Choose Customer
                    </label>
                    <select
                      value={tagCustomerId}
                      onChange={(e) => setTagCustomerId(e.target.value)}
                      className="w-full p-2 bg-white border border-emerald-200 rounded-sm text-xs font-medium focus:outline-none"
                    >
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-emerald-900 block mb-1">
                      Order / Commission Reference ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ORD-7728 or BESPOKE-09"
                      value={tagOrderId}
                      onChange={(e) => setTagOrderId(e.target.value)}
                      className="w-full p-2 bg-white border border-emerald-200 rounded-sm text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-3 bg-amber-50/40 border border-amber-100 rounded-sm">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-amber-900 block mb-1">
                      Stock Location
                    </label>
                    <select
                      value={tagStockLocation}
                      onChange={(e) => setTagStockLocation(e.target.value)}
                      className="w-full p-2 bg-white border border-amber-200 rounded-sm text-xs font-medium focus:outline-none"
                    >
                      <option value="Flagship Showroom Boutique (Mumbai)">Flagship Showroom Boutique (Mumbai)</option>
                      <option value="Atelier Private Vault (Geneva)">Atelier Private Vault (Geneva)</option>
                      <option value="Harrods Fine Jewellery Concession (London)">Harrods Fine Jewellery Concession (London)</option>
                      <option value="Online Atelier Showcase">Online Atelier Showcase</option>
                      <option value="Archival High Jewelry Exhibition">Archival High Jewelry Exhibition</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setSelectedPieceForTagging(null)}
                  className="flex-1 py-2.5 border border-black/10 text-lumora-charcoal text-[10px] font-bold uppercase tracking-wider hover:bg-black/5 rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-lumora-charcoal text-white text-[10px] font-bold uppercase tracking-wider hover:bg-lumora-gold rounded-sm shadow-md"
                >
                  Save Piece Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: TRACK NEW PIECE                                                  */}
      {/* ========================================================================= */}
      {isAddPieceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg w-full p-6 border border-black/10 rounded-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-black/5 pb-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-lumora-gold font-bold block mb-1">
                  Atelier Portfolio
                </span>
                <h3 className="font-serif font-bold text-lg text-lumora-charcoal">
                  Add Piece to Payments Tracker
                </h3>
              </div>
              <button
                onClick={() => setIsAddPieceModalOpen(false)}
                className="text-lumora-taupe hover:text-lumora-charcoal p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddNewPiece} className="space-y-4 pt-4">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-lumora-taupe block mb-1">
                  Select Jewelry Product
                </label>
                <select
                  value={newPieceProductId}
                  onChange={(e) => {
                    setNewPieceProductId(e.target.value);
                    const p = products.find(prod => prod.id === e.target.value);
                    if (p) {
                      setNewPieceRetailPrice(p.price);
                      setNewPieceCraftsmanCost(Math.round(p.price * 0.32));
                    }
                  }}
                  className="w-full p-2.5 bg-white border border-black/10 rounded-sm text-xs font-semibold focus:outline-none focus:border-lumora-gold"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — ${p.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-lumora-taupe block mb-1">
                    Quoted Retail Price ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={newPieceRetailPrice}
                    onChange={(e) => setNewPieceRetailPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-black/10 rounded-sm text-xs font-mono font-bold focus:outline-none focus:border-lumora-gold"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-lumora-taupe block mb-1">
                    Craftsman Budgeted Cost ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={newPieceCraftsmanCost}
                    onChange={(e) => setNewPieceCraftsmanCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-black/10 rounded-sm text-xs font-mono font-bold focus:outline-none focus:border-lumora-gold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-lumora-taupe block mb-1">
                  Initial Tag
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewPieceTag('customer')}
                    className={`p-2.5 rounded-sm border text-xs font-bold flex items-center justify-center gap-2 ${
                      newPieceTag === 'customer'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-black/10 text-lumora-taupe'
                    }`}
                  >
                    <User size={13} /> Tag to Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPieceTag('stock')}
                    className={`p-2.5 rounded-sm border text-xs font-bold flex items-center justify-center gap-2 ${
                      newPieceTag === 'stock'
                        ? 'border-amber-600 bg-amber-50 text-amber-900'
                        : 'border-black/10 text-lumora-taupe'
                    }`}
                  >
                    <Store size={13} /> For Stock
                  </button>
                </div>
              </div>

              {newPieceTag === 'customer' && (
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-lumora-taupe block mb-1">
                    Assign Customer
                  </label>
                  <select
                    value={newPieceCustomerId}
                    onChange={(e) => setNewPieceCustomerId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-black/10 rounded-sm text-xs font-medium focus:outline-none focus:border-lumora-gold"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsAddPieceModalOpen(false)}
                  className="flex-1 py-2.5 border border-black/10 text-lumora-charcoal text-[10px] font-bold uppercase tracking-wider hover:bg-black/5 rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-lumora-charcoal text-white text-[10px] font-bold uppercase tracking-wider hover:bg-lumora-gold rounded-sm shadow-md"
                >
                  Start Tracking Piece
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: PRINT LUXURY RECEIPT / VOUCHER                                   */}
      {/* ========================================================================= */}
      {receiptToPrint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg w-full p-8 border border-black/10 rounded-sm shadow-2xl text-lumora-charcoal">
            <div className="border-b-2 border-lumora-gold pb-6 text-center">
              <h2 className="text-2xl font-serif font-bold tracking-widest text-lumora-charcoal">LUMORA</h2>
              <span className="text-[9px] uppercase tracking-[0.4em] text-lumora-taupe font-bold block mt-1">
                Haute Joaillerie Atelier · Geneva & Mumbai
              </span>
              <div className="mt-4 inline-block bg-lumora-bone/50 px-4 py-1 rounded text-[10px] uppercase tracking-widest font-bold text-lumora-gold border border-lumora-gold/20">
                {receiptToPrint.type === 'customer' ? 'Customer Payment Receipt' : 'Craftsman Advance Voucher'}
              </div>
            </div>

            <div className="py-6 space-y-4 text-xs">
              <div className="flex justify-between text-lumora-taupe border-b border-black/5 pb-3">
                <div>
                  <span className="block text-[8px] uppercase tracking-wider font-bold">Transaction Reference</span>
                  <span className="font-mono font-bold text-lumora-charcoal">{receiptToPrint.tx.referenceNo}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] uppercase tracking-wider font-bold">Date Issued</span>
                  <span className="font-mono">{receiptToPrint.tx.date}</span>
                </div>
              </div>

              <div>
                <span className="block text-[8px] uppercase tracking-wider font-bold text-lumora-taupe">Jewelry Masterpiece</span>
                <p className="font-serif font-bold text-sm">{receiptToPrint.piece.productName}</p>
                <p className="text-[10px] text-lumora-taupe font-mono">
                  SKU: {receiptToPrint.piece.productSku} · Material: {receiptToPrint.piece.material}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-lumora-bone/40 p-4 rounded border border-black/5">
                <div>
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-lumora-taupe">
                    {receiptToPrint.type === 'customer' ? 'Payee / Customer' : 'Beneficiary Craftsman'}
                  </span>
                  <p className="font-bold text-sm">
                    {receiptToPrint.type === 'customer' ? receiptToPrint.tx.clientName : receiptToPrint.tx.craftsmanName}
                  </p>
                  <p className="text-[10px] text-lumora-taupe">
                    {receiptToPrint.type === 'customer' ? (receiptToPrint.piece.orderId || 'Bespoke Private Client') : receiptToPrint.tx.craftsmanSpecialty}
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-lumora-taupe">Transaction Type</span>
                  <p className="font-bold text-sm text-lumora-gold">{receiptToPrint.tx.type}</p>
                  <p className="text-[10px] text-lumora-taupe">via {receiptToPrint.tx.paymentMethod}</p>
                </div>
              </div>

              <div className="border-t border-b border-black/10 py-3 flex justify-between items-center text-sm font-bold">
                <span>Amount Confirmed</span>
                <span className="font-mono text-xl text-lumora-gold">${receiptToPrint.tx.amount.toLocaleString()} USD</span>
              </div>

              {receiptToPrint.tx.notes && (
                <p className="text-[10px] text-lumora-taupe italic">
                  "{receiptToPrint.tx.notes}"
                </p>
              )}
            </div>

            <div className="border-t border-black/5 pt-4 flex gap-3">
              <button
                onClick={() => setReceiptToPrint(null)}
                className="flex-1 py-2.5 border border-black/10 text-[10px] font-bold uppercase tracking-wider hover:bg-black/5 rounded-sm"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-lumora-charcoal text-white text-[10px] font-bold uppercase tracking-wider hover:bg-lumora-gold rounded-sm flex items-center justify-center gap-1.5 shadow-md"
              >
                <Printer size={13} /> Print Luxury Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
