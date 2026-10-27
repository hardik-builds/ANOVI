import React, { useState, useMemo } from 'react';
import { 
  ProspectOrder, 
  PendingConfirmationKey, 
  BespokeOrder, 
  LedgerEntry, 
  Customer 
} from './types';
import { 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Edit3, 
  Trash2, 
  Eye, 
  ArrowRight, 
  Check, 
  X, 
  ChevronRight, 
  Kanban, 
  List, 
  MessageSquare, 
  PhoneCall, 
  ArrowUpRight, 
  ShieldCheck, 
  Diamond, 
  Layers, 
  Printer, 
  ExternalLink,
  Tag,
  CheckSquare,
  Square,
  ChevronDown,
  Users,
  UserCheck
} from 'lucide-react';

interface ProspectsPipelineProps {
  prospects: ProspectOrder[];
  onAddProspect: (prospect: ProspectOrder) => void;
  onUpdateProspect: (id: string, updates: Partial<ProspectOrder>) => void;
  onDeleteProspect: (id: string) => void;
  onPlaceAsBespokeOrder: (prospect: ProspectOrder, bespokeData: Partial<BespokeOrder>, advanceAmount: number, advanceMethod: string) => void;
  onPlaceAsStandardOrder: (prospect: ProspectOrder, orderData: any, advanceAmount: number, advanceMethod: string) => void;
  customers: Customer[];
  craftsmenList: { id: string; name: string }[];
  onNavigateToTab?: (tab: string) => void;
}

const DEFAULT_CONFIRMATIONS = [
  { key: 'gemstone_selection' as PendingConfirmationKey, label: 'Gemstone & Diamond Selection', isConfirmed: false, details: 'Pending exact stone lot / carat weight selection.' },
  { key: 'metal_purity' as PendingConfirmationKey, label: 'Metal Purity & Alloy Choice', isConfirmed: false, details: 'Pending metal purity confirmation (18K, 22K, 950 Pt).' },
  { key: 'sizing_measurements' as PendingConfirmationKey, label: 'Sizing & Measurements', isConfirmed: false, details: 'Pending client exact ring/wrist/collar measurement.' },
  { key: 'sketch_cad_approval' as PendingConfirmationKey, label: 'Design Concept & CAD Sign-off', isConfirmed: false, details: 'Pending 3D CAD render / physical sketch sign-off.' },
  { key: 'budget_quote_approval' as PendingConfirmationKey, label: 'Final Quotation Sign-off', isConfirmed: false, details: 'Pending formal client approval on estimated quote.' },
  { key: 'advance_deposit' as PendingConfirmationKey, label: 'Advance Deposit Received', isConfirmed: false, details: 'Pending token booking advance deposit.' },
  { key: 'delivery_timeline' as PendingConfirmationKey, label: 'Workshop Delivery Feasibility', isConfirmed: false, details: 'Pending master craftsman bench schedule verification.' }
];

export const ProspectsPipeline: React.FC<ProspectsPipelineProps> = ({
  prospects,
  onAddProspect,
  onUpdateProspect,
  onDeleteProspect,
  onPlaceAsBespokeOrder,
  onPlaceAsStandardOrder,
  customers,
  craftsmenList,
  onNavigateToTab
}) => {
  // View states
  const [viewMode, setViewMode] = useState<'board' | 'table' | 'clients'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');

  // Modals & Drawers
  const [selectedProspect, setSelectedProspect] = useState<ProspectOrder | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'specs' | 'confirmations' | 'media' | 'pricing' | 'timeline'>('specs');
  
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<ProspectOrder | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'client' | 'materials' | 'sizing_design' | 'pricing' | 'confirmations'>('client');

  // Convert to Order Modal
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertTargetProspect, setConvertTargetProspect] = useState<ProspectOrder | null>(null);
  const [convertOrderType, setConvertOrderType] = useState<'bespoke' | 'standard'>('bespoke');
  const [convertCraftsmanId, setConvertCraftsmanId] = useState('CRF-01');
  const [convertAdvanceAmount, setConvertAdvanceAmount] = useState<number>(0);
  const [convertAdvanceMethod, setConvertAdvanceMethod] = useState<'UPI' | 'Bank Transfer' | 'Credit Card' | 'Cash'>('Bank Transfer');
  const [convertTotalAmount, setConvertTotalAmount] = useState<number>(0);
  const [convertSpecialNotes, setConvertSpecialNotes] = useState('');

  // Quick activity note
  const [newActivityNote, setNewActivityNote] = useState('');
  const [newActivityType, setNewActivityType] = useState<'note' | 'call' | 'whatsapp' | 'meeting'>('whatsapp');

  // Form state for Add/Edit
  const [formData, setFormData] = useState<Partial<ProspectOrder>>({
    title: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerCity: '',
    leadSource: 'Private Atelier VIP Consultation',
    priority: 'High',
    category: 'Rings',
    status: 'gathering_info',
    targetBudget: 250000,
    estimatedQuote: 275000,
    advanceRequired: 75000,
    advanceReceived: 0,
    advancePaymentMethod: 'Pending',
    targetDeliveryDate: '',
    occasion: '',
    metalPreference: {
      type: 'Gold',
      purity: '18K Yellow Gold',
      color: 'Yellow',
      estWeightGrams: 8.5,
      isConfirmed: false,
      notes: ''
    },
    gemstoneDetails: {
      primaryStone: 'Natural Diamond',
      stoneType: 'natural',
      caratWeight: 1.5,
      cutShape: 'Round Brilliant',
      accentStones: 'Pavé diamond halo',
      isConfirmed: false,
      notes: ''
    },
    sizingDetails: {
      ringSize: '',
      wristSize: '',
      length: '',
      isConfirmed: false,
      notes: ''
    },
    designDetails: {
      sketchApproved: false,
      cadRenderApproved: false,
      engravingText: '',
      specifications: '',
      samplePhotos: [],
      notes: ''
    },
    confirmations: DEFAULT_CONFIRMATIONS,
    assignedCraftsmanId: 'CRF-01',
    assignedCraftsmanName: 'Master Hiroshi',
    nextFollowUpDate: ''
  });

  const [photoInputUrl, setPhotoInputUrl] = useState('');

  // Calculations
  const filteredProspects = useMemo(() => {
    return prospects.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        p.title.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.gemstoneDetails?.primaryStone && p.gemstoneDetails.primaryStone.toLowerCase().includes(q)) ||
        (p.customerCity && p.customerCity.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesPriority = priorityFilter === 'all' || p.priority === priorityFilter;
      const matchesClient = clientFilter === 'all' || p.customerName === clientFilter || p.customerId === clientFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesClient;
    });
  }, [prospects, searchQuery, statusFilter, categoryFilter, priorityFilter, clientFilter]);

  const metrics = useMemo(() => {
    const active = prospects.filter(p => p.status !== 'converted_to_order' && p.status !== 'dropped');
    const totalPipelineValue = active.reduce((sum, p) => sum + (p.estimatedQuote || p.targetBudget || 0), 0);
    
    let totalPendingConfirmations = 0;
    active.forEach(p => {
      p.confirmations.forEach(c => {
        if (!c.isConfirmed) totalPendingConfirmations++;
      });
    });

    const readyToOrderCount = active.filter(p => {
      const confirmedCount = p.confirmations.filter(c => c.isConfirmed).length;
      return confirmedCount >= 5 || p.status === 'ready_to_order';
    }).length;

    const convertedCount = prospects.filter(p => p.status === 'converted_to_order').length;

    return {
      activeCount: active.length,
      totalPipelineValue,
      totalPendingConfirmations,
      readyToOrderCount,
      convertedCount
    };
  }, [prospects]);

  // Open Add Modal for a specific Customer
  const handleOpenAddForCustomer = (cust: { id?: string; name: string; email?: string; phone?: string; location?: string; area?: string; leadSource?: string }) => {
    setEditingProspect(null);
    setFormData({
      title: '',
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone || '',
      customerEmail: cust.email || '',
      customerCity: cust.area ? `${cust.area}, ${cust.location || ''}` : (cust.location || ''),
      leadSource: cust.leadSource || 'Clientele Directory',
      priority: 'High',
      category: 'Rings',
      status: 'gathering_info',
      targetBudget: 350000,
      estimatedQuote: 380000,
      advanceRequired: 100000,
      advanceReceived: 0,
      advancePaymentMethod: 'Pending',
      targetDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      occasion: 'Commission / Special Order',
      metalPreference: {
        type: 'Gold',
        purity: '18K Yellow Gold',
        color: 'Yellow',
        estWeightGrams: 10.0,
        isConfirmed: false,
        notes: ''
      },
      gemstoneDetails: {
        primaryStone: 'Natural Diamond',
        stoneType: 'natural',
        caratWeight: 1.5,
        cutShape: 'Round Brilliant',
        accentStones: '',
        isConfirmed: false,
        notes: ''
      },
      sizingDetails: {
        ringSize: 'US 6.0',
        wristSize: '',
        length: '',
        isConfirmed: false,
        notes: ''
      },
      designDetails: {
        sketchApproved: false,
        cadRenderApproved: false,
        engravingText: '',
        specifications: '',
        samplePhotos: [],
        notes: ''
      },
      confirmations: DEFAULT_CONFIRMATIONS.map(c => ({ ...c })),
      assignedCraftsmanId: 'CRF-01',
      assignedCraftsmanName: 'Master Hiroshi',
      nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setActiveFormTab('client');
    setIsAddEditModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingProspect(null);
    setFormData({
      title: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      customerCity: '',
      leadSource: 'Private Atelier VIP Consultation',
      priority: 'High',
      category: 'Rings',
      status: 'gathering_info',
      targetBudget: 250000,
      estimatedQuote: 275000,
      advanceRequired: 75000,
      advanceReceived: 0,
      advancePaymentMethod: 'Pending',
      targetDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      occasion: 'Anniversary / Commission',
      metalPreference: {
        type: 'Gold',
        purity: '18K Yellow Gold',
        color: 'Yellow',
        estWeightGrams: 8.5,
        isConfirmed: false,
        notes: 'Debating between 18K Yellow vs 18K Rose Gold'
      },
      gemstoneDetails: {
        primaryStone: 'Natural Diamond',
        stoneType: 'natural',
        caratWeight: 1.5,
        cutShape: 'Round Brilliant',
        accentStones: 'Pavé diamond halo',
        isConfirmed: false,
        notes: 'Client exploring VVS2 clarity stones'
      },
      sizingDetails: {
        ringSize: 'US 6.0',
        wristSize: '',
        length: '',
        isConfirmed: false,
        notes: 'Awaiting exact ring sizer measurement'
      },
      designDetails: {
        sketchApproved: false,
        cadRenderApproved: false,
        engravingText: '',
        specifications: 'Custom high-jewelry solitaire setting with micro-pavé bridge and platinum prongs.',
        samplePhotos: [
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800'
        ],
        notes: ''
      },
      confirmations: DEFAULT_CONFIRMATIONS.map(c => ({ ...c })),
      assignedCraftsmanId: 'CRF-01',
      assignedCraftsmanName: 'Master Hiroshi',
      nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setActiveFormTab('client');
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (p: ProspectOrder) => {
    setEditingProspect(p);
    setFormData({
      ...p,
      confirmations: p.confirmations || DEFAULT_CONFIRMATIONS.map(c => ({ ...c }))
    });
    setActiveFormTab('client');
    setIsAddEditModalOpen(true);
  };

  // Save Add/Edit
  const handleSaveProspect = () => {
    if (!formData.title || !formData.customerName) {
      alert('Please provide a Prospect Title and Customer Name.');
      return;
    }

    const nowStr = new Date().toISOString().split('T')[0];

    if (editingProspect) {
      const updated: Partial<ProspectOrder> = {
        ...formData,
        updatedAt: nowStr
      };
      onUpdateProspect(editingProspect.id, updated);
      if (selectedProspect && selectedProspect.id === editingProspect.id) {
        setSelectedProspect({ ...selectedProspect, ...updated } as ProspectOrder);
      }
    } else {
      const newId = `PROSP-${new Date().getFullYear()}-${String(prospects.length + 1).padStart(3, '0')}`;
      const newProspect: ProspectOrder = {
        id: newId,
        title: formData.title || 'Untitled Prospect Commission',
        customerName: formData.customerName || 'Private Client',
        customerPhone: formData.customerPhone || '',
        customerEmail: formData.customerEmail || '',
        customerCity: formData.customerCity || '',
        leadSource: formData.leadSource || 'Direct Inquiry',
        priority: formData.priority || 'Standard',
        category: formData.category || 'Rings',
        status: formData.status || 'gathering_info',
        targetBudget: Number(formData.targetBudget || 0),
        estimatedQuote: Number(formData.estimatedQuote || 0),
        advanceRequired: Number(formData.advanceRequired || 0),
        advanceReceived: Number(formData.advanceReceived || 0),
        advancePaymentMethod: formData.advancePaymentMethod || 'Pending',
        targetDeliveryDate: formData.targetDeliveryDate || '',
        occasion: formData.occasion || '',
        metalPreference: formData.metalPreference || {
          type: 'Gold',
          purity: '18K',
          color: 'Yellow',
          estWeightGrams: 0,
          isConfirmed: false
        },
        gemstoneDetails: formData.gemstoneDetails || {
          primaryStone: '',
          stoneType: 'natural',
          caratWeight: 0,
          cutShape: '',
          isConfirmed: false
        },
        sizingDetails: formData.sizingDetails || {
          ringSize: '',
          isConfirmed: false
        },
        designDetails: formData.designDetails || {
          sketchApproved: false,
          cadRenderApproved: false,
          specifications: '',
          samplePhotos: []
        },
        confirmations: formData.confirmations || DEFAULT_CONFIRMATIONS.map(c => ({ ...c })),
        nextFollowUpDate: formData.nextFollowUpDate || '',
        assignedCraftsmanId: formData.assignedCraftsmanId || 'CRF-01',
        assignedCraftsmanName: formData.assignedCraftsmanName || 'Master Hiroshi',
        activityLog: [
          {
            id: `act-${Date.now()}`,
            date: nowStr,
            type: 'note',
            text: `Prospect record created in Atelier Pipeline. Initial target budget: ₹${(formData.targetBudget || 0).toLocaleString()}.`,
            author: 'Studio Desk'
          }
        ],
        createdAt: nowStr,
        updatedAt: nowStr
      };
      onAddProspect(newProspect);
    }

    setIsAddEditModalOpen(false);
  };

  // Toggle single confirmation item
  const handleToggleConfirmation = (prospect: ProspectOrder, key: PendingConfirmationKey) => {
    const nowStr = new Date().toISOString().split('T')[0];
    const updatedConfirmations = prospect.confirmations.map(c => {
      if (c.key === key) {
        const nextState = !c.isConfirmed;
        return {
          ...c,
          isConfirmed: nextState,
          confirmedAt: nextState ? nowStr : undefined,
          confirmedBy: nextState ? 'Atelier Lead' : undefined
        };
      }
      return c;
    });

    // Auto update status if all/most confirmed
    const confirmedCount = updatedConfirmations.filter(c => c.isConfirmed).length;
    let nextStatus = prospect.status;
    if (confirmedCount === updatedConfirmations.length && prospect.status !== 'converted_to_order') {
      nextStatus = 'ready_to_order';
    } else if (confirmedCount > 0 && prospect.status === 'gathering_info') {
      nextStatus = 'pending_confirmation';
    }

    const activityEntry = {
      id: `act-${Date.now()}`,
      date: nowStr,
      type: 'confirmation_toggle' as const,
      text: `Updated confirmation: "${prospect.confirmations.find(c => c.key === key)?.label}" is now marked as ${!prospect.confirmations.find(c => c.key === key)?.isConfirmed ? 'CONFIRMED' : 'PENDING'}.`,
      author: 'Studio Manager'
    };

    const updates: Partial<ProspectOrder> = {
      confirmations: updatedConfirmations,
      status: nextStatus,
      activityLog: [activityEntry, ...(prospect.activityLog || [])],
      updatedAt: nowStr
    };

    onUpdateProspect(prospect.id, updates);
    if (selectedProspect && selectedProspect.id === prospect.id) {
      setSelectedProspect({ ...selectedProspect, ...updates } as ProspectOrder);
    }
  };

  // Add activity note
  const handleAddActivityNote = () => {
    if (!selectedProspect || !newActivityNote.trim()) return;
    const nowStr = new Date().toISOString().split('T')[0];
    const newEntry = {
      id: `act-${Date.now()}`,
      date: nowStr,
      type: newActivityType,
      text: newActivityNote.trim(),
      author: 'Studio Lead'
    };

    const updatedLog = [newEntry, ...(selectedProspect.activityLog || [])];
    onUpdateProspect(selectedProspect.id, {
      activityLog: updatedLog,
      updatedAt: nowStr
    });
    setSelectedProspect({
      ...selectedProspect,
      activityLog: updatedLog,
      updatedAt: nowStr
    });
    setNewActivityNote('');
  };

  // Open Convert to Order Modal
  const handleOpenConvertModal = (p: ProspectOrder) => {
    setConvertTargetProspect(p);
    setConvertOrderType('bespoke');
    setConvertCraftsmanId(p.assignedCraftsmanId || 'CRF-01');
    setConvertTotalAmount(p.estimatedQuote || p.targetBudget || 350000);
    setConvertAdvanceAmount(p.advanceReceived || p.advanceRequired || 100000);
    setConvertAdvanceMethod((p.advancePaymentMethod as any) || 'Bank Transfer');
    setConvertSpecialNotes(p.designDetails?.specifications || '');
    setIsConvertModalOpen(true);
  };

  // Execute conversion to Order
  const handleExecuteOrderConversion = () => {
    if (!convertTargetProspect) return;
    const p = convertTargetProspect;
    const nowStr = new Date().toISOString().split('T')[0];

    const artisan = craftsmenList.find(c => c.id === convertCraftsmanId) || { id: 'CRF-01', name: 'Master Hiroshi' };

    if (convertOrderType === 'bespoke') {
      const bespokeData: Partial<BespokeOrder> = {
        customerName: p.customerName,
        customerEmail: p.customerEmail || 'client@atelier.lumora.com',
        customerPhone: p.customerPhone || '',
        craftsmanId: artisan.id,
        craftsmanName: artisan.name,
        metalType: p.metalPreference?.type || 'Gold',
        metalPurity: p.metalPreference?.purity || '18K',
        metalWeight: p.metalPreference?.estWeightGrams || 12.0,
        metalCostPerGram: 6200,
        stones: [
          {
            id: `st-${Date.now()}`,
            name: p.gemstoneDetails?.primaryStone || 'Fine Gemstone',
            weight: p.gemstoneDetails?.caratWeight || 1.5,
            unit: 'ct',
            unitCost: Math.round((convertTotalAmount * 0.45) / Math.max(1, p.gemstoneDetails?.caratWeight || 1))
          }
        ],
        diamonds: [
          {
            id: `dm-${Date.now()}`,
            name: p.gemstoneDetails?.accentStones || 'Pavé Diamonds',
            weight: 0.8,
            unit: 'ct',
            unitCost: 45000
          }
        ],
        makingCostPerGram: 950,
        additionalExpenses: 3500,
        specifications: `${p.title} • ${convertSpecialNotes || p.designDetails?.specifications || ''} • Ring/Sizing: ${p.sizingDetails?.ringSize || p.sizingDetails?.length || 'Custom fit'} • Engraving: "${p.designDetails?.engravingText || 'None'}"`,
        samplePhotos: p.designDetails?.samplePhotos && p.designDetails.samplePhotos.length > 0 ? p.designDetails.samplePhotos : ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800'],
        totalAmount: convertTotalAmount,
        advancePaid: convertAdvanceAmount,
        status: 'In Progress',
        createdAt: nowStr
      };

      onPlaceAsBespokeOrder(p, bespokeData, convertAdvanceAmount, convertAdvanceMethod);
    } else {
      const standardOrderData = {
        customer: p.customerName,
        total: convertTotalAmount,
        status: 'In Production',
        channel: p.leadSource?.includes('Instagram') ? 'Instagram' : p.leadSource?.includes('WhatsApp') ? 'WhatsApp' : 'Offline',
        date: nowStr,
        craftsmanId: artisan.id,
        craftsmanName: artisan.name,
        specifications: `${p.title} • ${convertSpecialNotes || p.designDetails?.specifications || ''}`,
        samplePhotos: p.designDetails?.samplePhotos || []
      };

      onPlaceAsStandardOrder(p, standardOrderData, convertAdvanceAmount, convertAdvanceMethod);
    }

    setIsConvertModalOpen(false);
    setIsDetailDrawerOpen(false);
  };

  // Helper status color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'gathering_info':
        return { label: 'Information Gathering', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock size={12} /> };
      case 'pending_confirmation':
        return { label: 'Pending Confirmation', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: <AlertCircle size={12} /> };
      case 'quote_sent':
        return { label: 'Quotation Review', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: <DollarSign size={12} /> };
      case 'ready_to_order':
        return { label: 'Ready to Execute', bg: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold', icon: <Sparkles size={12} /> };
      case 'converted_to_order':
        return { label: 'Placed as Order', bg: 'bg-lumora-gold/15 text-lumora-gold border-lumora-gold/30 font-bold', icon: <ShieldCheck size={12} /> };
      case 'dropped':
        return { label: 'Archived / Dropped', bg: 'bg-gray-100 text-gray-500 border-gray-200', icon: <X size={12} /> };
      default:
        return { label: status, bg: 'bg-gray-50 text-gray-700 border-gray-200', icon: <Clock size={12} /> };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-50 text-red-600 border-red-200 font-bold';
      case 'High':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Standard':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      case 'Low':
        return 'bg-slate-50 text-slate-500 border-slate-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  // Pipeline columns for Kanban view
  const PIPELINE_STAGES: { id: string; label: string; sub: string; color: string }[] = [
    { id: 'gathering_info', label: '1. Gathering Specs', sub: 'Inspiration & metal/stone discovery', color: 'border-amber-400 bg-amber-500/10 text-amber-900' },
    { id: 'pending_confirmation', label: '2. Pending Confirmations', sub: 'Awaiting client decision or sizes', color: 'border-blue-400 bg-blue-500/10 text-blue-900' },
    { id: 'quote_sent', label: '3. Quote Sent & Review', sub: 'Pricing estimate under review', color: 'border-purple-400 bg-purple-500/10 text-purple-900' },
    { id: 'ready_to_order', label: '4. Ready to Execute', sub: 'Specs verified & ready to convert', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-900' },
    { id: 'converted_to_order', label: '5. Converted Orders', sub: 'Placed in Workshop / Order Hub', color: 'border-lumora-gold bg-lumora-gold/10 text-lumora-charcoal' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/5">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-[0.3em] bg-lumora-gold/15 text-lumora-gold px-3 py-1 rounded-sm border border-lumora-gold/30 flex items-center gap-1.5">
              <Sparkles size={12} />
              High Jewelry Atelier Pipeline
            </span>
            <span className="text-xs text-lumora-taupe font-mono">
              {metrics.activeCount} Active Commission Prospects
            </span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-lumora-charcoal tracking-tight">
            Prospect Orders & Requirement Gathering
          </h1>
          <p className="text-sm text-lumora-taupe mt-1 max-w-3xl">
            Centralized workspace to curate, gather technical specifications, track pending customer confirmations (metal, gemstones, sizing, CAD, advance), and seamlessly convert finalized prospects into active Atelier Orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-lumora-bone/80 p-1 border border-black/10 rounded-sm">
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded-sm ${viewMode === 'board' ? 'bg-white text-lumora-charcoal shadow-sm' : 'text-lumora-taupe hover:text-lumora-charcoal'}`}
              title="Kanban Board View"
            >
              <Kanban size={13} />
              Pipeline Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded-sm ${viewMode === 'table' ? 'bg-white text-lumora-charcoal shadow-sm' : 'text-lumora-taupe hover:text-lumora-charcoal'}`}
              title="Table Grid View"
            >
              <List size={13} />
              Spec Table
            </button>
            <button
              onClick={() => setViewMode('clients')}
              className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded-sm ${viewMode === 'clients' ? 'bg-white text-lumora-charcoal shadow-sm' : 'text-lumora-taupe hover:text-lumora-charcoal'}`}
              title="Group by Customer Accounts"
            >
              <Users size={13} />
              By Client
            </button>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-lumora-charcoal text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-lumora-gold shadow-md transition-all rounded-sm active:scale-95"
          >
            <Plus size={14} />
            Add Prospect Order
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 border border-black/5 rounded-sm shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-lumora-taupe">Active Pipeline</p>
              <h3 className="text-2xl font-serif font-bold text-lumora-charcoal mt-1">
                {metrics.activeCount} Prospects
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <FileText size={18} />
            </div>
          </div>
          <p className="text-[11px] text-lumora-taupe mt-3 flex items-center gap-1">
            <span className="text-lumora-gold font-bold">{metrics.convertedCount}</span> orders successfully placed this season
          </p>
        </div>

        <div className="bg-white p-5 border border-black/5 rounded-sm shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-lumora-taupe">Est. Pipeline Value</p>
              <h3 className="text-2xl font-serif font-bold text-lumora-charcoal mt-1">
                ₹{metrics.totalPipelineValue.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="text-[11px] text-emerald-700 mt-3 font-medium flex items-center gap-1">
            <Sparkles size={11} /> High-ticket bespoke commissions in progress
          </p>
        </div>

        <div className="bg-white p-5 border border-black/5 rounded-sm shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-lumora-taupe">Pending Confirmations</p>
              <h3 className="text-2xl font-serif font-bold text-blue-700 mt-1">
                {metrics.totalPendingConfirmations} Checkpoints
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <AlertCircle size={18} />
            </div>
          </div>
          <p className="text-[11px] text-blue-600 mt-3 font-medium">
            Awaiting client size, stone choice, CAD, or advance
          </p>
        </div>

        <div className="bg-white p-5 border border-black/5 rounded-sm shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-lumora-taupe">Ready to Execute</p>
              <h3 className="text-2xl font-serif font-bold text-emerald-800 mt-1">
                {metrics.readyToOrderCount} Orders
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-300">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-[11px] text-emerald-700 mt-3 font-medium">
            All details finalized • 1-click place as Bespoke Order
          </p>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white p-4 border border-black/5 rounded-sm shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lumora-taupe" />
          <input
            type="text"
            placeholder="Search by client name, jewelry title, gemstone, city, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-lumora-bone/30 border border-black/10 pl-10 pr-4 py-2 text-xs text-lumora-charcoal placeholder:text-lumora-taupe/60 focus:outline-none focus:border-lumora-gold rounded-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-lumora-taupe">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-black/10 px-3 py-1.5 text-xs text-lumora-charcoal focus:outline-none focus:border-lumora-gold rounded-sm"
            >
              <option value="all">All Stages</option>
              <option value="gathering_info">1. Gathering Specs</option>
              <option value="pending_confirmation">2. Pending Confirmations</option>
              <option value="quote_sent">3. Quote Sent</option>
              <option value="ready_to_order">4. Ready to Execute</option>
              <option value="converted_to_order">5. Converted Orders</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-lumora-taupe">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-black/10 px-3 py-1.5 text-xs text-lumora-charcoal focus:outline-none focus:border-lumora-gold rounded-sm"
            >
              <option value="all">All Categories</option>
              <option value="Rings">Rings</option>
              <option value="Necklaces">Necklaces</option>
              <option value="Earrings">Earrings</option>
              <option value="Bracelets">Bracelets</option>
              <option value="Bespoke">Bespoke Sets</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-lumora-taupe">Client:</span>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="bg-white border border-black/10 px-3 py-1.5 text-xs text-lumora-charcoal focus:outline-none focus:border-lumora-gold rounded-sm max-w-[160px] truncate"
            >
              <option value="all">All Clients ({Array.from(new Set(prospects.map(p => p.customerName))).length})</option>
              {Array.from(new Set(prospects.map(p => p.customerName))).map(cName => (
                <option key={cName} value={cName}>{cName}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-lumora-taupe">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white border border-black/10 px-3 py-1.5 text-xs text-lumora-charcoal focus:outline-none focus:border-lumora-gold rounded-sm"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Standard">Standard</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* MAIN VIEW: KANBAN BOARD */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageProspects = filteredProspects.filter(p => {
              if (stage.id === 'gathering_info') return p.status === 'gathering_info';
              if (stage.id === 'pending_confirmation') return p.status === 'pending_confirmation';
              if (stage.id === 'quote_sent') return p.status === 'quote_sent';
              if (stage.id === 'ready_to_order') return p.status === 'ready_to_order';
              if (stage.id === 'converted_to_order') return p.status === 'converted_to_order';
              return false;
            });

            return (
              <div key={stage.id} className="bg-lumora-bone/40 p-3 rounded-sm border border-black/5 min-w-[280px] flex flex-col h-full">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/10">
                  <div>
                    <h3 className="text-xs font-bold text-lumora-charcoal tracking-wide flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${stage.color.split(' ')[1]}`} />
                      {stage.label}
                    </h3>
                    <p className="text-[9px] text-lumora-taupe mt-0.5">{stage.sub}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-full border border-black/10 text-lumora-charcoal">
                    {stageProspects.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[750px] pr-1">
                  {stageProspects.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-black/10 rounded-sm bg-white/50">
                      <p className="text-[11px] text-lumora-taupe">No prospect orders</p>
                    </div>
                  ) : (
                    stageProspects.map((p) => {
                      const confirmedCount = p.confirmations.filter(c => c.isConfirmed).length;
                      const totalConfirmations = p.confirmations.length;
                      const percent = Math.round((confirmedCount / Math.max(1, totalConfirmations)) * 100);

                      return (
                        <div
                          key={p.id}
                          className="bg-white p-4 border border-black/10 rounded-sm shadow-sm hover:shadow-md transition-all group relative cursor-pointer"
                          onClick={() => {
                            setSelectedProspect(p);
                            setIsDetailDrawerOpen(true);
                          }}
                        >
                          {/* Priority and ID */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-mono text-lumora-taupe font-semibold">{p.id}</span>
                            <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${getPriorityBadge(p.priority)}`}>
                              {p.priority}
                            </span>
                          </div>

                          {/* Title & Customer */}
                          <h4 className="text-sm font-bold text-lumora-charcoal group-hover:text-lumora-gold transition-colors line-clamp-1">
                            {p.title}
                          </h4>
                          <p className="text-xs text-lumora-taupe mt-0.5 flex items-center gap-1">
                            <User size={11} className="text-lumora-gold" />
                            <span className="font-medium text-lumora-charcoal">{p.customerName}</span>
                            {p.customerCity && <span>• {p.customerCity}</span>}
                          </p>

                          {/* Image preview if exists */}
                          {p.designDetails?.samplePhotos && p.designDetails.samplePhotos.length > 0 && (
                            <div className="mt-3 relative h-28 w-full bg-lumora-bone/40 rounded-sm overflow-hidden border border-black/5">
                              <img
                                src={p.designDetails.samplePhotos[0]}
                                alt={p.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-xs">
                                {p.category}
                              </div>
                            </div>
                          )}

                          {/* Specifications snippet */}
                          <div className="mt-3 bg-lumora-bone/30 p-2 rounded-xs border border-black/5 text-[11px] space-y-1">
                            <div className="flex items-center justify-between text-lumora-charcoal">
                              <span className="text-lumora-taupe">Metal:</span>
                              <span className="font-medium">{p.metalPreference?.purity || '18K Gold'}</span>
                            </div>
                            <div className="flex items-center justify-between text-lumora-charcoal">
                              <span className="text-lumora-taupe">Gemstone:</span>
                              <span className="font-medium truncate max-w-[140px]">{p.gemstoneDetails?.primaryStone || 'Diamonds'}</span>
                            </div>
                            {p.sizingDetails?.ringSize && (
                              <div className="flex items-center justify-between text-lumora-charcoal">
                                <span className="text-lumora-taupe">Size:</span>
                                <span className="font-medium">{p.sizingDetails.ringSize}</span>
                              </div>
                            )}
                          </div>

                          {/* Confirmation checklist progress */}
                          <div className="mt-3 pt-2 border-t border-black/5">
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="font-bold text-lumora-charcoal flex items-center gap-1">
                                <CheckSquare size={11} className={confirmedCount === totalConfirmations ? 'text-emerald-600' : 'text-lumora-gold'} />
                                Confirmations
                              </span>
                              <span className="font-mono text-lumora-taupe font-bold">
                                {confirmedCount}/{totalConfirmations} ({percent}%)
                              </span>
                            </div>
                            <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${percent === 100 ? 'bg-emerald-500' : percent >= 60 ? 'bg-lumora-gold' : 'bg-amber-400'}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>

                            {/* Pending items tags */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {p.confirmations.filter(c => !c.isConfirmed).slice(0, 2).map(c => (
                                <span key={c.key} className="text-[8px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-xs truncate max-w-[190px]">
                                  ⚠️ Pending: {c.label.split(' ')[0]}
                                </span>
                              ))}
                              {p.confirmations.filter(c => !c.isConfirmed).length > 2 && (
                                <span className="text-[8px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-xs">
                                  +{p.confirmations.filter(c => !c.isConfirmed).length - 2} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Pricing & Footer Actions */}
                          <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between">
                            <div>
                              <p className="text-[9px] uppercase tracking-wider text-lumora-taupe">Quote Estimate</p>
                              <p className="text-xs font-bold text-lumora-charcoal font-serif">
                                ₹{(p.estimatedQuote || p.targetBudget || 0).toLocaleString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {p.status === 'ready_to_order' ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenConvertModal(p);
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-sm shadow-xs flex items-center gap-1 active:scale-95 transition-all"
                                  title="Place as Atelier Order"
                                >
                                  <Sparkles size={11} /> Place Order
                                </button>
                              ) : p.status === 'converted_to_order' ? (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-lumora-gold bg-lumora-gold/10 px-2 py-1 rounded-sm border border-lumora-gold/20 flex items-center gap-1">
                                  <ShieldCheck size={11} /> {p.convertedOrderId || 'Ordered'}
                                </span>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProspect(p);
                                    setIsDetailDrawerOpen(true);
                                  }}
                                  className="text-lumora-charcoal hover:text-lumora-gold text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"
                                >
                                  Details <ChevronRight size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MASTER SPEC TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white border border-black/5 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/10 bg-lumora-bone/40 text-[9px] font-bold uppercase tracking-[0.15em] text-lumora-taupe">
                  <th className="py-3.5 px-4">Prospect Commission</th>
                  <th className="py-3.5 px-4">Client & Contact</th>
                  <th className="py-3.5 px-4">Material Specs</th>
                  <th className="py-3.5 px-4">Sizing / Measurements</th>
                  <th className="py-3.5 px-4">Checkpoints</th>
                  <th className="py-3.5 px-4">Quote & Budget</th>
                  <th className="py-3.5 px-4">Stage Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-xs">
                {filteredProspects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-lumora-taupe">
                      No prospect orders match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredProspects.map((p) => {
                    const badge = getStatusBadge(p.status);
                    const confirmedCount = p.confirmations.filter(c => c.isConfirmed).length;
                    const totalCount = p.confirmations.length;

                    return (
                      <tr 
                        key={p.id} 
                        className="hover:bg-lumora-bone/20 transition-colors cursor-pointer group"
                        onClick={() => {
                          setSelectedProspect(p);
                          setIsDetailDrawerOpen(true);
                        }}
                      >
                        {/* Prospect title & ID */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {p.designDetails?.samplePhotos && p.designDetails.samplePhotos[0] ? (
                              <img
                                src={p.designDetails.samplePhotos[0]}
                                alt={p.title}
                                className="w-10 h-10 object-cover rounded-xs border border-black/10 flex-shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xs bg-lumora-bone flex items-center justify-center text-lumora-taupe border border-black/10 flex-shrink-0">
                                <Diamond size={16} />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-lumora-charcoal group-hover:text-lumora-gold transition-colors">
                                {p.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-mono text-lumora-taupe">{p.id}</span>
                                <span className="text-[9px] bg-black/5 text-lumora-charcoal px-1.5 py-0.2 rounded-xs font-semibold">
                                  {p.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-lumora-charcoal">{p.customerName}</p>
                          <p className="text-[11px] text-lumora-taupe">{p.customerPhone || p.customerEmail || 'Private VIP'}</p>
                        </td>

                        {/* Specs */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5 text-[11px]">
                            <p className="text-lumora-charcoal font-medium">
                              {p.metalPreference?.purity || '18K Gold'} ({p.metalPreference?.estWeightGrams || '10'}g)
                            </p>
                            <p className="text-lumora-taupe truncate max-w-[180px]">
                              {p.gemstoneDetails?.primaryStone || 'Diamonds'}
                            </p>
                          </div>
                        </td>

                        {/* Sizing */}
                        <td className="py-3.5 px-4">
                          <div className="text-[11px]">
                            {p.sizingDetails?.ringSize ? (
                              <span className="font-medium text-lumora-charcoal">{p.sizingDetails.ringSize}</span>
                            ) : p.sizingDetails?.length ? (
                              <span className="font-medium text-lumora-charcoal">{p.sizingDetails.length}</span>
                            ) : (
                              <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-xs border border-amber-200 text-[10px]">
                                Pending Fit
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Checkpoints */}
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-bold text-lumora-charcoal">
                              {confirmedCount}/{totalCount}
                            </span>
                            <div className="flex items-center gap-1">
                              {p.confirmations.map(c => (
                                <button
                                  key={c.key}
                                  onClick={() => handleToggleConfirmation(p, c.key)}
                                  className={`w-4 h-4 rounded-xs flex items-center justify-center transition-all ${c.isConfirmed ? 'bg-emerald-500 text-white' : 'bg-black/10 text-transparent hover:bg-black/20'}`}
                                  title={`${c.label}: ${c.isConfirmed ? 'CONFIRMED' : 'PENDING'}`}
                                >
                                  <Check size={10} />
                                </button>
                              ))}
                            </div>
                          </div>
                        </td>

                        {/* Quote */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-lumora-charcoal font-serif">
                            ₹{(p.estimatedQuote || p.targetBudget || 0).toLocaleString()}
                          </p>
                          {p.advanceReceived > 0 ? (
                            <span className="text-[10px] text-emerald-700 font-medium">
                              ₹{p.advanceReceived.toLocaleString()} Adv Paid
                            </span>
                          ) : (
                            <span className="text-[10px] text-lumora-taupe">
                              Adv Req: ₹{(p.advanceRequired || 0).toLocaleString()}
                            </span>
                          )}
                        </td>

                        {/* Stage */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-sm border ${badge.bg}`}>
                            {badge.icon}
                            {badge.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {p.status === 'ready_to_order' ? (
                              <button
                                onClick={() => handleOpenConvertModal(p)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm shadow-xs flex items-center gap-1"
                              >
                                <Sparkles size={12} /> Place Order
                              </button>
                            ) : p.status === 'converted_to_order' ? (
                              <span className="text-[10px] text-lumora-gold font-bold">
                                {p.convertedOrderId}
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedProspect(p);
                                  setIsDetailDrawerOpen(true);
                                }}
                                className="p-1.5 text-lumora-taupe hover:text-lumora-charcoal border border-black/10 rounded-sm hover:bg-white"
                                title="View Details"
                              >
                                <Eye size={13} />
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1.5 text-lumora-taupe hover:text-lumora-charcoal border border-black/10 rounded-sm hover:bg-white"
                              title="Edit Prospect"
                            >
                              <Edit3 size={13} />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete prospect "${p.title}"?`)) {
                                  onDeleteProspect(p.id);
                                }
                              }}
                              className="p-1.5 text-lumora-taupe hover:text-red-600 border border-black/10 rounded-sm hover:bg-white"
                              title="Delete Prospect"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* GROUP BY CLIENT VIEW */}
      {viewMode === 'clients' && (
        <div className="space-y-6">
          {(() => {
            // Group filtered prospects by customerName
            const clientGroups: { [cName: string]: ProspectOrder[] } = {};
            filteredProspects.forEach(p => {
              const key = p.customerName || 'Unknown Client';
              if (!clientGroups[key]) clientGroups[key] = [];
              clientGroups[key].push(p);
            });

            // Also include customers who might not have active filtered prospects if search is empty
            if (searchQuery === '' && statusFilter === 'all' && categoryFilter === 'all' && clientFilter === 'all') {
              customers.forEach(c => {
                if (!clientGroups[c.name]) {
                  clientGroups[c.name] = prospects.filter(p => p.customerName === c.name || p.customerId === c.id);
                }
              });
            }

            const clientNames = Object.keys(clientGroups).sort((a, b) => clientGroups[b].length - clientGroups[a].length);

            if (clientNames.length === 0) {
              return (
                <div className="text-center py-16 bg-white border border-black/10 rounded-sm">
                  <Users size={32} className="mx-auto text-lumora-taupe mb-3" />
                  <h3 className="text-base font-serif font-bold text-lumora-charcoal">No Client Accounts Found</h3>
                  <p className="text-xs text-lumora-taupe mt-1">Try adjusting your filters or search query.</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 gap-6">
                {clientNames.map(clientName => {
                  const clientProspects = clientGroups[clientName] || [];
                  const matchingCustomer = customers.find(c => c.name.toLowerCase() === clientName.toLowerCase() || (clientProspects[0] && clientProspects[0].customerId === c.id));
                  const activeEnquiries = clientProspects.filter(p => p.status !== 'converted_to_order' && p.status !== 'dropped');
                  const convertedEnquiries = clientProspects.filter(p => p.status === 'converted_to_order');
                  const totalClientPipeline = clientProspects.reduce((sum, p) => sum + (p.estimatedQuote || p.targetBudget || 0), 0);
                  const totalClientAdvance = clientProspects.reduce((sum, p) => sum + (p.advanceReceived || 0), 0);

                  return (
                    <div key={clientName} className="bg-white border border-black/10 rounded-sm shadow-xs overflow-hidden transition-all hover:border-lumora-gold/40">
                      {/* Client Header Banner */}
                      <div className="p-5 bg-lumora-bone/30 border-b border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-lumora-charcoal text-lumora-gold flex items-center justify-center font-serif text-lg font-bold border border-lumora-gold/30 flex-shrink-0">
                            {clientName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-serif font-bold text-lumora-charcoal">
                                {clientName}
                              </h3>
                              {matchingCustomer?.status && (
                                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-lumora-gold/15 text-lumora-gold border border-lumora-gold/30">
                                  {matchingCustomer.status} Tier
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-lumora-taupe bg-white px-2.5 py-0.5 rounded-sm border border-black/10">
                                {clientProspects.length} Total {clientProspects.length === 1 ? 'Enquiry' : 'Enquiries'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-lumora-taupe mt-1 flex-wrap">
                              {(matchingCustomer?.phone || clientProspects[0]?.customerPhone) && (
                                <span className="flex items-center gap-1">
                                  <Phone size={11} className="text-lumora-gold" />
                                  {matchingCustomer?.phone || clientProspects[0]?.customerPhone}
                                </span>
                              )}
                              {(matchingCustomer?.email || clientProspects[0]?.customerEmail) && (
                                <span className="flex items-center gap-1">
                                  <Mail size={11} className="text-lumora-gold" />
                                  {matchingCustomer?.email || clientProspects[0]?.customerEmail}
                                </span>
                              )}
                              {(matchingCustomer?.area || matchingCustomer?.location || clientProspects[0]?.customerCity) && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={11} className="text-lumora-gold" />
                                  {matchingCustomer?.area ? `${matchingCustomer.area}, ${matchingCustomer.location || ''}` : (matchingCustomer?.location || clientProspects[0]?.customerCity)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Pipeline Stats & Quick Add Button */}
                        <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                          <div className="text-right pr-4 border-r border-black/10 hidden md:block">
                            <p className="text-[9px] uppercase font-bold tracking-wider text-lumora-taupe">Total Pipeline Value</p>
                            <p className="text-sm font-serif font-bold text-lumora-gold">₹{totalClientPipeline.toLocaleString()}</p>
                            {totalClientAdvance > 0 && (
                              <p className="text-[10px] font-mono text-emerald-700 font-bold">₹{totalClientAdvance.toLocaleString()} Advance Paid</p>
                            )}
                          </div>

                          <button
                            onClick={() => handleOpenAddForCustomer({
                              id: matchingCustomer?.id || clientProspects[0]?.customerId,
                              name: clientName,
                              email: matchingCustomer?.email || clientProspects[0]?.customerEmail,
                              phone: matchingCustomer?.phone || clientProspects[0]?.customerPhone,
                              location: matchingCustomer?.location,
                              area: matchingCustomer?.area || clientProspects[0]?.customerCity,
                              leadSource: matchingCustomer?.leadSource || clientProspects[0]?.leadSource
                            })}
                            className="flex items-center gap-1.5 bg-lumora-charcoal text-white hover:bg-lumora-gold text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-sm shadow-xs transition-all flex-shrink-0"
                            title={`Add another prospect enquiry for ${clientName}`}
                          >
                            <Plus size={13} />
                            Add Enquiry for {clientName.split(' ')[0]}
                          </button>
                        </div>
                      </div>

                      {/* Client Enquiries List */}
                      {clientProspects.length > 0 ? (
                        <div className="divide-y divide-black/5">
                          {clientProspects.map((p) => {
                            const confirmedCount = p.confirmations ? p.confirmations.filter(c => c.isConfirmed).length : 0;
                            const totalCount = p.confirmations ? p.confirmations.length : 7;
                            const progressPercent = Math.round((confirmedCount / totalCount) * 100);

                            return (
                              <div key={p.id} className="p-4 sm:p-5 hover:bg-lumora-bone/20 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-mono font-bold text-lumora-taupe">{p.id}</span>
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${getStatusBadge(p.status).bg}`}>
                                      {getStatusBadge(p.status).label}
                                    </span>
                                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-lumora-bone text-lumora-taupe border border-black/5">
                                      {p.category}
                                    </span>
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${getPriorityBadge(p.priority)}`}>
                                      {p.priority}
                                    </span>
                                  </div>

                                  <h4 className="text-sm font-serif font-bold text-lumora-charcoal hover:text-lumora-gold cursor-pointer transition-colors" onClick={() => { setSelectedProspect(p); setIsDetailDrawerOpen(true); }}>
                                    {p.title}
                                  </h4>

                                  <div className="flex items-center gap-4 text-[11px] text-lumora-taupe flex-wrap">
                                    {p.metalPreference && (
                                      <span>Metal: <strong className="text-lumora-charcoal">{p.metalPreference.purity || p.metalPreference.type}</strong> ({p.metalPreference.estWeightGrams}g)</span>
                                    )}
                                    {p.gemstoneDetails && (
                                      <span>Gemstone: <strong className="text-lumora-charcoal">{p.gemstoneDetails.primaryStone || 'Diamonds'}</strong> ({p.gemstoneDetails.caratWeight}ct)</span>
                                    )}
                                    {p.targetDeliveryDate && (
                                      <span>Target: <strong className="text-lumora-charcoal">{p.targetDeliveryDate}</strong></span>
                                    )}
                                  </div>
                                </div>

                                {/* Confirmation Checklist Progress & Quotation */}
                                <div className="flex items-center gap-6 flex-shrink-0">
                                  <div className="w-36 space-y-1">
                                    <div className="flex justify-between items-center text-[10px]">
                                      <span className="text-lumora-taupe font-medium">Verified Specs</span>
                                      <span className="font-bold font-mono text-lumora-charcoal">{confirmedCount}/{totalCount}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full transition-all duration-500 ${progressPercent >= 80 ? 'bg-emerald-600' : progressPercent >= 40 ? 'bg-lumora-gold' : 'bg-amber-500'}`}
                                        style={{ width: `${progressPercent}%` }}
                                      />
                                    </div>
                                  </div>

                                  <div className="text-right min-w-[110px]">
                                    <p className="text-[9px] uppercase font-bold text-lumora-taupe">Estimated Quote</p>
                                    <p className="text-sm font-serif font-bold text-lumora-charcoal">₹{(p.estimatedQuote || p.targetBudget || 0).toLocaleString()}</p>
                                    {p.advanceReceived > 0 && (
                                      <p className="text-[10px] text-emerald-700 font-mono font-bold">₹{p.advanceReceived.toLocaleString()} Adv</p>
                                    )}
                                  </div>

                                  {/* Quick Action Buttons */}
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => { setSelectedProspect(p); setIsDetailDrawerOpen(true); }}
                                      className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-black/10 rounded-sm hover:bg-lumora-bone text-lumora-charcoal flex items-center gap-1"
                                      title="Open Full Spec Drawer"
                                    >
                                      <Eye size={12} /> View Specs
                                    </button>

                                    {p.status !== 'converted_to_order' ? (
                                      <button
                                        onClick={() => handleOpenConvertModal(p)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-xs flex items-center gap-1"
                                        title="Place as Atelier Order"
                                      >
                                        <Sparkles size={12} /> Finalize
                                      </button>
                                    ) : (
                                      <span className="text-[10px] font-bold text-lumora-gold flex items-center gap-1 bg-lumora-gold/10 px-2 py-1 rounded-sm border border-lumora-gold/20">
                                        <CheckCircle2 size={12} /> #{p.convertedOrderId}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-lumora-taupe bg-lumora-bone/10">
                          No active enquiries for this client yet.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}


      {/* 360° PROSPECT DETAIL DRAWER / MODAL */}
      {isDetailDrawerOpen && selectedProspect && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="bg-white w-full max-w-3xl h-full shadow-2xl flex flex-col animate-slideLeft overflow-hidden">
            {/* Drawer Header */}
            <div className="p-6 border-b border-black/10 bg-lumora-bone/30 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-lumora-taupe">{selectedProspect.id}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${getPriorityBadge(selectedProspect.priority)}`}>
                    {selectedProspect.priority} Priority
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${getStatusBadge(selectedProspect.status).bg}`}>
                    {getStatusBadge(selectedProspect.status).label}
                  </span>
                </div>
                <h2 className="text-xl font-serif font-bold text-lumora-charcoal">
                  {selectedProspect.title}
                </h2>
                <p className="text-xs text-lumora-taupe mt-0.5 flex items-center gap-2">
                  <span>Client: <strong className="text-lumora-charcoal">{selectedProspect.customerName}</strong></span>
                  {selectedProspect.customerCity && <span>• {selectedProspect.customerCity}</span>}
                  {selectedProspect.occasion && <span>• Occasion: <strong className="text-lumora-charcoal">{selectedProspect.occasion}</strong></span>}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedProspect.status !== 'converted_to_order' && (
                  <button
                    onClick={() => handleOpenConvertModal(selectedProspect)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-sm shadow-sm flex items-center gap-1.5"
                  >
                    <Sparkles size={13} /> Finalize & Place Order
                  </button>
                )}
                <button
                  onClick={() => setIsDetailDrawerOpen(false)}
                  className="p-2 text-lumora-taupe hover:text-lumora-charcoal rounded-sm hover:bg-black/5"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs in Drawer */}
            <div className="flex border-b border-black/10 bg-white px-6">
              {[
                { id: 'specs', label: 'Technical Specs', icon: <Layers size={13} /> },
                { id: 'confirmations', label: 'Pending Confirmations', icon: <CheckSquare size={13} /> },
                { id: 'client_enquiries', label: `Client Enquiries (${prospects.filter(p => p.customerName === selectedProspect.customerName || (selectedProspect.customerId && p.customerId === selectedProspect.customerId)).length})`, icon: <Users size={13} /> },
                { id: 'media', label: 'Sketches & Photos', icon: <Diamond size={13} /> },
                { id: 'pricing', label: 'Pricing & Advance', icon: <DollarSign size={13} /> },
                { id: 'timeline', label: 'Activity Log', icon: <Clock size={13} /> },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setDrawerTab(t.id as any)}
                  className={`flex items-center gap-2 py-3 px-4 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${drawerTab === t.id ? 'border-lumora-gold text-lumora-gold font-bold' : 'border-transparent text-lumora-taupe hover:text-lumora-charcoal'}`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Drawer Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* TAB: CLIENT ENQUIRIES & SIBLING ORDERS */}
              {drawerTab === 'client_enquiries' && (
                <div className="space-y-6">
                  {/* Client Overview Card */}
                  <div className="p-5 bg-lumora-bone/40 rounded-sm border border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-serif font-bold text-lumora-charcoal">
                          {selectedProspect.customerName}
                        </h3>
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-lumora-gold/15 text-lumora-gold border border-lumora-gold/30">
                          Client Portfolio
                        </span>
                      </div>
                      <p className="text-xs text-lumora-taupe mt-1">
                        Viewing all active, pending, and converted enquiries associated with this client.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        handleOpenAddForCustomer({
                          id: selectedProspect.customerId,
                          name: selectedProspect.customerName,
                          email: selectedProspect.customerEmail,
                          phone: selectedProspect.customerPhone,
                          area: selectedProspect.customerCity,
                          leadSource: selectedProspect.leadSource
                        });
                      }}
                      className="flex items-center gap-1.5 bg-lumora-charcoal text-white hover:bg-lumora-gold text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-sm shadow-xs transition-all flex-shrink-0"
                    >
                      <Plus size={13} />
                      + Add New Enquiry for {selectedProspect.customerName.split(' ')[0]}
                    </button>
                  </div>

                  {/* Sibling Enquiries List */}
                  <div className="space-y-3">
                    {prospects
                      .filter(p => p.customerName === selectedProspect.customerName || (selectedProspect.customerId && p.customerId === selectedProspect.customerId))
                      .map((sibling) => {
                        const isCurrent = sibling.id === selectedProspect.id;
                        const confCount = sibling.confirmations ? sibling.confirmations.filter(c => c.isConfirmed).length : 0;
                        const totalConf = sibling.confirmations ? sibling.confirmations.length : 7;

                        return (
                          <div
                            key={sibling.id}
                            className={`p-4 rounded-sm border transition-all ${isCurrent ? 'bg-lumora-gold/5 border-lumora-gold shadow-xs' : 'bg-white border-black/10 hover:border-lumora-gold/40'}`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-mono font-bold text-lumora-taupe">{sibling.id}</span>
                                  {isCurrent && (
                                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-lumora-gold text-white">
                                      Currently Viewing
                                    </span>
                                  )}
                                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${getStatusBadge(sibling.status).bg}`}>
                                    {getStatusBadge(sibling.status).label}
                                  </span>
                                  <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-lumora-bone text-lumora-taupe">
                                    {sibling.category}
                                  </span>
                                </div>
                                <h4 className="text-sm font-serif font-bold text-lumora-charcoal">
                                  {sibling.title}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-lumora-taupe flex-wrap">
                                  <span>Quote: <strong className="text-lumora-charcoal">₹{(sibling.estimatedQuote || sibling.targetBudget || 0).toLocaleString()}</strong></span>
                                  <span>•</span>
                                  <span>Verified Checkpoints: <strong className="text-lumora-charcoal">{confCount}/{totalConf}</strong></span>
                                  {sibling.targetDeliveryDate && (
                                    <>
                                      <span>•</span>
                                      <span>Target Delivery: <strong className="text-lumora-charcoal">{sibling.targetDeliveryDate}</strong></span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                {!isCurrent && (
                                  <button
                                    onClick={() => setSelectedProspect(sibling)}
                                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-white border border-black/10 rounded-sm hover:bg-lumora-bone text-lumora-charcoal flex items-center gap-1"
                                  >
                                    <Eye size={12} /> Switch to Spec
                                  </button>
                                )}
                                {sibling.status !== 'converted_to_order' ? (
                                  <button
                                    onClick={() => handleOpenConvertModal(sibling)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-xs flex items-center gap-1"
                                  >
                                    <Sparkles size={12} /> Convert to Order
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-bold text-lumora-gold bg-lumora-gold/10 px-2.5 py-1 rounded-sm border border-lumora-gold/20 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> #{sibling.convertedOrderId}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* TAB 1: TECHNICAL SPECS */}
              {drawerTab === 'specs' && (
                <div className="space-y-6">
                  {/* Metal Specs Card */}
                  <div className="bg-lumora-bone/30 p-5 rounded-sm border border-black/5">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/10">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-lumora-charcoal flex items-center gap-2">
                        <Layers size={14} className="text-lumora-gold" />
                        Metal & Alloy Specifications
                      </h3>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm ${selectedProspect.metalPreference?.isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {selectedProspect.metalPreference?.isConfirmed ? '✓ Confirmed' : '⚠️ Pending Decision'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="text-[10px] text-lumora-taupe uppercase">Metal Type</p>
                        <p className="font-bold text-lumora-charcoal mt-0.5">{selectedProspect.metalPreference?.type || 'Gold'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-lumora-taupe uppercase">Purity</p>
                        <p className="font-bold text-lumora-charcoal mt-0.5">{selectedProspect.metalPreference?.purity || '18K'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-lumora-taupe uppercase">Color Tone</p>
                        <p className="font-bold text-lumora-charcoal mt-0.5">{selectedProspect.metalPreference?.color || 'Yellow'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-lumora-taupe uppercase">Est. Weight</p>
                        <p className="font-bold text-lumora-charcoal mt-0.5">{selectedProspect.metalPreference?.estWeightGrams || 0} grams</p>
                      </div>
                    </div>
                    {selectedProspect.metalPreference?.notes && (
                      <p className="text-xs text-lumora-taupe bg-white p-3 rounded-xs border border-black/5 mt-3 italic">
                        "{selectedProspect.metalPreference.notes}"
                      </p>
                    )}
                  </div>

                  {/* Gemstone Specs Card */}
                  <div className="bg-lumora-bone/30 p-5 rounded-sm border border-black/5">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/10">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-lumora-charcoal flex items-center gap-2">
                        <Diamond size={14} className="text-lumora-gold" />
                        Gemstones & Diamond Spec
                      </h3>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm ${selectedProspect.gemstoneDetails?.isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {selectedProspect.gemstoneDetails?.isConfirmed ? '✓ Confirmed' : '⚠️ Pending Stone Selection'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-[10px] text-lumora-taupe uppercase">Center Gemstone</p>
                        <p className="font-bold text-lumora-charcoal mt-0.5">{selectedProspect.gemstoneDetails?.primaryStone || 'None'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-lumora-taupe uppercase">Carat / Weight</p>
                        <p className="font-bold text-lumora-charcoal mt-0.5">{selectedProspect.gemstoneDetails?.caratWeight || 0} ct</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-lumora-taupe uppercase">Cut & Shape</p>
                        <p className="font-bold text-lumora-charcoal mt-0.5">{selectedProspect.gemstoneDetails?.cutShape || 'Round'}</p>
                      </div>
                    </div>
                    {selectedProspect.gemstoneDetails?.accentStones && (
                      <div className="mt-3 text-xs">
                        <p className="text-[10px] text-lumora-taupe uppercase">Accent Diamonds / Pavé</p>
                        <p className="font-medium text-lumora-charcoal mt-0.5">{selectedProspect.gemstoneDetails.accentStones}</p>
                      </div>
                    )}
                    {selectedProspect.gemstoneDetails?.notes && (
                      <p className="text-xs text-lumora-taupe bg-white p-3 rounded-xs border border-black/5 mt-3 italic">
                        "{selectedProspect.gemstoneDetails.notes}"
                      </p>
                    )}
                  </div>

                  {/* Sizing & Ergonomics */}
                  <div className="bg-lumora-bone/30 p-5 rounded-sm border border-black/5">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/10">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-lumora-charcoal">
                        Sizing & Ergonomic Fit
                      </h3>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm ${selectedProspect.sizingDetails?.isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {selectedProspect.sizingDetails?.isConfirmed ? '✓ Size Confirmed' : '⚠️ Pending Measurement'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-[10px] text-lumora-taupe uppercase">Ring Size</p>
                        <p className="font-bold text-lumora-charcoal mt-0.5">{selectedProspect.sizingDetails?.ringSize || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-lumora-taupe uppercase">Wrist / Bangle Size</p>
                        <p className="font-bold text-lumora-charcoal mt-0.5">{selectedProspect.sizingDetails?.wristSize || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-lumora-taupe uppercase">Necklace Length</p>
                        <p className="font-bold text-lumora-charcoal mt-0.5">{selectedProspect.sizingDetails?.length || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Design & Specifications */}
                  <div className="bg-lumora-bone/30 p-5 rounded-sm border border-black/5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-lumora-charcoal mb-2">
                      Atelier Design Directives & Engraving
                    </h3>
                    <p className="text-xs text-lumora-charcoal leading-relaxed whitespace-pre-line bg-white p-3 rounded-xs border border-black/5">
                      {selectedProspect.designDetails?.specifications || 'No special directives recorded yet.'}
                    </p>
                    {selectedProspect.designDetails?.engravingText && (
                      <div className="mt-3 bg-lumora-gold/10 border border-lumora-gold/30 p-3 rounded-xs flex items-center justify-between text-xs">
                        <span className="text-lumora-charcoal font-medium">Requested Engraving Text:</span>
                        <span className="font-serif font-bold text-lumora-gold italic">"{selectedProspect.designDetails.engravingText}"</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PENDING CONFIRMATIONS CHECKLIST */}
              {drawerTab === 'confirmations' && (
                <div className="space-y-4">
                  <div className="bg-lumora-bone/30 p-4 rounded-sm border border-black/5 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-lumora-charcoal">
                        Master Confirmation Checkpoints
                      </h3>
                      <p className="text-[11px] text-lumora-taupe mt-0.5">
                        Toggle any checkpoint as confirmed once verified with client or master artisan.
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-lumora-charcoal">
                        {selectedProspect.confirmations.filter(c => c.isConfirmed).length}/{selectedProspect.confirmations.length} Confirmed
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedProspect.confirmations.map((c) => (
                      <div
                        key={c.key}
                        onClick={() => handleToggleConfirmation(selectedProspect, c.key)}
                        className={`p-4 rounded-sm border transition-all cursor-pointer flex items-start justify-between gap-4 ${c.isConfirmed ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50' : 'bg-white border-black/10 hover:border-lumora-gold'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 w-5 h-5 rounded-xs flex items-center justify-center transition-all ${c.isConfirmed ? 'bg-emerald-600 text-white' : 'border border-black/30 text-transparent hover:border-lumora-gold'}`}>
                            <Check size={13} />
                          </div>
                          <div>
                            <h4 className={`text-xs font-bold ${c.isConfirmed ? 'text-emerald-950' : 'text-lumora-charcoal'}`}>
                              {c.label}
                            </h4>
                            <p className="text-[11px] text-lumora-taupe mt-1">
                              {c.details}
                            </p>
                            {c.confirmedAt && (
                              <p className="text-[10px] text-emerald-700 font-mono mt-1 flex items-center gap-1">
                                <CheckCircle2 size={10} /> Confirmed on {c.confirmedAt} by {c.confirmedBy || 'Atelier Lead'}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm border flex-shrink-0 ${c.isConfirmed ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {c.isConfirmed ? 'Confirmed' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: MEDIA & SKETCHES */}
              {drawerTab === 'media' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-lumora-charcoal">
                      Inspiration Moodboard & 3D CAD Renders
                    </h3>
                  </div>

                  {selectedProspect.designDetails?.samplePhotos && selectedProspect.designDetails.samplePhotos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedProspect.designDetails.samplePhotos.map((photo, idx) => (
                        <div key={idx} className="relative group rounded-sm overflow-hidden border border-black/10 bg-lumora-bone/40 h-56">
                          <img
                            src={photo}
                            alt={`Inspiration ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <a
                              href={photo}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-white text-lumora-charcoal p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border border-dashed border-black/15 rounded-sm bg-lumora-bone/20">
                      <Diamond size={24} className="mx-auto text-lumora-taupe mb-2" />
                      <p className="text-xs text-lumora-taupe">No reference photos uploaded yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PRICING & ADVANCE */}
              {drawerTab === 'pricing' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-lumora-bone/30 p-4 rounded-sm border border-black/5">
                      <p className="text-[10px] text-lumora-taupe uppercase tracking-wider">Client Target Budget</p>
                      <h4 className="text-xl font-serif font-bold text-lumora-charcoal mt-1">
                        ₹{(selectedProspect.targetBudget || 0).toLocaleString()}
                      </h4>
                    </div>
                    <div className="bg-lumora-bone/30 p-4 rounded-sm border border-black/5">
                      <p className="text-[10px] text-lumora-taupe uppercase tracking-wider">Atelier Quoted Estimate</p>
                      <h4 className="text-xl font-serif font-bold text-lumora-gold mt-1">
                        ₹{(selectedProspect.estimatedQuote || 0).toLocaleString()}
                      </h4>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-sm border border-black/10 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-lumora-charcoal">
                      Advance Deposit Status
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-[10px] text-lumora-taupe uppercase">Advance Required</p>
                        <p className="font-bold text-lumora-charcoal mt-0.5">₹{(selectedProspect.advanceRequired || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-lumora-taupe uppercase">Advance Received</p>
                        <p className="font-bold text-emerald-700 mt-0.5">₹{(selectedProspect.advanceReceived || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-lumora-taupe uppercase">Payment Method</p>
                        <p className="font-bold text-lumora-charcoal mt-0.5">{selectedProspect.advancePaymentMethod || 'Pending'}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-black/5 flex justify-between items-center text-xs">
                      <span className="text-lumora-taupe">Target Delivery Feasibility Date:</span>
                      <span className="font-bold text-lumora-charcoal">{selectedProspect.targetDeliveryDate || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: ACTIVITY LOG & TIMELINE */}
              {drawerTab === 'timeline' && (
                <div className="space-y-6">
                  {/* Add Quick Log Box */}
                  <div className="bg-lumora-bone/30 p-4 rounded-sm border border-black/5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-lumora-charcoal">
                      Log Client Interaction or Progress Note
                    </h4>
                    <div className="flex gap-2">
                      <select
                        value={newActivityType}
                        onChange={(e) => setNewActivityType(e.target.value as any)}
                        className="bg-white border border-black/10 text-xs px-2.5 py-1.5 rounded-sm focus:outline-none focus:border-lumora-gold"
                      >
                        <option value="whatsapp">WhatsApp Note</option>
                        <option value="call">Phone Call</option>
                        <option value="meeting">Salon Meeting</option>
                        <option value="note">Internal Note</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Type interaction note (e.g. Sent revised CAD render via WhatsApp)..."
                        value={newActivityNote}
                        onChange={(e) => setNewActivityNote(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddActivityNote()}
                        className="flex-1 bg-white border border-black/10 px-3 py-1.5 text-xs text-lumora-charcoal focus:outline-none focus:border-lumora-gold rounded-sm"
                      />
                      <button
                        onClick={handleAddActivityNote}
                        className="bg-lumora-charcoal text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-sm hover:bg-lumora-gold transition-colors"
                      >
                        Log
                      </button>
                    </div>
                  </div>

                  {/* Activity List */}
                  <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-black/10 pl-6">
                    {selectedProspect.activityLog && selectedProspect.activityLog.map((act) => (
                      <div key={act.id} className="relative group bg-white p-3.5 rounded-sm border border-black/5 shadow-xs">
                        <div className="absolute -left-[27px] top-3.5 w-3 h-3 rounded-full bg-lumora-gold border-2 border-white" />
                        <div className="flex items-center justify-between text-[10px] text-lumora-taupe mb-1">
                          <span className="font-mono">{act.date} • {act.author}</span>
                          <span className="uppercase font-bold tracking-wider">{act.type}</span>
                        </div>
                        <p className="text-xs text-lumora-charcoal">{act.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-black/10 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(selectedProspect)}
                  className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border border-black/10 rounded-sm hover:bg-lumora-bone/40 text-lumora-charcoal"
                >
                  <Edit3 size={13} /> Edit Full Spec
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border border-black/10 rounded-sm hover:bg-lumora-bone/40 text-lumora-charcoal"
                  title="Print Prospect Spec Sheet"
                >
                  <Printer size={13} /> Print Spec Sheet
                </button>
              </div>

              {selectedProspect.status !== 'converted_to_order' ? (
                <button
                  onClick={() => handleOpenConvertModal(selectedProspect)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-sm shadow-md flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Sparkles size={14} /> Finalize & Place as Order
                </button>
              ) : (
                <span className="text-xs font-bold text-lumora-gold flex items-center gap-1.5">
                  <ShieldCheck size={16} /> Converted to Order #{selectedProspect.convertedOrderId}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONVERT TO ORDER MODAL */}
      {isConvertModalOpen && convertTargetProspect && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-sm shadow-2xl overflow-hidden animate-scaleUp">
            <div className="p-6 border-b border-black/10 bg-lumora-bone/30 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-xs">
                  Confirmation Finalization
                </span>
                <h3 className="text-xl font-serif font-bold text-lumora-charcoal mt-1">
                  Place as Atelier Order
                </h3>
              </div>
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="p-1 text-lumora-taupe hover:text-lumora-charcoal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-sm text-xs text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-600" />
                  Finalized Specifications Ready for Bench Production
                </p>
                <p className="text-[11px] text-emerald-800">
                  This will convert prospect <strong>"{convertTargetProspect.title}"</strong> for client <strong>{convertTargetProspect.customerName}</strong> into an active atelier order, allocate the master artisan, and record advance deposits.
                </p>
              </div>

              {/* Order Target Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Order Workflow Destination</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConvertOrderType('bespoke')}
                    className={`p-3 text-left border rounded-sm transition-all ${convertOrderType === 'bespoke' ? 'border-lumora-gold bg-lumora-gold/10 text-lumora-charcoal font-bold' : 'border-black/10 bg-white text-lumora-taupe'}`}
                  >
                    <p className="text-xs font-bold text-lumora-charcoal">Bespoke Workshop Order</p>
                    <p className="text-[10px] text-lumora-taupe mt-0.5">High jewelry custom CAD & stone setting bench</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConvertOrderType('standard')}
                    className={`p-3 text-left border rounded-sm transition-all ${convertOrderType === 'standard' ? 'border-lumora-gold bg-lumora-gold/10 text-lumora-charcoal font-bold' : 'border-black/10 bg-white text-lumora-taupe'}`}
                  >
                    <p className="text-xs font-bold text-lumora-charcoal">Standard Order Hub</p>
                    <p className="text-[10px] text-lumora-taupe mt-0.5">Catalog production and fulfillment queue</p>
                  </button>
                </div>
              </div>

              {/* Artisan Assignment */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Assign Master Craftsman / Bench</label>
                <select
                  value={convertCraftsmanId}
                  onChange={(e) => setConvertCraftsmanId(e.target.value)}
                  className="w-full bg-white border border-black/10 px-3 py-2 text-xs text-lumora-charcoal focus:outline-none focus:border-lumora-gold rounded-sm"
                >
                  {craftsmenList.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                  ))}
                </select>
              </div>

              {/* Total & Advance Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Final Confirmed Price (₹)</label>
                  <input
                    type="number"
                    value={convertTotalAmount}
                    onChange={(e) => setConvertTotalAmount(Number(e.target.value))}
                    className="w-full bg-white border border-black/10 px-3 py-2 text-xs font-bold text-lumora-charcoal focus:outline-none focus:border-lumora-gold rounded-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Advance Deposit Amount (₹)</label>
                  <input
                    type="number"
                    value={convertAdvanceAmount}
                    onChange={(e) => setConvertAdvanceAmount(Number(e.target.value))}
                    className="w-full bg-white border border-black/10 px-3 py-2 text-xs font-bold text-emerald-700 focus:outline-none focus:border-lumora-gold rounded-sm"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Advance Payment Method (Auto-recorded in Ledger)</label>
                <select
                  value={convertAdvanceMethod}
                  onChange={(e) => setConvertAdvanceMethod(e.target.value as any)}
                  className="w-full bg-white border border-black/10 px-3 py-2 text-xs text-lumora-charcoal focus:outline-none focus:border-lumora-gold rounded-sm"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT / RTGS / Wire)</option>
                  <option value="UPI">UPI / Instant Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash Deposit</option>
                </select>
              </div>

              {/* Final Notes */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Final Bench Directives</label>
                <textarea
                  rows={3}
                  value={convertSpecialNotes}
                  onChange={(e) => setConvertSpecialNotes(e.target.value)}
                  placeholder="Special instructions for the workshop (prongs, polish, hallmarks)..."
                  className="w-full bg-white border border-black/10 p-2.5 text-xs text-lumora-charcoal focus:outline-none focus:border-lumora-gold rounded-sm"
                />
              </div>
            </div>

            <div className="p-4 border-t border-black/10 bg-lumora-bone/20 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConvertModalOpen(false)}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-lumora-taupe hover:text-lumora-charcoal"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteOrderConversion}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider px-6 py-2.5 rounded-sm shadow-md flex items-center gap-2 active:scale-95 transition-all"
              >
                <Sparkles size={14} /> Confirm & Place Order Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PROSPECT MODAL */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-black/10 bg-lumora-bone/30 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-lumora-gold">
                  {editingProspect ? 'Edit Existing Record' : 'New Commission Discovery'}
                </span>
                <h3 className="text-xl font-serif font-bold text-lumora-charcoal mt-1">
                  {editingProspect ? `Edit Prospect: ${editingProspect.id}` : 'Create Prospect Order Spec'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1 text-lumora-taupe hover:text-lumora-charcoal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-black/10 bg-white px-6">
              {[
                { id: 'client', label: '1. Client & Lead' },
                { id: 'materials', label: '2. Metal & Stones' },
                { id: 'sizing_design', label: '3. Fit & Design' },
                { id: 'pricing', label: '4. Budget & Quotes' },
                { id: 'confirmations', label: '5. Initial Checkpoints' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveFormTab(t.id as any)}
                  className={`py-3 px-3.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${activeFormTab === t.id ? 'border-lumora-gold text-lumora-gold' : 'border-transparent text-lumora-taupe hover:text-lumora-charcoal'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Form Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {/* TAB 1: CLIENT & LEAD */}
              {activeFormTab === 'client' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Prospect Order Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Royal Colombian Emerald & Diamond Choker"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-white border border-black/10 px-3 py-2 text-xs text-lumora-charcoal focus:outline-none focus:border-lumora-gold rounded-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Customer Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Maharani Gayatri Singhania"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className="w-full bg-white border border-black/10 px-3 py-2 text-xs text-lumora-charcoal focus:outline-none focus:border-lumora-gold rounded-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">City / Region</label>
                      <input
                        type="text"
                        placeholder="e.g. Mumbai / London"
                        value={formData.customerCity}
                        onChange={(e) => setFormData({ ...formData, customerCity: e.target.value })}
                        className="w-full bg-white border border-black/10 px-3 py-2 text-xs text-lumora-charcoal focus:outline-none focus:border-lumora-gold rounded-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Contact Phone / WhatsApp</label>
                      <input
                        type="text"
                        placeholder="e.g. +91 98200 44881"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        className="w-full bg-white border border-black/10 px-3 py-2 text-xs text-lumora-charcoal focus:outline-none focus:border-lumora-gold rounded-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Customer Email</label>
                      <input
                        type="email"
                        placeholder="e.g. client@singhania.com"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        className="w-full bg-white border border-black/10 px-3 py-2 text-xs text-lumora-charcoal focus:outline-none focus:border-lumora-gold rounded-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Jewelry Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full bg-white border border-black/10 px-3 py-2 text-xs text-lumora-charcoal focus:outline-none focus:border-lumora-gold rounded-sm"
                      >
                        <option value="Rings">Rings</option>
                        <option value="Necklaces">Necklaces</option>
                        <option value="Earrings">Earrings</option>
                        <option value="Bracelets">Bracelets</option>
                        <option value="Bespoke">Bespoke Sets</option>
                        <option value="Pendants">Pendants</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Priority Level</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        className="w-full bg-white border border-black/10 px-3 py-2 text-xs text-lumora-charcoal focus:outline-none focus:border-lumora-gold rounded-sm"
                      >
                        <option value="Urgent">Urgent (VIP / Wedding)</option>
                        <option value="High">High Priority</option>
                        <option value="Standard">Standard</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Lead Source</label>
                      <select
                        value={formData.leadSource}
                        onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                        className="w-full bg-white border border-black/10 px-3 py-2 text-xs text-lumora-charcoal focus:outline-none focus:border-lumora-gold rounded-sm"
                      >
                        <option value="Private Atelier VIP Consultation">Private Atelier VIP Consultation</option>
                        <option value="Instagram DM Inquiry">Instagram DM Inquiry</option>
                        <option value="WhatsApp Inquiry">WhatsApp Inquiry</option>
                        <option value="Referral by VIP Client">Referral by VIP Client</option>
                        <option value="Walk-in Showroom Appointment">Walk-in Showroom Appointment</option>
                        <option value="Exhibition / Trunk Show">Exhibition / Trunk Show</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Occasion / Milestone</label>
                    <input
                      type="text"
                      placeholder="e.g. Royal Winter Palace Wedding / 25th Anniversary"
                      value={formData.occasion}
                      onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                      className="w-full bg-white border border-black/10 px-3 py-2 text-xs text-lumora-charcoal focus:outline-none focus:border-lumora-gold rounded-sm"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: METALS & STONES */}
              {activeFormTab === 'materials' && (
                <div className="space-y-4">
                  <div className="p-4 bg-lumora-bone/30 rounded-sm border border-black/5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-lumora-charcoal">
                      Metal Preferences
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-lumora-taupe">Metal Type</label>
                        <select
                          value={formData.metalPreference?.type}
                          onChange={(e) => setFormData({
                            ...formData,
                            metalPreference: { ...(formData.metalPreference as any), type: e.target.value }
                          })}
                          className="w-full bg-white border border-black/10 px-2.5 py-1.5 text-xs rounded-sm"
                        >
                          <option value="Gold">Gold</option>
                          <option value="Platinum">Platinum</option>
                          <option value="Silver">Silver</option>
                          <option value="Two-Tone">Two-Tone</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-lumora-taupe">Purity</label>
                        <input
                          type="text"
                          placeholder="e.g. 18K Yellow Gold / 22K"
                          value={formData.metalPreference?.purity}
                          onChange={(e) => setFormData({
                            ...formData,
                            metalPreference: { ...(formData.metalPreference as any), purity: e.target.value }
                          })}
                          className="w-full bg-white border border-black/10 px-2.5 py-1.5 text-xs rounded-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-lumora-taupe">Est. Weight (Grams)</label>
                        <input
                          type="number"
                          value={formData.metalPreference?.estWeightGrams}
                          onChange={(e) => setFormData({
                            ...formData,
                            metalPreference: { ...(formData.metalPreference as any), estWeightGrams: Number(e.target.value) }
                          })}
                          className="w-full bg-white border border-black/10 px-2.5 py-1.5 text-xs rounded-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-lumora-taupe">Metal Notes / Pending Options</label>
                      <input
                        type="text"
                        placeholder="e.g. Client debating between 18K Yellow vs 18K Rose Gold"
                        value={formData.metalPreference?.notes}
                        onChange={(e) => setFormData({
                          ...formData,
                          metalPreference: { ...(formData.metalPreference as any), notes: e.target.value }
                        })}
                        className="w-full bg-white border border-black/10 px-2.5 py-1.5 text-xs rounded-sm"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-lumora-bone/30 rounded-sm border border-black/5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-lumora-charcoal">
                      Gemstone Specifications
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-lumora-taupe">Primary Gemstone</label>
                        <input
                          type="text"
                          placeholder="e.g. Colombian Emerald / Solitaire Diamond"
                          value={formData.gemstoneDetails?.primaryStone}
                          onChange={(e) => setFormData({
                            ...formData,
                            gemstoneDetails: { ...(formData.gemstoneDetails as any), primaryStone: e.target.value }
                          })}
                          className="w-full bg-white border border-black/10 px-2.5 py-1.5 text-xs rounded-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-lumora-taupe">Carat Weight</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.gemstoneDetails?.caratWeight}
                          onChange={(e) => setFormData({
                            ...formData,
                            gemstoneDetails: { ...(formData.gemstoneDetails as any), caratWeight: Number(e.target.value) }
                          })}
                          className="w-full bg-white border border-black/10 px-2.5 py-1.5 text-xs rounded-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-lumora-taupe">Cut / Shape</label>
                        <input
                          type="text"
                          placeholder="e.g. Oval / Emerald Cut / Cushion"
                          value={formData.gemstoneDetails?.cutShape}
                          onChange={(e) => setFormData({
                            ...formData,
                            gemstoneDetails: { ...(formData.gemstoneDetails as any), cutShape: e.target.value }
                          })}
                          className="w-full bg-white border border-black/10 px-2.5 py-1.5 text-xs rounded-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-lumora-taupe">Accent Stones / Pavé Details</label>
                      <input
                        type="text"
                        placeholder="e.g. 1.2ct VVS-F diamonds in micro-prong halo"
                        value={formData.gemstoneDetails?.accentStones}
                        onChange={(e) => setFormData({
                          ...formData,
                          gemstoneDetails: { ...(formData.gemstoneDetails as any), accentStones: e.target.value }
                        })}
                        className="w-full bg-white border border-black/10 px-2.5 py-1.5 text-xs rounded-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SIZING & DESIGN */}
              {activeFormTab === 'sizing_design' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Ring Size</label>
                      <input
                        type="text"
                        placeholder="e.g. US 6.5 / Indian 13"
                        value={formData.sizingDetails?.ringSize}
                        onChange={(e) => setFormData({
                          ...formData,
                          sizingDetails: { ...(formData.sizingDetails as any), ringSize: e.target.value }
                        })}
                        className="w-full bg-white border border-black/10 px-3 py-2 text-xs rounded-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Wrist / Bangle Size</label>
                      <input
                        type="text"
                        placeholder="e.g. 2.6 / 6.5 inches"
                        value={formData.sizingDetails?.wristSize}
                        onChange={(e) => setFormData({
                          ...formData,
                          sizingDetails: { ...(formData.sizingDetails as any), wristSize: e.target.value }
                        })}
                        className="w-full bg-white border border-black/10 px-3 py-2 text-xs rounded-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Chain / Collar Length</label>
                      <input
                        type="text"
                        placeholder="e.g. 16 inches + 2 in extender"
                        value={formData.sizingDetails?.length}
                        onChange={(e) => setFormData({
                          ...formData,
                          sizingDetails: { ...(formData.sizingDetails as any), length: e.target.value }
                        })}
                        className="w-full bg-white border border-black/10 px-3 py-2 text-xs rounded-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Design Directives & Special Specifications</label>
                    <textarea
                      rows={3}
                      placeholder="Enter detailed technical craft requirements, CAD specifications, prong styles..."
                      value={formData.designDetails?.specifications}
                      onChange={(e) => setFormData({
                        ...formData,
                        designDetails: { ...(formData.designDetails as any), specifications: e.target.value }
                      })}
                      className="w-full bg-white border border-black/10 p-2.5 text-xs text-lumora-charcoal focus:outline-none focus:border-lumora-gold rounded-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Engraving Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Forever & Always • 24.09.26"
                      value={formData.designDetails?.engravingText}
                      onChange={(e) => setFormData({
                        ...formData,
                        designDetails: { ...(formData.designDetails as any), engravingText: e.target.value }
                      })}
                      className="w-full bg-white border border-black/10 px-3 py-2 text-xs rounded-sm"
                    />
                  </div>

                  {/* Photos Add */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Sample Reference Photo URLs</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Paste image URL (e.g. Unsplash or CAD link)..."
                        value={photoInputUrl}
                        onChange={(e) => setPhotoInputUrl(e.target.value)}
                        className="flex-1 bg-white border border-black/10 px-3 py-1.5 text-xs rounded-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (photoInputUrl.trim()) {
                            const cur = formData.designDetails?.samplePhotos || [];
                            setFormData({
                              ...formData,
                              designDetails: { ...(formData.designDetails as any), samplePhotos: [...cur, photoInputUrl.trim()] }
                            });
                            setPhotoInputUrl('');
                          }
                        }}
                        className="bg-lumora-charcoal text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm"
                      >
                        Add Photo
                      </button>
                    </div>

                    {formData.designDetails?.samplePhotos && formData.designDetails.samplePhotos.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {formData.designDetails.samplePhotos.map((url, i) => (
                          <div key={i} className="relative group w-16 h-16 rounded-xs overflow-hidden border border-black/10">
                            <img src={url} alt="sample" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const cur = formData.designDetails?.samplePhotos || [];
                                setFormData({
                                  ...formData,
                                  designDetails: { ...(formData.designDetails as any), samplePhotos: cur.filter((_, idx) => idx !== i) }
                                });
                              }}
                              className="absolute inset-0 bg-red-600/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: PRICING & QUOTES */}
              {activeFormTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Target Client Budget (₹)</label>
                      <input
                        type="number"
                        value={formData.targetBudget}
                        onChange={(e) => setFormData({ ...formData, targetBudget: Number(e.target.value) })}
                        className="w-full bg-white border border-black/10 px-3 py-2 text-xs font-bold text-lumora-charcoal rounded-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Estimated Atelier Quote (₹)</label>
                      <input
                        type="number"
                        value={formData.estimatedQuote}
                        onChange={(e) => setFormData({ ...formData, estimatedQuote: Number(e.target.value) })}
                        className="w-full bg-white border border-black/10 px-3 py-2 text-xs font-bold text-lumora-gold rounded-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Advance Required (₹)</label>
                      <input
                        type="number"
                        value={formData.advanceRequired}
                        onChange={(e) => setFormData({ ...formData, advanceRequired: Number(e.target.value) })}
                        className="w-full bg-white border border-black/10 px-3 py-2 text-xs rounded-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Advance Received So Far (₹)</label>
                      <input
                        type="number"
                        value={formData.advanceReceived}
                        onChange={(e) => setFormData({ ...formData, advanceReceived: Number(e.target.value) })}
                        className="w-full bg-white border border-black/10 px-3 py-2 text-xs rounded-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Payment Method</label>
                      <select
                        value={formData.advancePaymentMethod}
                        onChange={(e) => setFormData({ ...formData, advancePaymentMethod: e.target.value as any })}
                        className="w-full bg-white border border-black/10 px-3 py-2 text-xs rounded-sm"
                      >
                        <option value="Pending">Pending Payment</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Cash">Cash</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Target Promised Delivery Date</label>
                      <input
                        type="date"
                        value={formData.targetDeliveryDate}
                        onChange={(e) => setFormData({ ...formData, targetDeliveryDate: e.target.value })}
                        className="w-full bg-white border border-black/10 px-3 py-2 text-xs rounded-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe">Next Follow-Up Reminder Date</label>
                      <input
                        type="date"
                        value={formData.nextFollowUpDate}
                        onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                        className="w-full bg-white border border-black/10 px-3 py-2 text-xs rounded-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: INITIAL CONFIRMATIONS */}
              {activeFormTab === 'confirmations' && (
                <div className="space-y-3">
                  <p className="text-xs text-lumora-taupe">
                    Check off any initial items that are already confirmed for this prospect:
                  </p>
                  {formData.confirmations && formData.confirmations.map((c, idx) => (
                    <div
                      key={c.key}
                      onClick={() => {
                        const cur = [...(formData.confirmations || [])];
                        cur[idx] = { ...cur[idx], isConfirmed: !cur[idx].isConfirmed };
                        setFormData({ ...formData, confirmations: cur });
                      }}
                      className={`p-3 rounded-sm border cursor-pointer flex items-center justify-between transition-colors ${c.isConfirmed ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-black/10'}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-xs flex items-center justify-center ${c.isConfirmed ? 'bg-emerald-600 text-white' : 'border border-black/30'}`}>
                          {c.isConfirmed && <Check size={11} />}
                        </div>
                        <span className={`text-xs font-bold ${c.isConfirmed ? 'text-emerald-950' : 'text-lumora-charcoal'}`}>
                          {c.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-lumora-taupe">{c.isConfirmed ? 'Confirmed' : 'Pending'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-black/10 bg-lumora-bone/20 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-lumora-taupe hover:text-lumora-charcoal"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveProspect}
                  className="bg-lumora-charcoal hover:bg-lumora-gold text-white text-[10px] font-bold uppercase tracking-wider px-6 py-2.5 rounded-sm shadow-md transition-all active:scale-95"
                >
                  {editingProspect ? 'Save Changes' : 'Create Prospect Spec'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
