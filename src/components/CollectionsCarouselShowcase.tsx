import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight
} from 'lucide-react';
import { JewelryItem } from '../types';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR';

interface CollectionsCarouselShowcaseProps {
  products: JewelryItem[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  activeSubCategory: string;
  onSelectSubCategory: (subCategory: string) => void;
  currency: CurrencyCode;
  formatPrice: (price: number | string) => string;
  onProductClick: (product: JewelryItem) => void;
  onAddToCart: (product: JewelryItem) => void;
  onBuyNow: (product: JewelryItem) => void;
  onReturnHome: () => void;
  selectedMaterials: string[];
  onSelectMaterials: React.Dispatch<React.SetStateAction<string[]>>;
  allMaterials: string[];
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
}

export const CollectionsCarouselShowcase: React.FC<CollectionsCarouselShowcaseProps> = ({
  products,
  activeCategory,
  onSelectCategory,
  onProductClick,
  onReturnHome
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const touchStartX = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);
  const dragStartX = useRef<number>(0);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ONLY the 5 main categories as requested: All, Necklaces, Earrings, Rings, Bracelets
  const mainCategories = useMemo(() => {
    return ['All', 'Necklaces', 'Earrings', 'Rings', 'Bracelets'] as const;
  }, []);

  // Intelligent categorization ensuring every jewel falls cleanly into the 4 iconic jewelry types
  const displayedProducts = useMemo(() => {
    return products.filter(item => {
      if (activeCategory === 'All') return true;

      const catLower = activeCategory.toLowerCase();
      const itemCat = (item.category || '').toLowerCase();
      const itemSub = (item.subCategory || '').toLowerCase();
      const itemName = (item.name || '').toLowerCase();

      if (catLower === 'necklaces') {
        return itemCat === 'necklaces' || itemSub === 'necklaces' || itemName.includes('necklace') || itemName.includes('choker') || itemName.includes('pendant') || itemName.includes('collar');
      }
      if (catLower === 'earrings') {
        return itemCat === 'earrings' || itemSub === 'earrings' || itemName.includes('earring') || itemName.includes('stud') || itemName.includes('drop') || itemName.includes('hoop');
      }
      if (catLower === 'rings') {
        return itemCat === 'rings' || itemSub === 'rings' || itemName.includes('ring') || itemName.includes('band') || itemName.includes('solitaire');
      }
      if (catLower === 'bracelets') {
        return itemCat === 'bracelets' || itemSub === 'bracelets' || itemName.includes('bracelet') || itemName.includes('bangle') || itemName.includes('cuff');
      }
      return false;
    });
  }, [products, activeCategory]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayedProducts.length]);

  const goToNext = () => {
    if (displayedProducts.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % displayedProducts.length);
  };

  const goToPrev = () => {
    if (displayedProducts.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + displayedProducts.length) % displayedProducts.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 40) {
      goToNext();
    } else if (diff < -40) {
      goToPrev();
    }
    touchStartX.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const diff = dragStartX.current - e.clientX;
    if (diff > 50) {
      goToNext();
    } else if (diff < -50) {
      goToPrev();
    }
    isDragging.current = false;
  };

  // Dimensions precisely calibrated so approximately 5 images fit on screen
  const cardWidth = useMemo(() => {
    if (viewportWidth < 640) return 175;
    if (viewportWidth < 1024) return 205;
    if (viewportWidth < 1280) return 225;
    if (viewportWidth < 1536) return 245;
    return 260;
  }, [viewportWidth]);

  const cardGap = useMemo(() => {
    if (viewportWidth < 640) return 12;
    if (viewportWidth < 1024) return 16;
    return 22;
  }, [viewportWidth]);

  const currentProduct = displayedProducts[currentIndex] || displayedProducts[0];
  const activeOrHoveredProduct = displayedProducts.find(p => p.id === hoveredId) || currentProduct;

  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-black text-ivory flex flex-col justify-between pt-16 md:pt-20 pb-4 select-none font-sans">
      
      {/* Moody Panoramic Landscape Background (Brunello Cucinelli High-Fashion Backdrop) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2400"
          alt="Atmosphere"
          className="w-full h-full object-cover grayscale contrast-125 brightness-35 opacity-40 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/85" />
      </div>

      {/* Atelier Collection Centered Above Category Options */}
      <div className="relative z-20 text-center flex-shrink-0 mt-3 md:mt-4 mb-2">
        <h2 className="text-[12px] md:text-sm uppercase tracking-[0.35em] text-gold/90 font-serif font-light">
          Atelier Collection
        </h2>
        <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mt-1.5" />
      </div>

      {/* Minimal Space Category Options Bar: ONLY All, Necklaces, Earrings, Rings, Bracelets */}
      <div className="relative z-20 px-4 flex-shrink-0 mb-1">
        <div className="flex items-center justify-center gap-5 sm:gap-8 md:gap-12">
          {mainCategories.map((catKey) => {
            const isSelected = activeCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => onSelectCategory(catKey)}
                className={`relative py-1 text-[11px] md:text-xs uppercase tracking-[0.25em] transition-all duration-300 ${
                  isSelected
                    ? 'text-white font-medium'
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                <span>{catKey}</span>
                {isSelected && (
                  <motion.div
                    layoutId="minimalCategoryUnderline"
                    className="absolute -bottom-0.5 left-0 right-0 h-[1.5px] bg-gradient-to-r from-gold/50 via-gold to-gold/50"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 5-Card Product Showcase (Pure Imagery, No Details, Dynamic Hover Highlight) */}
      <div 
        className="relative z-10 flex-1 min-h-0 w-full overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing my-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {displayedProducts.length === 0 ? (
          <div className="text-center py-12 px-6 max-w-sm bg-black/60 border border-white/10 rounded-xl p-8 backdrop-blur-md">
            <p className="text-white/60 text-xs font-light mb-4">No pieces found in this category.</p>
            <button
              onClick={() => onSelectCategory('All')}
              className="px-5 py-2 rounded-full bg-white text-onyx text-[9px] uppercase tracking-widest font-bold hover:bg-gold hover:text-white transition-colors"
            >
              View All Pieces
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center">
            
            {/* Horizontal Track of 5 Photographic Panels */}
            <div 
              className="flex items-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] h-full"
              style={{
                transform: `translateX(calc(50vw - ${(currentIndex * (cardWidth + cardGap)) + (cardWidth / 2)}px))`
              }}
            >
              {displayedProducts.map((item, index) => {
                const isHovered = hoveredId === item.id;
                const isAnyHovered = hoveredId !== null;
                const isCurrent = currentIndex === index;
                const offset = index - currentIndex;

                // 5-Card Stage Runway Styling & Hover Highlight
                let borderClass = 'border border-white/20';
                let opacityClass = 'opacity-55';
                let scaleClass = 'scale-[0.93]';
                let shadowClass = 'shadow-xl';

                if (isHovered) {
                  // Direct Hover Spotlight
                  borderClass = 'border-2 border-white ring-2 ring-white/60 ring-offset-2 ring-offset-black';
                  opacityClass = 'opacity-100 brightness-110';
                  scaleClass = 'scale-[1.08] -translate-y-2 z-40';
                  shadowClass = 'shadow-[0_25px_60px_rgba(255,255,255,0.35)]';
                } else if (isAnyHovered) {
                  // Sibling cards dim deeply into the background
                  borderClass = 'border border-white/10';
                  opacityClass = 'opacity-25 brightness-50';
                  scaleClass = 'scale-[0.88] z-10';
                  shadowClass = 'shadow-sm';
                } else if (isCurrent) {
                  // Center highlighted card
                  borderClass = 'border-2 border-white/95 ring-1 ring-white/40';
                  opacityClass = 'opacity-100 brightness-100';
                  scaleClass = 'scale-100 z-30';
                  shadowClass = 'shadow-[0_15px_45px_rgba(255,255,255,0.22)]';
                } else if (Math.abs(offset) === 1) {
                  // Immediate left/right neighbors
                  borderClass = 'border border-white/25';
                  opacityClass = 'opacity-70 brightness-85';
                  scaleClass = 'scale-[0.94] z-20';
                } else if (Math.abs(offset) === 2) {
                  // 2nd outer neighbors (completing 5 visible cards on screen)
                  borderClass = 'border border-white/15';
                  opacityClass = 'opacity-40 brightness-70';
                  scaleClass = 'scale-[0.87] z-10';
                } else {
                  // Outer clipped cards
                  borderClass = 'border border-white/10';
                  opacityClass = 'opacity-15 brightness-45';
                  scaleClass = 'scale-[0.80] z-0';
                }

                return (
                  <motion.div
                    key={item.id}
                    layout
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    onClick={() => {
                      if (isCurrent || isHovered) {
                        onProductClick(item);
                      } else {
                        setCurrentIndex(index);
                      }
                    }}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      width: `${cardWidth}px`,
                      marginRight: `${cardGap}px`
                    }}
                    className={`flex-shrink-0 h-[48vh] sm:h-[52vh] md:h-[56vh] max-h-[520px] min-h-[340px] relative overflow-hidden transition-all duration-500 cursor-pointer ${scaleClass} ${borderClass} ${opacityClass} ${shadowClass} bg-black/70 rounded-md`}
                  >
                    {/* ONLY Product Image without any details */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center pointer-events-none transition-transform duration-700 hover:scale-105"
                      referrerPolicy="no-referrer"
                    />

                    {/* Subtle atmospheric vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

                    {/* Subtle hover inspect indicator */}
                    {isHovered && (
                      <div className="absolute top-3.5 right-3.5 bg-black/70 backdrop-blur-md p-1.5 rounded-full border border-white/40 text-white shadow-xl animate-in fade-in duration-200">
                        <ArrowUpRight size={13} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Left Circular Navigation Chevron */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/25 hover:border-gold text-white/80 hover:text-gold flex items-center justify-center transition-all shadow-2xl backdrop-blur-md hover:scale-110 active:scale-95"
              aria-label="Previous"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Right Circular Navigation Chevron */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/25 hover:border-gold text-white/80 hover:text-gold flex items-center justify-center transition-all shadow-2xl backdrop-blur-md hover:scale-110 active:scale-95"
              aria-label="Next"
            >
              <ChevronRight size={22} />
            </button>

          </div>
        )}
      </div>

      {/* Minimal Bottom Area: Single Clean Title */}
      <div className="relative z-20 px-4 flex-shrink-0 text-center pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeOrHoveredProduct?.id || 'empty'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={() => activeOrHoveredProduct && onProductClick(activeOrHoveredProduct)}
            className="cursor-pointer group inline-block"
          >
            <h2 className="text-xl md:text-3xl font-serif font-light tracking-wide text-white group-hover:text-gold transition-colors">
              {activeOrHoveredProduct?.name || ''}
            </h2>
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
};
