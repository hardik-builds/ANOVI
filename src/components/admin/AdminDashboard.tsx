import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  Eye, 
  Check, 
  AlertCircle, 
  ArrowUpRight, 
  Save, 
  RefreshCw, 
  Download, 
  Upload, 
  DollarSign, 
  Sliders, 
  Lock, 
  Unlock, 
  MessageSquare, 
  Archive, 
  Settings, 
  ShieldCheck, 
  Globe, 
  CreditCard, 
  Database, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  Truck
} from 'lucide-react';
import { 
  JewelryItem, 
  Order, 
  BespokeInquiry, 
  WebsiteSettings, 
  IntegrationConfig 
} from '../../types';
import { storeService } from '../../services/storeService';
import { ProductFormModal } from './ProductFormModal';

interface AdminDashboardProps {
  onReturnToStorefront: () => void;
  onRefreshProducts: () => void;
}

type AdminTab = 'products' | 'orders' | 'inquiries' | 'archive' | 'reviews' | 'settings' | 'integrations';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onReturnToStorefront,
  onRefreshProducts,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  // State loaded from storeService
  const [products, setProducts] = useState<JewelryItem[]>(() => storeService.getProducts());
  const [orders, setOrders] = useState<Order[]>(() => storeService.getOrders());
  const [inquiries, setInquiries] = useState<BespokeInquiry[]>(() => storeService.getBespokeInquiries());
  const [archiveItems, setArchiveItems] = useState<JewelryItem[]>(() => storeService.getArchiveItems());
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(() => storeService.getWebsiteSettings());
  const [integrationConfig, setIntegrationConfig] = useState<IntegrationConfig>(() => storeService.getIntegrationConfig());

  // Products filtering & search
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<JewelryItem | null>(null);

  // Orders filtering
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [orderSearch, setOrderSearch] = useState('');

  // Toast / notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Archive modal
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveForm, setArchiveForm] = useState({
    name: '',
    collection: 'Heritage Archive',
    category: 'Necklaces',
    price: '$3,500 (Original Price)',
    image: '',
    description: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Distinct collections list for dropdowns
  const collectionsList = useMemo(() => {
    const list = Array.from(new Set(products.map(p => p.collection))).filter(Boolean);
    return list.length > 0 ? list : ["L'Aurore", "Nocturne", "Lumière", "Éternité", "The Singularities"];
  }, [products]);

  // Product CRUD
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod: JewelryItem) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (productData: Partial<JewelryItem>) => {
    if (editingProduct) {
      const updated = storeService.updateProduct(editingProduct.id, productData);
      setProducts(updated);
      showToast(`Piece "${productData.name}" successfully updated.`);
    } else {
      const newProd = storeService.addProduct(productData as any);
      setProducts(storeService.getProducts());
      showToast(`New masterpiece "${newProd.name}" added to vault.`);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
    onRefreshProducts();
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`Are you sure you wish to remove "${name}" from the vault?`)) {
      const updated = storeService.deleteProduct(id);
      setProducts(updated);
      showToast(`Piece "${name}" removed from vault.`);
      onRefreshProducts();
    }
  };

  const handleDuplicateProduct = (prod: JewelryItem) => {
    const duplicateData = {
      ...prod,
      name: `${prod.name} (Re-edition)`,
      id: undefined,
    };
    const created = storeService.addProduct(duplicateData);
    setProducts(storeService.getProducts());
    showToast(`Created duplicate re-edition of "${prod.name}".`);
    onRefreshProducts();
  };

  const handleToggleStock = (id: string, currentStock?: boolean) => {
    const updated = storeService.updateProduct(id, { inStock: !currentStock });
    setProducts(updated);
    showToast(`Stock status updated.`);
    onRefreshProducts();
  };

  // Order CRUD
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    let tracking = undefined;
    if (newStatus === 'Shipped & Insured') {
      const currentOrder = orders.find(o => o.id === orderId);
      const input = window.prompt('Enter Insured Courier Tracking Number (DHL / FedEx / Armored Vault):', currentOrder?.trackingNumber || 'DHL-EX-');
      if (input) tracking = input;
    }
    const updated = storeService.updateOrderStatus(orderId, newStatus, tracking);
    setOrders(updated);
    showToast(`Order status updated to "${newStatus}".`);
  };

  // Bespoke Inquiry CRUD
  const handleUpdateInquiryStatus = (id: string, status: BespokeInquiry['status']) => {
    const updated = storeService.updateInquiryStatus(id, status);
    setInquiries(updated);
    showToast(`Consultation inquiry updated to "${status}".`);
  };

  // Archive CRUD
  const handleAddArchiveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!archiveForm.name || !archiveForm.image) {
      alert('Please provide piece name and image URL.');
      return;
    }
    storeService.addArchiveItem({
      name: archiveForm.name,
      collection: archiveForm.collection,
      category: archiveForm.category as any,
      price: archiveForm.price,
      image: archiveForm.image,
      description: archiveForm.description,
    });
    setArchiveItems(storeService.getArchiveItems());
    setIsArchiveModalOpen(false);
    setArchiveForm({
      name: '',
      collection: 'Heritage Archive',
      category: 'Necklaces',
      price: '$3,500 (Original Price)',
      image: '',
      description: ''
    });
    showToast('Historic creation added to The Archive.');
  };

  const handleDeleteArchiveItem = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" from The Archive?`)) {
      const updated = storeService.deleteArchiveItem(id);
      setArchiveItems(updated);
      showToast(`Removed "${name}" from archive.`);
    }
  };

  // Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storeService.saveWebsiteSettings(websiteSettings);
    showToast('Atelier website & storefront settings saved successfully.');
  };

  // Integrations Save
  const handleSaveIntegrations = (e: React.FormEvent) => {
    e.preventDefault();
    storeService.saveIntegrationConfig(integrationConfig);
    showToast('Payment gateways & Supabase configuration updated.');
  };

  // Export / Import
  const handleExportData = () => {
    const dataStr = storeService.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `anovi-atelier-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Catalog data backup downloaded.');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storeService.importAllData(content)) {
        setProducts(storeService.getProducts());
        setOrders(storeService.getOrders());
        setInquiries(storeService.getBespokeInquiries());
        setArchiveItems(storeService.getArchiveItems());
        setWebsiteSettings(storeService.getWebsiteSettings());
        setIntegrationConfig(storeService.getIntegrationConfig());
        showToast('Atelier backup successfully imported!');
        onRefreshProducts();
      } else {
        alert('Invalid backup JSON format.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all catalog data, settings, and orders back to initial high jewelry collection? Any newly uploaded products will be reverted.')) {
      storeService.resetToDefaults();
      setProducts(storeService.getProducts());
      setOrders(storeService.getOrders());
      setInquiries(storeService.getBespokeInquiries());
      setArchiveItems(storeService.getArchiveItems());
      setWebsiteSettings(storeService.getWebsiteSettings());
      setIntegrationConfig(storeService.getIntegrationConfig());
      showToast('Catalog restored to default masterpieces.');
      onRefreshProducts();
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory || p.collection === selectedCategory;
      const matchesSearch = !productSearch.trim() || 
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.collection.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.description?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.materials?.toLowerCase().includes(productSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, productSearch]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
      const matchesSearch = !orderSearch.trim() ||
        o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  // Metrics
  const totalVaultValue = useMemo(() => {
    return products.reduce((acc, p) => {
      const num = parseFloat(p.price.replace(/[^0-9.]/g, '')) || 0;
      return acc + num;
    }, 0);
  }, [products]);

  const totalOrdersRevenue = useMemo(() => {
    return orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((acc, o) => acc + (o.subtotal || 0), 0);
  }, [orders]);

  const allCategories = ['All', 'Earrings', 'Necklaces', 'Rings', 'Bracelets', 'Pearls', 'Silver', 'Radiance', 'The Singularities'];

  return (
    <div className="min-h-screen bg-[#111111] text-[#EAEAEA] font-sans flex flex-col selection:bg-gold selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[200] bg-gold text-onyx px-5 py-3 shadow-2xl font-medium text-xs flex items-center gap-3 animate-fade-in border border-white/20">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Contract: Brand zone (wordmark) — Navigation tabs — Primary action */}
      <header className="border-b border-white/10 bg-[#161616] px-6 lg:px-12 py-4 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="font-serif text-xl tracking-wider text-gold font-light">ANOVI</span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-white/50 font-mono">Atelier Administration</span>
          </div>
        </div>

        {/* Center Zone: Clean Single-Line Nav Tabs */}
        <nav className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 text-xs tracking-wider transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'products' ? 'bg-gold text-onyx font-bold' : 'text-white/70 hover:text-white'
            }`}
          >
            <Sparkles size={13} />
            Products & Catalog ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 text-xs tracking-wider transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-gold text-onyx font-bold' : 'text-white/70 hover:text-white'
            }`}
          >
            <Package size={13} />
            Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-3 py-1.5 text-xs tracking-wider transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'inquiries' ? 'bg-gold text-onyx font-bold' : 'text-white/70 hover:text-white'
            }`}
          >
            <Clock size={13} />
            Bespoke Inquiries ({inquiries.length})
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            className={`px-3 py-1.5 text-xs tracking-wider transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'archive' ? 'bg-gold text-onyx font-bold' : 'text-white/70 hover:text-white'
            }`}
          >
            <Archive size={13} />
            The Archive ({archiveItems.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 text-xs tracking-wider transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'settings' ? 'bg-gold text-onyx font-bold' : 'text-white/70 hover:text-white'
            }`}
          >
            <Settings size={13} />
            Site Settings
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-3 py-1.5 text-xs tracking-wider transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'integrations' ? 'bg-gold text-onyx font-bold' : 'text-white/70 hover:text-white'
            }`}
          >
            <CreditCard size={13} />
            Payments & Supabase
          </button>
        </nav>

        {/* Right Zone: Primary Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReturnToStorefront}
            className="flex items-center gap-2 border border-gold/40 text-gold hover:bg-gold hover:text-onyx px-4 py-2 text-xs uppercase tracking-widest font-semibold transition-all duration-300"
          >
            <Eye size={14} />
            <span>Storefront Preview</span>
          </button>
        </div>
      </header>

      {/* Metrics Banner */}
      <section className="bg-[#1A1A1A] border-b border-white/5 px-6 lg:px-12 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-white/40">Vault Masterpieces</span>
            <span className="text-xl font-serif text-gold font-medium tabular-nums">{products.length} Pieces</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-white/40">Active Orders</span>
            <span className="text-xl font-serif text-white font-medium tabular-nums">{orders.length} Inquiries</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-white/40">Order Volume</span>
            <span className="text-xl font-serif text-white font-medium tabular-nums">${totalOrdersRevenue.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-white/40">Catalog Valuation</span>
            <span className="text-xl font-serif text-gold font-medium tabular-nums">${totalVaultValue.toLocaleString()}</span>
          </div>
        </div>
      </section>

      {/* Main Tabbed Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-12 space-y-8">
        
        {/* TAB 1: PRODUCTS & CATALOG MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header with Title and Primary Add Product CTA */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">Catalog Management</p>
                <h2 className="text-3xl font-serif italic text-white">Fine Jewelry & High Creation Vault</h2>
                <p className="text-xs text-white/60 font-light mt-1">
                  Upload new jewelry pieces with instant image previews, edit materials, update pricing, and toggle instant acquisition availability.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-1.5 border border-white/20 text-white/70 hover:text-white px-3 py-2 text-xs tracking-wider transition-colors"
                  title="Export catalog data as JSON"
                >
                  <Download size={13} />
                  <span>Export</span>
                </button>
                <button
                  onClick={handleOpenAddProduct}
                  className="flex items-center gap-2 bg-gold text-onyx px-5 py-2.5 text-xs uppercase tracking-widest font-bold hover:bg-white transition-all shadow-lg duration-300"
                >
                  <Plus size={15} />
                  <span>Upload New Piece</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#181818] p-4 border border-white/5">
              <div className="relative md:col-span-2">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input 
                  type="text"
                  placeholder="Search pieces by name, collection, materials or description..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:border-gold outline-none"
                />
              </div>

              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 px-3 py-2.5 text-xs text-white focus:border-gold outline-none"
                >
                  <option value="All">All Categories & Collections</option>
                  {allCategories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option disabled>──────────</option>
                  {collectionsList.map(col => (
                    <option key={`col_${col}`} value={col}>Collection: {col}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Table / Cards */}
            <div className="bg-[#181818] border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141414] text-[10px] uppercase tracking-wider text-white/50 border-b border-white/10">
                    <tr>
                      <th className="py-3.5 px-4 font-medium">Creation</th>
                      <th className="py-3.5 px-4 font-medium">Collection</th>
                      <th className="py-3.5 px-4 font-medium">Category</th>
                      <th className="py-3.5 px-4 font-medium">Price</th>
                      <th className="py-3.5 px-4 font-medium">Stock Status</th>
                      <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-white/40 italic">
                          No jewelry pieces match your search query.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white/5 border border-white/10 flex-shrink-0 overflow-hidden">
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // fallback if image fails
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              </div>
                              <div className="max-w-xs">
                                <p className="font-serif text-sm font-medium text-white">{product.name}</p>
                                <p className="text-[10px] text-white/50 truncate">{product.materials || 'High jewelry craftsmanship'}</p>
                                {product.featured && (
                                  <span className="text-[8px] uppercase tracking-widest text-gold font-bold">Featured Singularity</span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-white/70">
                            {product.collection}
                          </td>

                          <td className="py-3 px-4 text-white/70">
                            {product.category}
                            {product.subCategory && (
                              <span className="text-[10px] text-white/40 block">{product.subCategory}</span>
                            )}
                          </td>

                          <td className="py-3 px-4 font-mono text-gold font-medium">
                            {product.price}
                          </td>

                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleStock(product.id, product.inStock)}
                              className={`text-[9px] uppercase tracking-widest px-2.5 py-1 border transition-colors flex items-center gap-1.5 ${
                                product.inStock !== false
                                  ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                                  : 'border-red-500/40 text-red-400 bg-red-500/10'
                              }`}
                              title="Click to toggle stock availability"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${product.inStock !== false ? 'bg-emerald-400' : 'bg-red-400'}`} />
                              {product.inStock !== false ? 'In Stock' : 'Made to Order'}
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-1.5 text-white/60 hover:text-gold hover:bg-white/5 transition-colors"
                                title="Edit Piece"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() => handleDuplicateProduct(product)}
                                className="p-1.5 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                                title="Duplicate Piece"
                              >
                                <Copy size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id, product.name)}
                                className="p-1.5 text-white/60 hover:text-red-400 hover:bg-white/5 transition-colors"
                                title="Delete Piece"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS & FULFILLMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">Acquisitions & Deliveries</p>
                <h2 className="text-3xl font-serif italic text-white">Client Orders & White-Glove Dispatch</h2>
                <p className="text-xs text-white/60 font-light mt-1">
                  Manage confidential high jewelry client orders, tracking numbers, bespoke packaging, and fulfillment states.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-[#181818] border border-white/10 px-3 py-2 text-xs text-white focus:border-gold outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Preparing Atelier">Preparing Atelier</option>
                  <option value="Shipped & Insured">Shipped & Insured</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-6">
              {filteredOrders.length === 0 ? (
                <div className="bg-[#181818] p-12 text-center text-white/40 italic border border-white/5">
                  No orders found matching the selected status.
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.id} className="bg-[#181818] border border-white/10 p-6 space-y-6">
                    {/* Order Header */}
                    <div className="flex flex-wrap justify-between items-start gap-4 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-serif text-xl text-white">{order.orderNumber}</h3>
                          <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 border ${
                            order.status === 'Shipped & Insured' ? 'border-sky-500/40 text-sky-400 bg-sky-500/10' :
                            order.status === 'Delivered' ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' :
                            order.status === 'Preparing Atelier' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' :
                            'border-white/20 text-white/70'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/40 mt-1 font-mono">
                          Placed: {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-3">
                        <label className="text-[10px] uppercase tracking-widest text-white/50">Update State:</label>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                          className="bg-[#111111] border border-white/20 text-xs px-3 py-1.5 text-gold font-medium focus:border-gold outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Preparing Atelier">Preparing Atelier</option>
                          <option value="Shipped & Insured">Shipped & Insured</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                      {/* Customer Info */}
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-gold font-bold">Client Particulars</p>
                        <p className="text-white font-medium">{order.customerName}</p>
                        <p className="text-white/60">{order.customerEmail}</p>
                        <p className="text-white/60">{order.customerPhone}</p>
                      </div>

                      {/* Delivery Address */}
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-gold font-bold">Vault Destination</p>
                        <p className="text-white/80">{order.shippingAddress}</p>
                        <p className="text-white/80">{order.city}, {order.country} {order.postalCode}</p>
                        {order.trackingNumber && (
                          <p className="text-gold font-mono text-[11px] pt-1">
                            Courier: {order.trackingNumber}
                          </p>
                        )}
                      </div>

                      {/* Payment & Total */}
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-gold font-bold">Acquisition Settlement</p>
                        <p className="text-white font-medium">Method: {order.paymentMethod}</p>
                        <p className="text-emerald-400">Status: {order.paymentStatus}</p>
                        <p className="text-lg font-serif text-gold font-medium mt-1">
                          Total: ${order.subtotal?.toLocaleString()} {order.currency}
                        </p>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="pt-2">
                      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3">Commissioned Pieces ({order.items.length})</p>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-[#141414] p-3 border border-white/5">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="w-10 h-10 object-cover border border-white/10" />
                              <div>
                                <p className="font-serif text-sm text-white">{item.name}</p>
                                <p className="text-[10px] text-white/40">{item.collection} · Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-mono text-gold">{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.notes && (
                      <div className="p-3 bg-[#141414] border-l-2 border-gold text-xs text-white/70 italic">
                        Artisan Note: "{order.notes}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: BESPOKE CONSULTATION INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">Artisan Commissions</p>
                <h2 className="text-3xl font-serif italic text-white">Bespoke Inquiries & Consultations</h2>
                <p className="text-xs text-white/60 font-light mt-1">
                  Private consultations submitted via the Bespoke page for custom designs, heirloom remodels, and rare gem sourcing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inquiries.map((inquiry) => (
                <div key={inquiry.id} className="bg-[#181818] border border-white/10 p-6 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-gold font-mono">
                          Received {new Date(inquiry.createdAt).toLocaleDateString()}
                        </span>
                        <h4 className="font-serif text-2xl text-white">{inquiry.name}</h4>
                        <a href={`mailto:${inquiry.email}`} className="text-xs text-gold/80 hover:underline">
                          {inquiry.email}
                        </a>
                      </div>
                      
                      <select
                        value={inquiry.status}
                        onChange={(e) => handleUpdateInquiryStatus(inquiry.id, e.target.value as any)}
                        className="bg-[#111111] border border-white/15 text-[10px] uppercase tracking-wider text-gold px-2.5 py-1"
                      >
                        <option value="New Inquiry">New Inquiry</option>
                        <option value="Consultation Scheduled">Consultation Scheduled</option>
                        <option value="In Design">In Design</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div className="p-3 bg-[#131313] border border-white/5 text-xs text-white/80 space-y-2 mb-4 leading-relaxed">
                      <p className="text-[10px] uppercase tracking-widest text-white/40">Preferred Appointment</p>
                      <p className="font-medium text-white">{inquiry.preferredDate} ({inquiry.preferredTime})</p>
                      <p className="text-[10px] uppercase tracking-widest text-white/40 pt-2">Commission Vision</p>
                      <p className="italic">"{inquiry.description}"</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] text-white/40">
                      {inquiry.notes ? `Note: ${inquiry.notes}` : 'No internal note'}
                    </span>
                    <a
                      href={`mailto:${inquiry.email}?subject=ANOVI Haute Joaillerie - Bespoke Consultation Confirmation&body=Dear ${inquiry.name},%0D%0A%0D%0AThank you for requesting an atelier consultation with ANOVI Haute Joaillerie.`}
                      className="text-[10px] uppercase tracking-widest text-gold hover:underline font-bold flex items-center gap-1"
                    >
                      Compose Reply <ArrowUpRight size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: THE ARCHIVE MANAGEMENT */}
        {activeTab === 'archive' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">Heritage Gallery</p>
                <h2 className="text-3xl font-serif italic text-white">The Historic Archive</h2>
                <p className="text-xs text-white/60 font-light mt-1">
                  Manage historic showcase creations from 1924 to present displayed on "The Archive" page.
                </p>
              </div>

              <button
                onClick={() => setIsArchiveModalOpen(true)}
                className="flex items-center gap-2 bg-gold text-onyx px-5 py-2.5 text-xs uppercase tracking-widest font-bold hover:bg-white transition-all shadow-lg"
              >
                <Plus size={15} />
                <span>Add Archival Piece</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {archiveItems.map((item) => (
                <div key={item.id} className="bg-[#181818] border border-white/10 overflow-hidden group">
                  <div className="relative aspect-[4/3] bg-black/40">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    <button
                      onClick={() => handleDeleteArchiveItem(item.id, item.name)}
                      className="absolute top-2 right-2 bg-onyx/80 p-2 text-white/70 hover:text-red-400 transition-colors"
                      title="Delete from archive"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-[9px] uppercase tracking-widest text-gold">{item.collection}</p>
                    <h4 className="font-serif text-lg text-white">{item.name}</h4>
                    <p className="text-xs text-white/60 font-light leading-relaxed line-clamp-2">{item.description}</p>
                    <p className="text-xs text-gold/80 font-mono">{item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal for adding archive item */}
            {isArchiveModalOpen && (
              <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-4">
                <div className="bg-[#181818] border border-white/20 p-8 max-w-lg w-full text-white space-y-6">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h3 className="font-serif text-xl text-gold">Add Archival Creation</h3>
                    <button onClick={() => setIsArchiveModalOpen(false)} className="text-white/60 hover:text-white">
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleAddArchiveItem} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-1">Piece Name</label>
                      <input 
                        type="text"
                        required
                        placeholder="Vintage Rose Quartz Amulet"
                        value={archiveForm.name}
                        onChange={(e) => setArchiveForm({ ...archiveForm, name: e.target.value })}
                        className="w-full bg-[#111111] border border-white/15 p-2 text-white focus:border-gold outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-1">Collection</label>
                        <input 
                          type="text"
                          value={archiveForm.collection}
                          onChange={(e) => setArchiveForm({ ...archiveForm, collection: e.target.value })}
                          className="w-full bg-[#111111] border border-white/15 p-2 text-white focus:border-gold outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-1">Original Price Note</label>
                        <input 
                          type="text"
                          value={archiveForm.price}
                          onChange={(e) => setArchiveForm({ ...archiveForm, price: e.target.value })}
                          className="w-full bg-[#111111] border border-white/15 p-2 text-white focus:border-gold outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-1">Image URL</label>
                      <input 
                        type="url"
                        required
                        placeholder="https://images.unsplash.com/..."
                        value={archiveForm.image}
                        onChange={(e) => setArchiveForm({ ...archiveForm, image: e.target.value })}
                        className="w-full bg-[#111111] border border-white/15 p-2 text-white focus:border-gold outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-1">Historic Lore / Description</label>
                      <textarea 
                        rows={3}
                        placeholder="A rare rose quartz cabochon set in hand-engraved 18k rose gold. Circa 2018."
                        value={archiveForm.description}
                        onChange={(e) => setArchiveForm({ ...archiveForm, description: e.target.value })}
                        className="w-full bg-[#111111] border border-white/15 p-2 text-white focus:border-gold outline-none resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setIsArchiveModalOpen(false)}
                        className="px-4 py-2 border border-white/20 text-white/70"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-gold text-onyx font-bold uppercase tracking-wider"
                      >
                        Publish to Archive
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: WEBSITE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fade-in max-w-4xl">
            <div className="border-b border-white/10 pb-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">Brand & Storefront</p>
              <h2 className="text-3xl font-serif italic text-white">Atelier Website Settings</h2>
              <p className="text-xs text-white/60 font-light mt-1">
                Configure top announcement bar, brand storytelling quotes, contact concierge parameters, and international delivery rules.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-8 bg-[#181818] p-8 border border-white/5">
              {/* Section 1: Announcement Bar */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <h4 className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold">
                    1. Top Announcement Bar
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={websiteSettings.announcementBarEnabled}
                      onChange={(e) => setWebsiteSettings({ ...websiteSettings, announcementBarEnabled: e.target.checked })}
                      className="accent-gold w-4 h-4"
                    />
                    <span className="text-xs text-white">Enable Bar on Storefront</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">Announcement Message</label>
                    <input 
                      type="text"
                      value={websiteSettings.announcementText}
                      onChange={(e) => setWebsiteSettings({ ...websiteSettings, announcementText: e.target.value })}
                      className="w-full bg-[#111111] border border-white/15 p-2.5 text-xs text-white focus:border-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">CTA Link Label</label>
                    <input 
                      type="text"
                      value={websiteSettings.announcementLinkText}
                      onChange={(e) => setWebsiteSettings({ ...websiteSettings, announcementLinkText: e.target.value })}
                      className="w-full bg-[#111111] border border-white/15 p-2.5 text-xs text-white focus:border-gold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Brand Heritage Prose */}
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold border-b border-white/10 pb-2">
                  2. Brand Philosophy & Story
                </h4>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">Philosophy Headline</label>
                  <input 
                    type="text"
                    value={websiteSettings.brandPhilosophyTitle}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, brandPhilosophyTitle: e.target.value })}
                    className="w-full bg-[#111111] border border-white/15 p-2.5 text-xs text-white focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">Heritage Quote</label>
                  <input 
                    type="text"
                    value={websiteSettings.brandPhilosophyQuote}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, brandPhilosophyQuote: e.target.value })}
                    className="w-full bg-[#111111] border border-white/15 p-2.5 text-xs text-white focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">Philosophy Narrative</label>
                  <textarea 
                    rows={3}
                    value={websiteSettings.brandPhilosophyStory}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, brandPhilosophyStory: e.target.value })}
                    className="w-full bg-[#111111] border border-white/15 p-2.5 text-xs text-white focus:border-gold outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Section 3: Concierge Details */}
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold border-b border-white/10 pb-2">
                  3. Concierge & Atelier Contact
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">Concierge Email</label>
                    <input 
                      type="email"
                      value={websiteSettings.contactEmail}
                      onChange={(e) => setWebsiteSettings({ ...websiteSettings, contactEmail: e.target.value })}
                      className="w-full bg-[#111111] border border-white/15 p-2.5 text-xs text-white focus:border-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">Direct Phone</label>
                    <input 
                      type="text"
                      value={websiteSettings.contactPhone}
                      onChange={(e) => setWebsiteSettings({ ...websiteSettings, contactPhone: e.target.value })}
                      className="w-full bg-[#111111] border border-white/15 p-2.5 text-xs text-white focus:border-gold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">Atelier Locations</label>
                  <input 
                    type="text"
                    value={websiteSettings.atelierLocation}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, atelierLocation: e.target.value })}
                    className="w-full bg-[#111111] border border-white/15 p-2.5 text-xs text-white focus:border-gold outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  type="submit"
                  className="bg-gold text-onyx px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors duration-300 shadow-xl flex items-center gap-2"
                >
                  <Save size={14} />
                  <span>Save Storefront Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 6: INTEGRATIONS & PAYMENTS (Addressing user's questions on Supabase & Payment Gateways) */}
        {activeTab === 'integrations' && (
          <div className="space-y-8 animate-fade-in max-w-4xl">
            <div className="border-b border-white/10 pb-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">E-Commerce Architecture</p>
              <h2 className="text-3xl font-serif italic text-white">Payment Gateways & Supabase Sync</h2>
              <p className="text-xs text-white/60 font-light mt-1">
                Configure production payment processing (Stripe, Razorpay, COD, Wire) and integrate with your Supabase database.
              </p>
            </div>

            <form onSubmit={handleSaveIntegrations} className="space-y-8 bg-[#181818] p-8 border border-white/5">
              
              {/* Payment Gateways */}
              <div className="space-y-6">
                <h4 className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold border-b border-white/10 pb-2">
                  1. Payment Gateway Switchboard
                </h4>

                {/* Stripe */}
                <div className="p-4 bg-[#141414] border border-white/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <CreditCard className="text-gold" size={18} />
                      <div>
                        <p className="text-sm font-medium text-white">Stripe International Payments</p>
                        <p className="text-[10px] text-white/40">Accepts Visa, Mastercard, Amex, Apple Pay, Google Pay in USD, EUR, GBP</p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={integrationConfig.stripeEnabled}
                        onChange={(e) => setIntegrationConfig({ ...integrationConfig, stripeEnabled: e.target.checked })}
                        className="accent-gold w-4 h-4"
                      />
                      <span className="text-xs text-white font-medium">Active</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Stripe Publishable Key</label>
                    <input 
                      type="text"
                      value={integrationConfig.stripePublishableKey}
                      onChange={(e) => setIntegrationConfig({ ...integrationConfig, stripePublishableKey: e.target.value })}
                      className="w-full bg-[#111111] border border-white/15 px-3 py-1.5 text-xs text-white font-mono focus:border-gold outline-none"
                    />
                  </div>
                </div>

                {/* Razorpay */}
                <div className="p-4 bg-[#141414] border border-white/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <DollarSign className="text-gold" size={18} />
                      <div>
                        <p className="text-sm font-medium text-white">Razorpay (India & UPI Settlements)</p>
                        <p className="text-[10px] text-white/40">Supports UPI, Net Banking, Indian Cards for seamless INR transactions</p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={integrationConfig.razorpayEnabled}
                        onChange={(e) => setIntegrationConfig({ ...integrationConfig, razorpayEnabled: e.target.checked })}
                        className="accent-gold w-4 h-4"
                      />
                      <span className="text-xs text-white font-medium">Active</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Razorpay Key ID</label>
                    <input 
                      type="text"
                      value={integrationConfig.razorpayKeyId}
                      onChange={(e) => setIntegrationConfig({ ...integrationConfig, razorpayKeyId: e.target.value })}
                      className="w-full bg-[#111111] border border-white/15 px-3 py-1.5 text-xs text-white font-mono focus:border-gold outline-none"
                    />
                  </div>
                </div>

                {/* Alternative Methods */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#141414] border border-white/10 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-medium text-white">Armored Hand-Delivery (COD)</p>
                      <p className="text-[10px] text-white/40">Armed courier cash/draft collection</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={integrationConfig.codEnabled}
                      onChange={(e) => setIntegrationConfig({ ...integrationConfig, codEnabled: e.target.checked })}
                      className="accent-gold w-4 h-4"
                    />
                  </div>

                  <div className="p-4 bg-[#141414] border border-white/10 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-medium text-white">Private Bank Wire</p>
                      <p className="text-[10px] text-white/40">SWIFT / IBAN settlement</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={integrationConfig.bankWireEnabled}
                      onChange={(e) => setIntegrationConfig({ ...integrationConfig, bankWireEnabled: e.target.checked })}
                      className="accent-gold w-4 h-4"
                    />
                  </div>
                </div>
              </div>

              {/* Supabase Integration */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <h4 className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold flex items-center gap-2">
                    <Database size={13} /> 2. Supabase Cloud Database Integration
                  </h4>
                  <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    Configuration Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">
                      Supabase Project URL
                    </label>
                    <input 
                      type="url"
                      placeholder="https://your-project.supabase.co"
                      value={integrationConfig.supabaseUrl}
                      onChange={(e) => setIntegrationConfig({ ...integrationConfig, supabaseUrl: e.target.value })}
                      className="w-full bg-[#111111] border border-white/15 p-2.5 text-xs text-white font-mono focus:border-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">
                      Supabase Public Anon Key
                    </label>
                    <input 
                      type="text"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                      value={integrationConfig.supabaseAnonKey}
                      onChange={(e) => setIntegrationConfig({ ...integrationConfig, supabaseAnonKey: e.target.value })}
                      className="w-full bg-[#111111] border border-white/15 p-2.5 text-xs text-white font-mono focus:border-gold outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 bg-[#141414] border border-white/10 text-xs text-white/60 space-y-2">
                  <p className="font-semibold text-white">How Supabase connects to your ANOVI storefront:</p>
                  <p className="leading-relaxed">
                    1. Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-gold underline">supabase.com</a>.
                  </p>
                  <p className="leading-relaxed">
                    2. Run the SQL table migration script for <code className="text-white">products</code>, <code className="text-white">orders</code>, and <code className="text-white">inquiries</code> tables.
                  </p>
                  <p className="leading-relaxed">
                    3. Paste your Project URL and Anon API key above. The app stores all catalog modifications in client-side persistence and can synchronize directly with Supabase tables.
                  </p>
                </div>
              </div>

              {/* Data Backup & Factory Reset */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h4 className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold">
                  3. Catalog Backup & Safety
                </h4>

                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleExportData}
                      className="flex items-center gap-2 border border-white/20 hover:border-gold px-4 py-2 text-xs text-white transition-colors"
                    >
                      <Download size={14} /> Download JSON Backup
                    </button>

                    <label className="flex items-center gap-2 border border-white/20 hover:border-gold px-4 py-2 text-xs text-white transition-colors cursor-pointer">
                      <Upload size={14} /> Restore from JSON
                      <input 
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleImportData}
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="text-red-400 hover:text-red-300 text-xs underline"
                  >
                    Reset Vault to Initial Masterpieces
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  type="submit"
                  className="bg-gold text-onyx px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors duration-300 shadow-xl flex items-center gap-2"
                >
                  <Save size={14} />
                  <span>Save Integration Configurations</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Product Upload / Edit Modal */}
      <ProductFormModal 
        isOpen={isProductModalOpen}
        onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
        collectionsList={collectionsList}
      />
    </div>
  );
};
