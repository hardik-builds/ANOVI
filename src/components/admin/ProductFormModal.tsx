import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, Trash2, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import { JewelryItem } from '../../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<JewelryItem>) => void;
  initialProduct?: JewelryItem | null;
  collectionsList: string[];
}

const CATEGORIES = [
  'Earrings',
  'Necklaces',
  'Rings',
  'Bracelets',
  'Pearls',
  'Silver',
  'Radiance',
  'The Singularities'
];

const SUB_CATEGORIES = [
  'Akoya',
  'Tahitian',
  'Fresh Water',
  'Necklaces',
  'Bracelets',
  'Earrings',
  'Statement Ring',
  'Solitaire',
  'Choker',
  'Pendant'
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
  collectionsList,
}) => {
  const [name, setName] = useState('');
  const [collection, setCollection] = useState('');
  const [customCollection, setCustomCollection] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subCategory, setSubCategory] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [video, setVideo] = useState('');
  const [description, setDescription] = useState('');
  const [materials, setMaterials] = useState('');
  const [shippingCost, setShippingCost] = useState('$50');
  const [details, setDetails] = useState<string[]>(['Signature ANOVI hallmark', 'Handcrafted in our London atelier']);
  const [newDetailText, setNewDetailText] = useState('');
  const [inStock, setInStock] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [stockCount, setStockCount] = useState(1);
  const [imageInputMethod, setImageInputMethod] = useState<'upload' | 'url'>('upload');
  const [error, setError] = useState('');

  const primaryFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name || '');
      setCollection(initialProduct.collection || '');
      setCategory(initialProduct.category || CATEGORIES[0]);
      setSubCategory(initialProduct.subCategory || '');
      setPrice(initialProduct.price || '');
      setImage(initialProduct.image || '');
      setAdditionalImages(initialProduct.images || []);
      setVideo(initialProduct.video || '');
      setDescription(initialProduct.description || '');
      setMaterials(initialProduct.materials || '');
      setShippingCost(initialProduct.shippingCost || '$50');
      setDetails(initialProduct.details && initialProduct.details.length > 0 ? initialProduct.details : ['Signature ANOVI hallmark']);
      setInStock(initialProduct.inStock ?? true);
      setFeatured(initialProduct.featured ?? (initialProduct.category === 'The Singularities'));
      setStockCount(initialProduct.stockCount ?? 1);
    } else {
      setName('');
      setCollection(collectionsList[0] || "L'Aurore");
      setCategory(CATEGORIES[0]);
      setSubCategory('');
      setPrice('$4,500');
      setImage('');
      setAdditionalImages([]);
      setVideo('');
      setDescription('');
      setMaterials('18k White Gold, South Sea Pearls, 0.50ct Diamonds');
      setShippingCost('$50');
      setDetails([
        'Ethically sourced gemstones and precious metals',
        'Signature ANOVI hallmark',
        'Handcrafted in our London atelier'
      ]);
      setInStock(true);
      setFeatured(false);
      setStockCount(1);
    }
    setError('');
  }, [initialProduct, isOpen, collectionsList]);

  if (!isOpen) return null;

  // Handle local file upload & convert to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (isGallery) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setAdditionalImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddDetail = () => {
    if (!newDetailText.trim()) return;
    setDetails([...details, newDetailText.trim()]);
    setNewDetailText('');
  };

  const handleRemoveDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleRemoveGalleryImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a piece name.');
      return;
    }
    if (!image.trim()) {
      setError('Please provide a primary image via file upload or image URL.');
      return;
    }

    const finalCollection = collection === 'CUSTOM' ? (customCollection.trim() || 'High Jewelry') : collection;
    let formattedPrice = price.trim();
    if (!formattedPrice.startsWith('$') && !formattedPrice.startsWith('€') && !formattedPrice.startsWith('£') && !formattedPrice.startsWith('₹')) {
      formattedPrice = `$${formattedPrice}`;
    }

    const productPayload: Partial<JewelryItem> = {
      name: name.trim(),
      collection: finalCollection,
      category: category as any,
      subCategory: subCategory.trim() ? subCategory as any : undefined,
      price: formattedPrice,
      image: image.trim(),
      images: additionalImages.length > 0 ? additionalImages : [image.trim()],
      video: video.trim() || undefined,
      description: description.trim(),
      materials: materials.trim(),
      shippingCost: shippingCost.trim(),
      details: details.filter(d => d.trim().length > 0),
      inStock,
      featured,
      stockCount: Number(stockCount) || 1,
    };

    onSave(productPayload);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 overflow-y-auto">
      <div className="bg-ivory border border-onyx/10 text-onyx max-w-4xl w-full my-auto rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 bg-onyx text-white flex justify-between items-center border-b border-gold/30">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-gold font-semibold">Atelier Master Catalog</p>
            <h3 className="text-2xl font-serif italic">
              {initialProduct ? `Edit Piece: ${initialProduct.name}` : 'Upload New Haute Joaillerie Creation'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold border-b border-onyx/10 pb-2">
              1. Creation Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-onyx/70">
                  Piece Name *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Celestial Diamond Solitaire"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-onyx/15 px-4 py-2.5 text-sm focus:border-gold outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-onyx/70">
                  Price (e.g. $4,200) *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="$4,200"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-white border border-onyx/15 px-4 py-2.5 text-sm focus:border-gold outline-none transition-colors font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-onyx/70">
                  Collection *
                </label>
                <select
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  className="w-full bg-white border border-onyx/15 px-4 py-2.5 text-xs focus:border-gold outline-none transition-colors"
                >
                  {collectionsList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="CUSTOM">+ New Custom Collection...</option>
                </select>
                {collection === 'CUSTOM' && (
                  <input 
                    type="text"
                    placeholder="Enter Collection Name"
                    value={customCollection}
                    onChange={(e) => setCustomCollection(e.target.value)}
                    className="w-full mt-2 bg-white border border-onyx/15 px-3 py-1.5 text-xs focus:border-gold outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-onyx/70">
                  Primary Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-onyx/15 px-4 py-2.5 text-xs focus:border-gold outline-none transition-colors"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-onyx/70">
                  Sub-Category (Optional)
                </label>
                <input 
                  type="text"
                  list="subcategories-datalist"
                  placeholder="e.g. Akoya or Earrings"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full bg-white border border-onyx/15 px-4 py-2.5 text-xs focus:border-gold outline-none transition-colors"
                />
                <datalist id="subcategories-datalist">
                  {SUB_CATEGORIES.map(sub => (
                    <option key={sub} value={sub} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Section 2: Imagery & Visual Assets */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold border-b border-onyx/10 pb-2">
              2. Photography & Media
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Primary Image Upload */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-onyx/70">
                    Primary Showcase Image *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setImageInputMethod('upload')}
                      className={`text-[9px] uppercase tracking-wider px-2 py-0.5 ${imageInputMethod === 'upload' ? 'bg-gold text-white font-bold' : 'text-onyx/50 border border-onyx/10'}`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMethod('url')}
                      className={`text-[9px] uppercase tracking-wider px-2 py-0.5 ${imageInputMethod === 'url' ? 'bg-gold text-white font-bold' : 'text-onyx/50 border border-onyx/10'}`}
                    >
                      Direct URL
                    </button>
                  </div>
                </div>

                {imageInputMethod === 'upload' ? (
                  <div 
                    onClick={() => primaryFileInputRef.current?.click()}
                    className="border-2 border-dashed border-onyx/20 hover:border-gold p-6 text-center cursor-pointer transition-colors bg-white group flex flex-col items-center justify-center min-h-[160px]"
                  >
                    <Upload size={28} className="text-onyx/30 group-hover:text-gold mb-2 transition-colors" />
                    <p className="text-xs font-medium text-onyx/80">Click or Drag & Drop Product Photo</p>
                    <p className="text-[9px] text-onyx/40 mt-1 uppercase tracking-widest">PNG, JPG, WEBP up to 10MB</p>
                    <input 
                      ref={primaryFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, false)}
                    />
                  </div>
                ) : (
                  <input 
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full bg-white border border-onyx/15 px-4 py-2.5 text-xs focus:border-gold outline-none font-mono"
                  />
                )}

                {image && (
                  <div className="relative aspect-square max-w-[200px] border border-onyx/10 overflow-hidden bg-onyx/5 group mt-3">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="absolute top-2 right-2 bg-onyx/80 text-white p-1 hover:bg-red-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Gallery Images & Video */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-onyx/70">
                      Additional Gallery Images ({additionalImages.length})
                    </label>
                    <button
                      type="button"
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="text-[9px] uppercase tracking-widest text-gold hover:underline font-bold flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Images
                    </button>
                    <input 
                      ref={galleryFileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, true)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 min-h-[70px] p-2 bg-white border border-onyx/10">
                    {additionalImages.length === 0 ? (
                      <p className="text-[10px] text-onyx/40 italic p-2">No additional gallery photos added yet.</p>
                    ) : (
                      additionalImages.map((img, idx) => (
                        <div key={idx} className="relative w-14 h-14 border border-onyx/10 group overflow-hidden bg-onyx/5">
                          <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="absolute inset-0 bg-onyx/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-onyx/70">
                    Showcase Video URL (Optional)
                  </label>
                  <input 
                    type="url"
                    placeholder="https://assets.mixkit.co/...mp4"
                    value={video}
                    onChange={(e) => setVideo(e.target.value)}
                    className="w-full bg-white border border-onyx/15 px-4 py-2 text-xs focus:border-gold outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Craftsmanship, Story & Specs */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold border-b border-onyx/10 pb-2">
              3. Craftsmanship & Descriptions
            </h4>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-onyx/70">
                Materials & Gemological Specifications
              </label>
              <input 
                type="text"
                placeholder="e.g. 18k White Gold, South Sea Pearls, 0.45ct Pavé Diamonds"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                className="w-full bg-white border border-onyx/15 px-4 py-2.5 text-sm focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-onyx/70">
                Editorial Description & Lore
              </label>
              <textarea 
                rows={3}
                placeholder="Hand-selected South Sea pearls suspended from 18k white gold and pavé diamonds..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-onyx/15 p-3 text-sm focus:border-gold outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Bullet Details */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-onyx/70">
                Atelier Specifications (Bullet Points)
              </label>
              <div className="space-y-2 mb-3">
                {details.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white px-3 py-1.5 border border-onyx/10 text-xs">
                    <span className="text-gold font-serif">✦</span>
                    <span className="flex-1">{detail}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDetail(idx)}
                      className="text-onyx/40 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="e.g. GIA certified sapphire, G-H color, VS clarity"
                  value={newDetailText}
                  onChange={(e) => setNewDetailText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddDetail(); } }}
                  className="flex-1 bg-white border border-onyx/15 px-3 py-2 text-xs focus:border-gold outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddDetail}
                  className="bg-onyx text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-gold transition-colors"
                >
                  Add Spec
                </button>
              </div>
            </div>

            {/* Inventory & Highlight Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-onyx/5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-onyx/70">
                  Stock Units Available
                </label>
                <input 
                  type="number"
                  min="0"
                  value={stockCount}
                  onChange={(e) => setStockCount(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-onyx/15 px-3 py-2 text-xs focus:border-gold outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-onyx/70">
                  Estimated Shipping Fee
                </label>
                <input 
                  type="text"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  className="w-full bg-white border border-onyx/15 px-3 py-2 text-xs focus:border-gold outline-none font-mono"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="w-4 h-4 accent-gold"
                  />
                  <span className="text-xs font-medium">Available for Instant Acquisition</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-gold"
                  />
                  <span className="text-xs font-medium text-gold font-bold">Feature in The Singularities Showcase</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-onyx/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-onyx/20 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-onyx/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gold text-white px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-onyx transition-colors duration-300 shadow-lg flex items-center gap-2"
            >
              <Check size={14} />
              {initialProduct ? 'Save Changes' : 'Publish Creation to Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
