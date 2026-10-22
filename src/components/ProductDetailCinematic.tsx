import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  Heart, 
  Share2, 
  X, 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Info, 
  Star, 
  Maximize2,
  Check,
  ArrowRight
} from 'lucide-react';
import { JewelryItem, Review } from '../types';
import { Logo } from './Logo';

interface ProductDetailCinematicProps {
  product: JewelryItem;
  currency: string;
  onBack: () => void;
  onAddToCart: (product: JewelryItem) => void;
  onBuyNow: (product: JewelryItem) => void;
  onOpenCart: () => void;
  cartCount: number;
  formatPrice: (price: string) => string;
  onOpenBespokeInquiry?: (productName: string) => void;
}

export const ProductDetailCinematic: React.FC<ProductDetailCinematicProps> = ({
  product,
  currency,
  onBack,
  onAddToCart,
  onBuyNow,
  onOpenCart,
  cartCount,
  formatPrice,
  onOpenBespokeInquiry,
}) => {
  // All available media panels: primary image + additional images
  const mediaList = React.useMemo(() => {
    const list: { type: 'image' | 'video'; url: string; label: string }[] = [];
    if (product.image) {
      list.push({ type: 'image', url: product.image, label: 'Perspective I · Atelier Primary' });
    }
    if (product.images && product.images.length > 0) {
      product.images.forEach((img, idx) => {
        if (img !== product.image) {
          list.push({ type: 'image', url: img, label: `Perspective ${idx + 2} · Macro Detail` });
        }
      });
    }
    if (product.video) {
      list.push({ type: 'video', url: product.video, label: 'Perspective · Kinetic Light Reflection' });
    }
    // If only 1 image, duplicate with alternate crop to fill the dual-screen panoramic experience
    if (list.length === 1) {
      list.push({ type: 'image', url: product.image, label: 'Perspective II · Gemological Close-up' });
    }
    return list;
  }, [product]);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isWishlist, setIsWishlist] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<'materials' | 'craftsmanship' | null>(null);
  const [isAddedToast, setIsAddedToast] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [isControllerCollapsed, setIsControllerCollapsed] = useState(false);

  // Review form state
  const [reviewsList, setReviewsList] = useState<Review[]>(product.reviews || []);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [newReviewer, setNewReviewer] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      handleNextMedia();
    } else if (diff < -40) {
      handlePrevMedia();
    }
    touchStartX.current = null;
  };

  const handleNextMedia = () => {
    setActiveMediaIndex((prev) => (prev + 1) % mediaList.length);
  };

  const handlePrevMedia = () => {
    setActiveMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  const handleAddToCart = () => {
    onAddToCart(product);
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2500);
  };

  const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomOrigin({ x, y });
  };

  const toggleZoom = () => {
    setZoomLevel(prev => prev > 1 ? 1 : 2.2);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewer.trim() || !newComment.trim()) return;
    const review: Review = {
      id: `rev_${Date.now()}`,
      reviewerName: newReviewer.trim(),
      rating: newRating,
      comment: newComment.trim(),
      date: new Date().toISOString().split('T')[0]
    };
    setReviewsList([review, ...reviewsList]);
    setNewReviewer('');
    setNewComment('');
    setIsReviewOpen(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNextMedia();
      if (e.key === 'ArrowLeft') handlePrevMedia();
      if (e.key === 'Escape') {
        if (isDetailsDrawerOpen) setIsDetailsDrawerOpen(false);
        else if (activeHotspot) setActiveHotspot(null);
        else onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailsDrawerOpen, activeHotspot, mediaList.length]);

  return (
    <div className="fixed inset-0 z-50 bg-[#EBE7E0] text-[#1A1A1A] select-none overflow-hidden font-sans">
      
      {/* 1. TOP MINIMALIST CHROME (Brunello Cucinelli Inspired) */}
      <header className="absolute top-0 left-0 right-0 z-30 px-6 md:px-12 py-5 flex items-center justify-between pointer-events-auto">
        {/* Left: Back Capsule Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/70 hover:bg-white text-onyx text-[11px] uppercase tracking-wider font-semibold transition-all duration-300 shadow-sm border border-black/5 backdrop-blur-md"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
        </div>

        {/* Center: Brand Crest & Wordmark */}
        <div className="flex flex-col items-center justify-center cursor-pointer text-center" onClick={onBack}>
          <span className="font-serif text-2xl tracking-[0.25em] -mr-[0.25em] inline-block text-[#1A1A1A] font-light">ANOVI</span>
          <span className="text-[9px] uppercase tracking-[0.35em] -mr-[0.35em] inline-block text-onyx/75 font-medium -mt-0.5">Haute Joaillerie · 1924</span>
        </div>

        {/* Right: Actions (Wishlist & Cart) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsWishlist(!isWishlist)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border border-black/5 backdrop-blur-md ${
              isWishlist ? 'bg-gold text-white' : 'bg-white/70 hover:bg-white text-onyx'
            }`}
            title="Save to Private Wishlist"
          >
            <Heart size={16} fill={isWishlist ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={onOpenCart}
            className="relative w-10 h-10 rounded-full bg-white/70 hover:bg-white text-onyx flex items-center justify-center transition-all duration-300 shadow-sm border border-black/5 backdrop-blur-md"
            title="View Commission Bag"
          >
            <ShoppingBag size={17} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-mono">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 2. FULLSCREEN PANORAMIC PRODUCT IMAGERY (MAJORITY OF SCREEN FOCUS) */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {/* Side-by-side Panoramic Image Columns (desktop) / Swipeable carousel */}
        <div 
          ref={scrollContainerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="w-full h-full flex flex-col lg:flex-row items-center justify-center relative bg-gradient-to-b from-[#ECE9E2] via-[#E8E4DD] to-[#E3DFD7]"
        >
          {/* Main Visual Display (Split View: Current Angle + Adjacent Perspective) */}
          <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 divide-x divide-black/5 items-center">
            
            {/* Panel 1: Primary active media angle */}
            <div 
              className="relative w-full h-full flex items-center justify-center p-6 md:p-12 overflow-hidden cursor-zoom-in group"
              onMouseMove={handleZoomMove}
              onClick={toggleZoom}
            >
              {mediaList[activeMediaIndex].type === 'video' ? (
                <video 
                  src={mediaList[activeMediaIndex].url}
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="max-h-[85vh] w-auto max-w-[90%] object-contain drop-shadow-2xl"
                />
              ) : (
                <motion.img 
                  key={mediaList[activeMediaIndex].url}
                  src={mediaList[activeMediaIndex].url} 
                  alt={product.name}
                  animate={{ 
                    scale: zoomLevel,
                    transformOrigin: zoomLevel > 1 ? `${zoomOrigin.x}% ${zoomOrigin.y}%` : '50% 50%'
                  }}
                  transition={{ 
                    scale: { type: 'spring', stiffness: 260, damping: 26 },
                    transformOrigin: { duration: 0.1, ease: 'easeOut' }
                  }}
                  className="max-h-[85vh] w-auto max-w-[90%] object-contain select-none transition-transform duration-500 hover:scale-[1.02]"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800';
                  }}
                />
              )}

              {/* Studio Perspective Tag */}
              <div className="absolute top-20 md:top-24 left-6 md:left-8 z-20 flex items-center gap-1.5">
                <span className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-mono font-medium text-onyx/90 bg-white/60 backdrop-blur-md px-3 py-1 rounded-full border border-black/5 shadow-xs">
                  {mediaList[activeMediaIndex].label}
                </span>
              </div>

              {/* Interactive Hotspot Pin on the piece: "MATERIALS +" */}
              {product.materials && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspot(activeHotspot === 'materials' ? null : 'materials');
                  }}
                  className="absolute bottom-36 left-12 lg:left-24 bg-onyx/70 hover:bg-onyx text-white backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1.5 shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Sparkles size={11} className="text-gold" />
                  <span>Materials +</span>
                </button>
              )}

              {/* Hotspot Popover Tooltip */}
              <AnimatePresence>
                {activeHotspot === 'materials' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-48 left-12 lg:left-24 z-30 bg-onyx/90 text-white backdrop-blur-xl p-5 rounded-2xl max-w-xs shadow-2xl border border-white/15"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] uppercase tracking-[0.25em] text-gold font-bold">Atelier Materials</span>
                      <button onClick={() => setActiveHotspot(null)} className="text-white/50 hover:text-white">
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-xs font-serif leading-relaxed text-white/90 mb-2">
                      {product.materials}
                    </p>
                    <p className="text-[10px] text-white/50 leading-normal">
                      Individually certified and hand-set in our London atelier with signature ANOVI hallmark engraving.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Panel 2: Second Angle / Craftsmanship perspective (Side-by-Side) */}
            <div 
              className="relative w-full h-full hidden lg:flex items-center justify-center p-6 md:p-12 overflow-hidden cursor-zoom-in group"
              onClick={handleNextMedia}
            >
              {(() => {
                const nextIndex = (activeMediaIndex + 1) % mediaList.length;
                const nextMedia = mediaList[nextIndex];
                return (
                  <>
                    <motion.img 
                      key={nextMedia.url}
                      src={nextMedia.url} 
                      alt={`${product.name} Second View`}
                      className="max-h-[85vh] w-auto max-w-[90%] object-contain select-none transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                    
                    {/* Studio Perspective Tag */}
                    <div className="absolute top-20 md:top-24 left-6 md:left-8 z-20 flex items-center gap-1.5">
                      <span className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-mono font-medium text-onyx/90 bg-white/60 backdrop-blur-md px-3 py-1 rounded-full border border-black/5 shadow-xs">
                        {nextMedia.label}
                      </span>
                    </div>

                    {/* Interactive Hotspot 2: "DETAILS +" */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDetailsDrawerOpen(true);
                      }}
                      className="absolute bottom-36 right-16 bg-white/70 hover:bg-white text-onyx backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1.5 shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Info size={11} className="text-gold" />
                      <span>Atelier Story +</span>
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Carousel Arrow Controls on Edges */}
        <button
          onClick={handlePrevMedia}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/60 hover:bg-white text-onyx flex items-center justify-center transition-all shadow-md backdrop-blur-md hover:scale-110"
          title="Previous Perspective"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={handleNextMedia}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/60 hover:bg-white text-onyx flex items-center justify-center transition-all shadow-md backdrop-blur-md hover:scale-110"
          title="Next Perspective"
        >
          <ChevronRight size={20} />
        </button>

        {/* Pagination Dots */}
        <div className="absolute top-20 right-12 z-20 hidden md:flex items-center gap-2">
          {mediaList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveMediaIndex(idx)}
              className={`h-1.5 transition-all duration-300 rounded-full ${
                activeMediaIndex === idx ? 'w-6 bg-gold' : 'w-1.5 bg-onyx/20 hover:bg-onyx/40'
              }`}
              title={`View ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 3. FLOATING GLASS PRODUCT CONTROLLER (Identical layout to Brunello Cucinelli reference) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-auto">
        <AnimatePresence mode="wait">
          {!isControllerCollapsed ? (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="bg-[#2D2A26]/85 backdrop-blur-2xl text-white rounded-3xl p-4 md:p-5 shadow-2xl border border-white/15"
            >
              {/* Top Row: Thumbnail + Product Name + Price + Wishlist */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-black/20 flex-shrink-0 border border-white/10">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg md:text-xl font-normal text-white truncate leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-sm font-mono text-gold font-medium">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-[11px] text-white/80 truncate font-light">
                      {product.collection} · {product.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setIsWishlist(!isWishlist)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      isWishlist ? 'text-gold' : 'text-white/60 hover:text-white'
                    }`}
                    title="Toggle Wishlist"
                  >
                    <Heart size={18} fill={isWishlist ? 'currentColor' : 'none'} />
                  </button>

                  <button
                    onClick={() => setIsControllerCollapsed(true)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors text-xs"
                    title="Collapse Controller"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Bottom Action Buttons Row */}
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pt-1">
                <button
                  onClick={handleAddToCart}
                  className="bg-white hover:bg-gold hover:text-white text-onyx px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-md whitespace-nowrap flex items-center gap-1.5"
                >
                  <ShoppingBag size={14} />
                  <span>Add to cart</span>
                </button>

                <button
                  onClick={() => setIsDetailsDrawerOpen(true)}
                  className="bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 rounded-full text-xs font-medium tracking-wide transition-colors whitespace-nowrap"
                >
                  Atelier Specs & Details
                </button>

                {onOpenBespokeInquiry && (
                  <button
                    onClick={() => onOpenBespokeInquiry(product.name)}
                    className="bg-white/10 hover:bg-white/20 text-white/80 hover:text-white px-4 py-2.5 rounded-full text-xs font-medium tracking-wide transition-colors whitespace-nowrap"
                  >
                    Bespoke Inquiry
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={() => setIsControllerCollapsed(false)}
              className="mx-auto flex items-center gap-3 bg-[#2D2A26]/90 backdrop-blur-2xl text-white px-6 py-3 rounded-full shadow-2xl border border-white/15 hover:scale-105 transition-all text-xs font-medium"
            >
              <span className="font-serif text-sm">{product.name}</span>
              <span className="text-gold font-mono font-bold">{formatPrice(product.price)}</span>
              <span className="text-[10px] uppercase tracking-widest text-white/60 bg-white/10 px-2 py-0.5 rounded-full">Expand</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* 4. TOAST CONFIRMATION WHEN ADDED TO CART */}
      <AnimatePresence>
        {isAddedToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-onyx text-white px-6 py-3.5 rounded-full shadow-2xl border border-gold/40 flex items-center gap-3 text-xs tracking-wide"
          >
            <Check size={16} className="text-gold" />
            <span>Added <strong>{product.name}</strong> to your private commission bag.</span>
            <button 
              onClick={onOpenCart} 
              className="text-gold underline hover:text-white font-bold ml-2 uppercase text-[10px] tracking-wider"
            >
              View Bag
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. SLIDE-OVER ATELIER DETAILS DRAWER (Story, Specifications, Reviews) */}
      <AnimatePresence>
        {isDetailsDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailsDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-xl bg-ivory text-onyx shadow-2xl p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col justify-between"
            >
              <div>
                {/* Drawer Header */}
                <div className="flex justify-between items-center border-b border-onyx/10 pb-6 mb-8">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">{product.collection}</p>
                    <h2 className="text-3xl font-serif italic text-onyx">{product.name}</h2>
                  </div>
                  <button 
                    onClick={() => setIsDetailsDrawerOpen(false)}
                    className="p-2 text-onyx/50 hover:text-onyx transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Price & Primary CTA */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-onyx/10">
                  <div>
                    <span className="text-2xl font-serif font-medium text-gold">{formatPrice(product.price)}</span>
                    <span className="text-[10px] text-onyx/70 uppercase tracking-widest block font-medium">Insured White-Glove Shipping Included</span>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="bg-onyx hover:bg-gold text-white px-6 py-3 text-xs uppercase tracking-widest font-bold transition-colors shadow-lg"
                  >
                    Add to Bag
                  </button>
                </div>

                {/* Narrative Description */}
                <div className="space-y-6 mb-8 text-xs leading-relaxed text-onyx/80">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.25em] font-bold text-onyx mb-2">Artisan Narrative</h4>
                    <p className="font-light">{product.description}</p>
                  </div>

                  {product.materials && (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-[0.25em] font-bold text-onyx mb-2">Gemological & Metal Purity</h4>
                      <p className="font-light">{product.materials}</p>
                    </div>
                  )}

                  {product.details && product.details.length > 0 && (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-[0.25em] font-bold text-onyx mb-2">Atelier Specifications</h4>
                      <ul className="space-y-1.5">
                        {product.details.map((detail, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-onyx/70">
                            <span className="text-gold font-serif">✦</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.25em] font-bold text-onyx mb-2">Packaging & Certification</h4>
                    <p className="font-light text-onyx/70">
                      Delivered in our signature handcrafted emerald green velvet presentation box with wax-sealed certification of authenticity and lifetime warranty.
                    </p>
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="pt-6 border-t border-onyx/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] uppercase tracking-[0.25em] font-bold text-onyx">
                      Patron Reviews ({reviewsList.length})
                    </h4>
                    <button
                      onClick={() => setIsReviewOpen(!isReviewOpen)}
                      className="text-[10px] uppercase tracking-widest text-gold hover:underline font-bold"
                    >
                      {isReviewOpen ? 'Close Form' : '+ Add Review'}
                    </button>
                  </div>

                  {isReviewOpen && (
                    <form onSubmit={handleAddReview} className="bg-white p-4 border border-onyx/10 space-y-3 text-xs">
                      <div>
                        <label className="block text-[9px] uppercase tracking-widest text-onyx/60 mb-1">Your Name</label>
                        <input 
                          type="text"
                          required
                          value={newReviewer}
                          onChange={(e) => setNewReviewer(e.target.value)}
                          className="w-full border border-onyx/15 p-2 text-xs outline-none focus:border-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-widest text-onyx/60 mb-1">Rating</label>
                        <select
                          value={newRating}
                          onChange={(e) => setNewRating(parseInt(e.target.value))}
                          className="w-full border border-onyx/15 p-2 text-xs outline-none focus:border-gold"
                        >
                          <option value={5}>5 Stars - Exquisite</option>
                          <option value={4}>4 Stars - High Elegance</option>
                          <option value={3}>3 Stars - Good</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-widest text-onyx/60 mb-1">Review</label>
                        <textarea
                          rows={2}
                          required
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="w-full border border-onyx/15 p-2 text-xs outline-none focus:border-gold resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-gold text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-onyx transition-colors"
                      >
                        Publish Review
                      </button>
                    </form>
                  )}

                  <div className="space-y-3">
                    {reviewsList.map((rev) => (
                      <div key={rev.id} className="p-3 bg-white border border-onyx/5 text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-onyx">{rev.reviewerName}</span>
                          <span className="text-[10px] text-onyx/40">{rev.date}</span>
                        </div>
                        <div className="flex gap-1 text-gold text-xs">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                        <p className="text-onyx/70 italic text-[11px]">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-8 border-t border-onyx/10 flex items-center justify-between text-xs">
                <span className="text-[10px] text-onyx/40 uppercase tracking-widest">ANOVI Master Atelier</span>
                <button
                  onClick={() => setIsDetailsDrawerOpen(false)}
                  className="text-gold font-bold uppercase text-[10px] tracking-widest hover:underline"
                >
                  Return to Visual Focus
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
