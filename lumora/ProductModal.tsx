import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Plus, Sparkles, Upload, Image as LucideImage, Video, 
  Trash2, Check, DollarSign, Tag, Layers, RefreshCw, Eye, 
  AlertCircle, ChevronDown, CheckCircle2, User, Building2,
  Diamond, Gem, Compass, ShieldCheck
} from 'lucide-react';
import { Product, ChannelType, ProductStatus, Customer } from './types';

interface ProductModalProps {
  isOpen: boolean;
  initialProduct: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
  customers?: Customer[];
}

const CATEGORIES = [
  'Necklaces',
  'Rings',
  'Earrings',
  'Bracelets',
  'Brooches',
  'Pendants',
  'Bespoke Sets',
  'Bridal',
  'Watches'
];

const METALS = [
  'Platinum 950',
  'Platinum 900',
  '18k Yellow Gold',
  '18k White Gold',
  '18k Rose Gold',
  '22k Yellow Gold',
  '24k Pure Gold',
  '14k Yellow Gold',
  '14k White Gold',
  '14k Rose Gold',
  'Grade 5 Titanium',
  'Titanium & Diamond',
  'Sterling Silver 925'
];

// Curated high-resolution atelier jewelry photography for instant selection
const CURATED_JEWELRY_PHOTOS = [
  {
    label: 'Empress Diamond Necklace',
    category: 'Necklaces',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800'
  },
  {
    label: 'Solitaire Gold Ring',
    category: 'Rings',
    url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800'
  },
  {
    label: 'Teardrop Diamond Earrings',
    category: 'Earrings',
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800'
  },
  {
    label: 'Emerald Heritage Bangle',
    category: 'Bracelets',
    url: 'https://images.unsplash.com/photo-1611591475819-79b8b730ab61?auto=format&fit=crop&q=80&w=800'
  },
  {
    label: 'Halo Diamond Pendant',
    category: 'Pendants',
    url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800'
  },
  {
    label: 'Royal Sapphire Choker',
    category: 'Necklaces',
    url: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&q=80&w=800'
  },
  {
    label: 'Platinum Solitaire Band',
    category: 'Rings',
    url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=800'
  },
  {
    label: 'Cascading Chandelier Earrings',
    category: 'Earrings',
    url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800'
  }
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  initialProduct,
  onClose,
  onSave,
  customers = []
}) => {
  const isEditing = !!initialProduct;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Rings');
  const [material, setMaterial] = useState('18k Yellow Gold');
  const [price, setPrice] = useState<string>('');
  const [cost, setCost] = useState<string>('');
  const [stock, setStock] = useState<number>(1);
  const [status, setStatus] = useState<ProductStatus>('Available');
  const [description, setDescription] = useState('');
  const [channels, setChannels] = useState<ChannelType[]>([ChannelType.WEBSITE, ChannelType.OFFLINE]);

  // Extended Atelier Attributes
  const [grossWeight, setGrossWeight] = useState<string>('');
  const [netWeight, setNetWeight] = useState<string>('');
  const [caratWeight, setCaratWeight] = useState<string>('');
  const [stoneDetails, setStoneDetails] = useState<string>('');
  const [allocationType, setAllocationType] = useState<'stock' | 'customer'>('stock');
  const [taggedCustomer, setTaggedCustomer] = useState<string>('');
  const [vaultLocation, setVaultLocation] = useState<string>('Flagship Showroom Boutique');

  // Media Management
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);

  // UI state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [showPresets, setShowPresets] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'media'>('details');

  // Populate form on initialProduct change or open
  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name || '');
      setSku(initialProduct.sku || '');
      setCategory(initialProduct.category || 'Rings');
      setMaterial(initialProduct.material || '18k Yellow Gold');
      setPrice(initialProduct.price ? String(initialProduct.price) : '');
      setCost(initialProduct.cost || initialProduct.craftsmanCost ? String(initialProduct.cost || initialProduct.craftsmanCost) : '');
      setStock(initialProduct.stock ?? 1);
      setStatus(initialProduct.status || 'Available');
      setDescription(initialProduct.description || '');
      setChannels(initialProduct.channels && initialProduct.channels.length > 0 ? initialProduct.channels : [ChannelType.WEBSITE]);
      setImages(initialProduct.images && initialProduct.images.length > 0 ? initialProduct.images : []);
      setVideoUrl(initialProduct.video || '');
      setGrossWeight(initialProduct.grossWeight ? String(initialProduct.grossWeight) : '');
      setNetWeight(initialProduct.netWeight ? String(initialProduct.netWeight) : '');
      setCaratWeight(initialProduct.caratWeight ? String(initialProduct.caratWeight) : '');
      setStoneDetails(initialProduct.stoneDetails || '');
      setAllocationType(initialProduct.allocationType || (initialProduct.taggedCustomer ? 'customer' : 'stock'));
      setTaggedCustomer(initialProduct.taggedCustomer || '');
      setVaultLocation(initialProduct.vaultLocation || 'Flagship Showroom Boutique');
    } else {
      // Defaults for a new product
      const randomId = Math.floor(100 + Math.random() * 900);
      setName('');
      setSku(`LMR-R-${randomId}-GLD`);
      setCategory('Rings');
      setMaterial('18k Yellow Gold');
      setPrice('');
      setCost('');
      setStock(1);
      setStatus('Available');
      setDescription('');
      setChannels([ChannelType.WEBSITE, ChannelType.INSTAGRAM, ChannelType.OFFLINE]);
      setImages(['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800']);
      setVideoUrl('');
      setGrossWeight('');
      setNetWeight('');
      setCaratWeight('');
      setStoneDetails('');
      setAllocationType('stock');
      setTaggedCustomer('');
      setVaultLocation('Flagship Showroom Boutique');
    }
    setFormErrors({});
    setSelectedPhotoIdx(0);
    setActiveTab('details');
  }, [initialProduct, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Auto SKU generator helper
  const handleGenerateSku = () => {
    const catCode = (category[0] || 'J').toUpperCase();
    const metalCode = material.toLowerCase().includes('plat') ? 'PLAT' : 
                      material.toLowerCase().includes('rose') ? 'ROSE' :
                      material.toLowerCase().includes('white') ? 'WHT' :
                      material.toLowerCase().includes('silver') ? 'SLV' : 'GLD';
    const rand = Math.floor(100 + Math.random() * 900);
    setSku(`LMR-${catCode}-${rand}-${metalCode}`);
  };

  // Toggle channel
  const handleToggleChannel = (ch: ChannelType) => {
    if (channels.includes(ch)) {
      if (channels.length > 1) {
        setChannels(channels.filter(c => c !== ch));
      }
    } else {
      setChannels([...channels, ch]);
    }
  };

  // Add image by URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages(prev => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (selectedPhotoIdx >= images.length - 1) {
      setSelectedPhotoIdx(Math.max(0, images.length - 2));
    }
  };

  // Set as primary image
  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
    setSelectedPhotoIdx(0);
  };

  // AI Luxury Copywriting Generator
  const handleGenerateAiDescription = async () => {
    setIsGeneratingAi(true);
    try {
      const activeImg = images[0] || undefined;
      const res = await fetch('/api/gemini/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: activeImg,
          productName: name || `${material} ${category}`
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.name && (!name || name.startsWith('LMR-') || name.length < 5)) {
          setName(data.name);
        }
        if (data.description) {
          setDescription(data.description);
        }
      } else {
        // Fallback luxury generator if offline
        const adjective = ['Ethereal', 'Celestial', 'Imperial', 'Majestic', 'Sovereign', 'Opulent', 'Regal'][Math.floor(Math.random() * 7)];
        const generatedTitle = name || `${adjective} ${category} in ${material}`;
        setName(generatedTitle);
        setDescription(`An extraordinary atelier creation handcrafted in ${material}. Meticulously set with hand-selected precious gems, this piece showcases exceptional light performance and timeless high-jewelry architecture.`);
      }
    } catch (e) {
      console.warn('AI Description fallback:', e);
      const generatedTitle = name || `Lumora Atelier ${category}`;
      setName(generatedTitle);
      setDescription(`Handcrafted in ${material} with artisan precision, celebrating luminous brilliance and heirloom-level refinement.`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Form Validation & Submission
  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    const errors: { [key: string]: string } = {};

    if (!name.trim()) {
      errors.name = 'Please provide a piece name';
    }
    if (!sku.trim()) {
      errors.sku = 'SKU reference code is required';
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      errors.price = 'Please enter a valid retail price';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setActiveTab('details');
      return;
    }

    const finalProduct: Product = {
      ...(initialProduct || {}),
      id: initialProduct?.id || `lp-${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category,
      material,
      price: numPrice,
      cost: cost ? parseFloat(cost) : undefined,
      craftsmanCost: cost ? parseFloat(cost) : undefined,
      stock: Number(stock) || 0,
      status,
      channels,
      description: description.trim(),
      images: images.length > 0 ? images : (initialProduct?.images && initialProduct.images.length > 0 ? initialProduct.images : ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800']),
      video: videoUrl.trim() || undefined,
      grossWeight: grossWeight ? parseFloat(grossWeight) : undefined,
      netWeight: netWeight ? parseFloat(netWeight) : undefined,
      caratWeight: caratWeight ? parseFloat(caratWeight) : undefined,
      stoneDetails: stoneDetails.trim() || undefined,
      allocationType,
      taggedCustomer: allocationType === 'customer' ? taggedCustomer : undefined,
      vaultLocation: allocationType === 'stock' ? vaultLocation : undefined
    };

    onSave(finalProduct);
  };

  const primaryImage = images[selectedPhotoIdx] || images[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800';

  return (
    <div className="fixed inset-0 bg-lumora-charcoal/80 backdrop-blur-md flex items-center justify-center z-[150] p-3 sm:p-6 animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-5xl max-h-[92vh] rounded-sm shadow-2xl flex flex-col border border-black/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-black/[0.06] bg-lumora-bone/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-lumora-charcoal text-lumora-gold flex items-center justify-center shadow-inner">
              <Gem size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-bold text-lumora-charcoal">
                  {isEditing ? 'Edit Masterpiece Record' : 'Catalogue New Masterpiece'}
                </h3>
                <span className="text-[9px] uppercase tracking-widest font-mono bg-lumora-gold/15 text-lumora-gold px-2 py-0.5 rounded-sm font-bold">
                  {isEditing ? `ID: ${initialProduct?.id}` : 'Inventory Catalog'}
                </span>
              </div>
              <p className="text-[10px] text-lumora-taupe tracking-wider uppercase font-bold mt-0.5">
                {isEditing ? 'Modify specifications, media assets, and allocation' : 'Add a bespoke or ready-to-wear jewel into the master collection'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Presets Toggle */}
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-all border flex items-center gap-1.5 rounded-sm ${
                showPresets 
                  ? 'bg-lumora-gold text-white border-lumora-gold' 
                  : 'bg-white text-lumora-charcoal border-black/15 hover:border-black/30'
              }`}
              title="Browse sample luxury photography"
            >
              <LucideImage size={12} /> {showPresets ? 'Hide Presets' : 'Sample Photos'}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center text-lumora-taupe hover:text-lumora-charcoal hover:bg-black/5 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Optional Presets Drawer */}
        {showPresets && (
          <div className="bg-lumora-charcoal text-white p-4 border-b border-black/10 shrink-0 animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-lumora-gold flex items-center gap-1.5">
                <Sparkles size={12} /> Click to use curated high-jewelry photography
              </span>
              <button 
                type="button" 
                onClick={() => setShowPresets(false)}
                className="text-white/40 hover:text-white text-[9px] uppercase tracking-wider"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {CURATED_JEWELRY_PHOTOS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (!images.includes(item.url)) {
                      setImages(prev => [item.url, ...prev]);
                    }
                    if (!name) setName(item.label);
                    setCategory(item.category);
                    setShowPresets(false);
                  }}
                  className="group relative aspect-square rounded-sm overflow-hidden border border-white/10 hover:border-lumora-gold transition-all"
                  title={`${item.label} (${item.category})`}
                >
                  <img src={item.url} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] font-bold text-white text-center p-1">
                    Select
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab Navigation for Dense Luxury Form */}
        <div className="flex items-center px-6 border-b border-black/[0.05] bg-white gap-6 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 text-[10px] uppercase font-bold tracking-[0.18em] border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'border-lumora-gold text-lumora-charcoal'
                : 'border-transparent text-lumora-taupe hover:text-lumora-charcoal'
            }`}
          >
            <Diamond size={13} className={activeTab === 'details' ? 'text-lumora-gold' : 'opacity-50'} />
            Core Identification & Price
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`py-3 text-[10px] uppercase font-bold tracking-[0.18em] border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'specs'
                ? 'border-lumora-gold text-lumora-charcoal'
                : 'border-transparent text-lumora-taupe hover:text-lumora-charcoal'
            }`}
          >
            <Layers size={13} className={activeTab === 'specs' ? 'text-lumora-gold' : 'opacity-50'} />
            Gems, Weight & Allocation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`py-3 text-[10px] uppercase font-bold tracking-[0.18em] border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'media'
                ? 'border-lumora-gold text-lumora-charcoal'
                : 'border-transparent text-lumora-taupe hover:text-lumora-charcoal'
            }`}
          >
            <LucideImage size={13} className={activeTab === 'media' ? 'text-lumora-gold' : 'opacity-50'} />
            Visual Assets ({images.length})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: CORE DETAILS */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left preview card */}
              <div className="md:col-span-4 space-y-4">
                <div className="bg-lumora-bone/50 border border-black/10 rounded-sm p-4 text-center">
                  <div className="relative aspect-square w-full bg-white rounded-sm overflow-hidden border border-black/5 shadow-inner mb-3">
                    <img 
                      src={primaryImage} 
                      alt={name || 'Jewelry Piece'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800');
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`text-[8px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm border ${
                        status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        status === 'Reserved' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        status === 'Sold' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-stone-50 text-stone-700 border-stone-200'
                      }`}>
                        {status}
                      </span>
                    </div>
                  </div>

                  <div className="text-left space-y-1">
                    <p className="text-[9px] font-mono uppercase text-lumora-taupe">{sku || 'SKU PENDING'}</p>
                    <h4 className="font-serif font-bold text-sm text-lumora-charcoal line-clamp-1">{name || 'Unnamed Piece'}</h4>
                    <p className="text-sm font-bold text-lumora-gold font-mono">
                      {price ? `$${parseFloat(price).toLocaleString()}` : '$0.00'}
                    </p>
                  </div>

                  {/* Button to switch to media tab */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('media')}
                    className="w-full mt-3 py-2 text-[9px] font-bold uppercase tracking-widest text-lumora-charcoal border border-black/15 hover:bg-black/5 transition-colors rounded-sm flex items-center justify-center gap-1.5"
                  >
                    <LucideImage size={12} /> Manage {images.length} Media Assets
                  </button>
                </div>

                {/* AI Assistant Callout */}
                <div className="bg-lumora-charcoal text-white p-4 rounded-sm border border-lumora-gold/30 space-y-2.5">
                  <div className="flex items-center gap-2 text-lumora-gold">
                    <Sparkles size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">AI Atelier Copywriter</span>
                  </div>
                  <p className="text-[10px] text-white/70 leading-relaxed">
                    Have Gemini analyze your selected photo and craft a high-end title and evocative luxury description.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateAiDescription}
                    disabled={isGeneratingAi}
                    className="w-full py-2 bg-lumora-gold hover:bg-lumora-gold/90 text-white text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {isGeneratingAi ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" /> Drafting Story...
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} /> Generate Luxury Story
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right primary inputs */}
              <div className="md:col-span-8 space-y-5">
                {/* Piece Title & SKU */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8 space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-charcoal flex items-center justify-between">
                      <span>Creation Name <span className="text-rose-500">*</span></span>
                      {formErrors.name && <span className="text-rose-600 normal-case text-[10px]">{formErrors.name}</span>}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
                      }}
                      placeholder="e.g. Celestial Diamond Empress Necklace"
                      className={`w-full px-3.5 py-2.5 bg-white border text-xs focus:outline-none focus:border-lumora-gold rounded-sm ${
                        formErrors.name ? 'border-rose-400' : 'border-black/15'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-charcoal">
                        SKU Reference <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateSku}
                        className="text-[9px] font-bold text-lumora-gold hover:underline flex items-center gap-0.5"
                      >
                        <RefreshCw size={9} /> Auto
                      </button>
                    </div>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => {
                        setSku(e.target.value.toUpperCase());
                        if (formErrors.sku) setFormErrors(prev => ({ ...prev, sku: '' }));
                      }}
                      placeholder="LMR-R-001-GOLD"
                      className={`w-full px-3 py-2.5 bg-white border text-xs font-mono uppercase focus:outline-none focus:border-lumora-gold rounded-sm ${
                        formErrors.sku ? 'border-rose-400' : 'border-black/15'
                      }`}
                    />
                  </div>
                </div>

                {/* Category & Material */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-charcoal">
                      Jewelry Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs focus:outline-none focus:border-lumora-gold rounded-sm"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-charcoal">
                      Precious Metal / Material <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs focus:outline-none focus:border-lumora-gold rounded-sm"
                    >
                      {METALS.map(met => (
                        <option key={met} value={met}>{met}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-charcoal flex items-center justify-between">
                      <span>Retail Price ($) <span className="text-rose-500">*</span></span>
                      {formErrors.price && <span className="text-rose-600 normal-case text-[10px]">{formErrors.price}</span>}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lumora-taupe text-xs font-bold">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => {
                          setPrice(e.target.value);
                          if (formErrors.price) setFormErrors(prev => ({ ...prev, price: '' }));
                        }}
                        placeholder="18500.00"
                        className={`w-full pl-7 pr-3 py-2.5 bg-white border text-xs font-mono font-bold focus:outline-none focus:border-lumora-gold rounded-sm ${
                          formErrors.price ? 'border-rose-400' : 'border-black/15'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-charcoal">
                      Atelier Cost / Cost Price ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lumora-taupe text-xs font-bold">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        placeholder="8200.00"
                        className="w-full pl-7 pr-3 py-2.5 bg-white border border-black/15 text-xs font-mono focus:outline-none focus:border-lumora-gold rounded-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-charcoal">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs font-mono focus:outline-none focus:border-lumora-gold rounded-sm"
                    />
                  </div>
                </div>

                {/* Status & Sales Channels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-charcoal">
                      Availability Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ProductStatus)}
                      className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs focus:outline-none focus:border-lumora-gold rounded-sm"
                    >
                      <option value="Available">Available (In Showroom/Vault)</option>
                      <option value="Reserved">Reserved (Client Hold)</option>
                      <option value="Sold">Sold</option>
                      <option value="Draft">Draft / In Production</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-charcoal">
                      Active Sales Channels
                    </label>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {[
                        { type: ChannelType.WEBSITE, label: 'Website' },
                        { type: ChannelType.INSTAGRAM, label: 'Instagram' },
                        { type: ChannelType.WHATSAPP, label: 'WhatsApp' },
                        { type: ChannelType.OFFLINE, label: 'Boutique/Salon' }
                      ].map(ch => {
                        const isSelected = channels.includes(ch.type);
                        return (
                          <button
                            key={ch.type}
                            type="button"
                            onClick={() => handleToggleChannel(ch.type)}
                            className={`px-2.5 py-1 text-[9px] uppercase font-bold tracking-wider rounded-sm transition-all border ${
                              isSelected 
                                ? 'bg-lumora-charcoal text-white border-lumora-charcoal' 
                                : 'bg-white text-lumora-taupe border-black/10 hover:border-black/30'
                            }`}
                          >
                            {isSelected && <Check size={10} className="inline mr-1 text-lumora-gold" />}
                            {ch.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Poetic Description */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-charcoal">
                      Atelier Editorial Description
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateAiDescription}
                      disabled={isGeneratingAi}
                      className="text-[9px] font-bold uppercase tracking-wider text-lumora-gold hover:underline flex items-center gap-1"
                    >
                      <Sparkles size={10} /> AI Polish
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Craft a bespoke narrative for this jewel, detailing its provenance, cut, brilliance, and signature artisan techniques..."
                    className="w-full px-3.5 py-2.5 bg-white border border-black/15 text-xs focus:outline-none focus:border-lumora-gold rounded-sm leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPECS & ALLOCATION */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              {/* Gemstone and Weights */}
              <div className="bg-lumora-bone/30 p-5 rounded-sm border border-black/[0.06] space-y-4">
                <div className="flex items-center gap-2 border-b border-black/[0.06] pb-3">
                  <Diamond size={16} className="text-lumora-gold" />
                  <h4 className="font-serif font-bold text-sm text-lumora-charcoal">Gemstone & Weight Specifications</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-charcoal">
                      Total Carat Weight (tcw)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={caratWeight}
                        onChange={(e) => setCaratWeight(e.target.value)}
                        placeholder="2.50"
                        className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs font-mono focus:outline-none focus:border-lumora-gold rounded-sm"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-lumora-taupe font-bold uppercase">ct</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-charcoal">
                      Gross Piece Weight
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={grossWeight}
                        onChange={(e) => setGrossWeight(e.target.value)}
                        placeholder="14.80"
                        className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs font-mono focus:outline-none focus:border-lumora-gold rounded-sm"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-lumora-taupe font-bold uppercase">g</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-charcoal">
                      Net Metal Weight
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={netWeight}
                        onChange={(e) => setNetWeight(e.target.value)}
                        placeholder="14.30"
                        className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs font-mono focus:outline-none focus:border-lumora-gold rounded-sm"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-lumora-taupe font-bold uppercase">g</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-charcoal">
                    Center Stone & Accent Details
                  </label>
                  <input
                    type="text"
                    value={stoneDetails}
                    onChange={(e) => setStoneDetails(e.target.value)}
                    placeholder="e.g. 1.80ct Oval Brilliant Cut Diamond (D / VVS1) with 48 pavé micro-diamonds"
                    className="w-full px-3.5 py-2.5 bg-white border border-black/15 text-xs focus:outline-none focus:border-lumora-gold rounded-sm"
                  />
                </div>
              </div>

              {/* Atelier Allocation & Tagging Track */}
              <div className="bg-white p-5 rounded-sm border border-black/[0.08] space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-lumora-gold" />
                    <h4 className="font-serif font-bold text-sm text-lumora-charcoal">Atelier Piece Allocation & Tagging</h4>
                  </div>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-lumora-taupe">
                    Integrated with Payments & Advances
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div 
                    onClick={() => setAllocationType('stock')}
                    className={`p-4 rounded-sm border cursor-pointer transition-all flex items-start gap-3 ${
                      allocationType === 'stock'
                        ? 'border-lumora-gold bg-lumora-gold/5 ring-1 ring-lumora-gold/30'
                        : 'border-black/10 hover:border-black/25 bg-white'
                    }`}
                  >
                    <Building2 size={18} className={allocationType === 'stock' ? 'text-lumora-gold shrink-0' : 'text-lumora-taupe shrink-0'} />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-lumora-charcoal">For Showroom Stock</span>
                        {allocationType === 'stock' && <CheckCircle2 size={13} className="text-lumora-gold" />}
                      </div>
                      <p className="text-[10px] text-lumora-taupe leading-relaxed">
                        Ready piece in atelier collection, available for immediate walk-in client viewings and acquisition.
                      </p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setAllocationType('customer')}
                    className={`p-4 rounded-sm border cursor-pointer transition-all flex items-start gap-3 ${
                      allocationType === 'customer'
                        ? 'border-lumora-gold bg-lumora-gold/5 ring-1 ring-lumora-gold/30'
                        : 'border-black/10 hover:border-black/25 bg-white'
                    }`}
                  >
                    <User size={18} className={allocationType === 'customer' ? 'text-lumora-gold shrink-0' : 'text-lumora-taupe shrink-0'} />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-lumora-charcoal">Tagged to Client</span>
                        {allocationType === 'customer' && <CheckCircle2 size={13} className="text-lumora-gold" />}
                      </div>
                      <p className="text-[10px] text-lumora-taupe leading-relaxed">
                        Reserved for or commissioned by a specific patron. Links directly into the Client Advances financial ledger.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub-fields depending on allocation */}
                {allocationType === 'customer' ? (
                  <div className="p-4 bg-lumora-bone/40 rounded-sm border border-black/10 space-y-2 animate-in fade-in">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-charcoal">
                      Select or Specify Client Name
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {customers.length > 0 && (
                        <select
                          value={taggedCustomer}
                          onChange={(e) => setTaggedCustomer(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-black/15 text-xs focus:outline-none focus:border-lumora-gold rounded-sm"
                        >
                          <option value="">-- Choose from Registered Clients --</option>
                          {customers.map(c => (
                            <option key={c.id} value={c.name}>{c.name} ({c.id})</option>
                          ))}
                        </select>
                      )}
                      <input
                        type="text"
                        value={taggedCustomer}
                        onChange={(e) => setTaggedCustomer(e.target.value)}
                        placeholder="Or enter client name / reservation code..."
                        className="flex-1 px-3 py-2 bg-white border border-black/15 text-xs focus:outline-none focus:border-lumora-gold rounded-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-lumora-bone/40 rounded-sm border border-black/10 space-y-2 animate-in fade-in">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-charcoal">
                      Atelier Vault / Showcase Location
                    </label>
                    <select
                      value={vaultLocation}
                      onChange={(e) => setVaultLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-black/15 text-xs focus:outline-none focus:border-lumora-gold rounded-sm"
                    >
                      <option value="Flagship Showroom Boutique">Flagship Showroom Boutique (Salon A)</option>
                      <option value="Private Vault - Safebox 4">Private Vault - Safebox 4</option>
                      <option value="Exhibition Showcase Center">Exhibition Showcase Center</option>
                      <option value="Master Goldsmith Workshop">Master Goldsmith Workshop (In Finishing)</option>
                      <option value="Geneva Consignment Suite">Geneva Consignment Suite</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA ASSETS */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Media Upload and URL input */}
              <div className="bg-lumora-bone/30 p-5 rounded-sm border border-black/[0.06] space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-black/[0.06] pb-3">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-lumora-charcoal">High-Resolution Media Catalog</h4>
                    <p className="text-[10px] text-lumora-taupe tracking-wider uppercase font-bold mt-0.5">
                      Support for studio photography, multiple angle perspectives, and 360° videos
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-lumora-charcoal text-white hover:bg-lumora-gold text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm flex items-center gap-1.5 shadow-sm"
                    >
                      <Upload size={12} /> Upload Photo Files
                    </button>
                  </div>
                </div>

                {/* Direct URL input */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <LucideImage size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lumora-taupe" />
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      placeholder="Paste image web link (e.g. https://images.unsplash.com/...)"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-black/15 text-xs focus:outline-none focus:border-lumora-gold rounded-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-5 py-2 bg-white text-lumora-charcoal border border-black/20 hover:border-lumora-gold hover:text-lumora-gold text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm shrink-0"
                  >
                    + Add Link
                  </button>
                </div>

                {/* 360 Video Link */}
                <div className="relative pt-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-lumora-charcoal block mb-1">
                    360° Video Render Link (Optional MP4/WebM)
                  </label>
                  <div className="relative">
                    <Video size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lumora-taupe" />
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-black/15 text-xs focus:outline-none focus:border-lumora-gold rounded-sm font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Strip & Reordering */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-lumora-charcoal">
                    Cataloged Photos ({images.length})
                  </span>
                  <span className="text-[9px] text-lumora-taupe uppercase tracking-wider">
                    First photo serves as the primary catalogue cover
                  </span>
                </div>

                {images.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-black/15 rounded-sm bg-lumora-bone/20 space-y-2">
                    <LucideImage size={32} className="mx-auto text-lumora-taupe/50" />
                    <p className="text-xs font-serif text-lumora-charcoal">No photos added yet</p>
                    <p className="text-[10px] text-lumora-taupe">Upload an image file, paste a link, or pick from the sample presets.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {images.map((img, idx) => {
                      const isPrimary = idx === 0;
                      return (
                        <div 
                          key={idx} 
                          className={`group relative aspect-square rounded-sm overflow-hidden border transition-all ${
                            isPrimary 
                              ? 'border-lumora-gold ring-2 ring-lumora-gold/30 shadow-md' 
                              : 'border-black/10 hover:border-black/30'
                          }`}
                        >
                          <img src={img} alt={`Asset ${idx + 1}`} className="w-full h-full object-cover" />
                          
                          {/* Primary tag */}
                          {isPrimary && (
                            <span className="absolute top-1.5 left-1.5 z-10 bg-lumora-gold text-white text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-xs shadow">
                              Primary
                            </span>
                          )}

                          {/* Hover action overlay */}
                          <div className="absolute inset-0 bg-lumora-charcoal/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="text-white/70 hover:text-rose-400 p-1 transition-colors"
                                title="Delete image"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            
                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="w-full py-1 bg-white/90 hover:bg-white text-lumora-charcoal text-[8px] font-bold uppercase tracking-widest rounded-xs transition-colors"
                              >
                                Set Primary
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </form>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-black/[0.08] bg-lumora-bone/20 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-[10px] text-lumora-taupe font-mono">
            <span>Status: <strong className="text-lumora-charcoal uppercase">{status}</strong></span>
            <span>•</span>
            <span>Est. Profit: <strong className="text-emerald-700 font-bold">
              {price && cost && parseFloat(price) > parseFloat(cost) 
                ? `$${(parseFloat(price) - parseFloat(cost)).toLocaleString()} (${Math.round(((parseFloat(price) - parseFloat(cost)) / parseFloat(price)) * 100)}%)` 
                : 'N/A'}
            </strong></span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-[10px] uppercase font-bold tracking-[0.2em] text-lumora-charcoal hover:bg-black/5 border border-black/10 rounded-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="product-form"
              onClick={(e) => handleSubmit(e)}
              className="px-7 py-2.5 bg-lumora-gold text-white hover:bg-lumora-gold/90 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm transition-all flex items-center gap-2 shadow-md active:scale-95"
            >
              <Check size={14} />
              {isEditing ? 'Update Masterpiece' : 'Catalogue Piece'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
