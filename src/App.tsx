import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Menu, X, ChevronRight, ChevronDown, Instagram, Facebook, Search, Share2, ZoomIn, ZoomOut, CreditCard, Star, ArrowUpRight, Filter, Sliders, Key, Shield, Sparkles } from 'lucide-react';
import { JEWELRY_ITEMS, ARCHIVE_ITEMS, BESPOKE_ITEMS } from './constants';
import { BespokeItem, JewelryItem, Review, WebsiteSettings, Order } from './types';
import { Logo } from './components/Logo';
import { Twitter, Mail, Calendar, Clock, MessageSquare } from 'lucide-react';
import { storeService, getSupabaseClient } from './services/storeService';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CheckoutModal } from './components/CheckoutModal';
import { ProductDetailCinematic } from './components/ProductDetailCinematic';
import { CollectionsCarouselShowcase } from './components/CollectionsCarouselShowcase';

interface CartItem {
  id: string;
  name: string;
  price: string;
  image: string;
  collection: string;
  quantity: number;
}

type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR';

const CURRENCIES: Record<CurrencyCode, { symbol: string, rate: number, label: string }> = {
  USD: { symbol: '$', rate: 1, label: 'USD' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR' },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP' },
  INR: { symbol: '₹', rate: 83.3, label: 'INR' },
};

const formatPriceUtil = (price: number | string, currency: CurrencyCode) => {
  const basePrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price;
  const converted = basePrice * CURRENCIES[currency].rate;
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(converted);
};

const PinterestIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
  </svg>
);

const FALLBACK_JEWELRY_IMAGE = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800';

const getViewFromHash = (): 'home' | 'collections' | 'archive' | 'product' | 'bespoke' | 'admin' => {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.toLowerCase();
  if (hash === '#admin' || window.location.search.includes('admin=true')) return 'admin';
  if (hash === '#collections') return 'collections';
  if (hash === '#archive') return 'archive';
  if (hash === '#bespoke') return 'bespoke';
  return 'home';
};

const ProductCard: React.FC<{
  item: any;
  index: number;
  currency: CurrencyCode;
  onAddToCart: (item: any) => void;
  onClick: (item: any) => void;
}> = ({ item, index, currency, onAddToCart, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.6 }}
      className="group cursor-pointer"
      onClick={() => onClick(item)}
    >
      <div className="relative aspect-square overflow-hidden mb-8 bg-onyx/5">
        <motion.img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_JEWELRY_IMAGE;
          }}
        />

        {/* Quick Actions - Top Right Icon */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(item); }}
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-onyx hover:bg-gold hover:text-white transition-all duration-300 shadow-sm"
            title="Add to Cart"
          >
            <ShoppingBag size={15} />
          </button>
        </div>

        {/* Social Sharing Overlay - Moved to bottom right */}
        <div className="absolute bottom-4 right-4 flex gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-500 ease-out">
          <button
            className="w-7 h-7 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center text-onyx hover:bg-gold hover:text-white transition-all duration-300 shadow-sm"
            onClick={(e) => { e.stopPropagation(); window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank'); }}
          >
            <Facebook size={12} />
          </button>
          <button
            className="w-7 h-7 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center text-onyx hover:bg-gold hover:text-white transition-all duration-300 shadow-sm"
            onClick={(e) => { e.stopPropagation(); window.open(`https://www.instagram.com/anovi_jewels`, '_blank'); }}
          >
            <Instagram size={12} />
          </button>
        </div>
      </div>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-onyx/40 mb-2">{item.collection}</p>
          <h4 className="text-xl font-serif mb-2">{item.name}</h4>
          <p className="text-xs font-light text-onyx/60 leading-relaxed max-w-xs">{item.description}</p>
        </div>
        <p className="text-sm font-medium text-gold">{formatPriceUtil(item.price, currency)}</p>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [view, setView] = useState<'home' | 'collections' | 'archive' | 'product' | 'bespoke' | 'admin'>(getViewFromHash);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<'All' | 'Women' | 'Men'>('All');
  const [isPearlsDropdownOpen, setIsPearlsDropdownOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  const [products, setProducts] = useState<JewelryItem[]>(() => storeService.getProducts());
  const [archiveItems, setArchiveItems] = useState<JewelryItem[]>(() => storeService.getArchiveItems());
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(() => storeService.getWebsiteSettings());
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ reviewerName: '', rating: 5, comment: '' });

  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isCollectionsDropdownOpen, setIsCollectionsDropdownOpen] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isClearCartConfirmOpen, setIsClearCartConfirmOpen] = useState(false);
  const [isBespokeFormSubmitting, setIsBespokeFormSubmitting] = useState(false);
  const [bespokeForm, setBespokeForm] = useState({
    date: '',
    time: '',
    description: '',
    name: '',
    email: ''
  });
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  const TESTIMONIALS = [
    {
      quote: "ANOVI's attention to detail is unparalleled. The bespoke ring they created for our anniversary is a true masterpiece that will be cherished for generations.",
      author: "Eleanor Vance",
      location: "New York"
    },
    {
      quote: "The experience of designing my own necklace was magical. The artisans at ANOVI truly listen and bring your vision to life with such elegance.",
      author: "Julianne Moore",
      location: "London"
    },
    {
      quote: "I've never seen pearls with such luster. Every piece I own from ANOVI feels like a piece of art rather than just jewelry.",
      author: "Sarah Jenkins",
      location: "Paris"
    }
  ];

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return products
      .filter(p => p.id !== selectedProduct.id && (p.category === selectedProduct.category || p.collection === selectedProduct.collection))
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
  }, [selectedProduct, products]);

  const HERO_SLIDES = [
    {
      image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=2000",
      title: "Elegance in \n Every Motion",
      subtitle: "The Art of Adornment",
      tag: "Est. 1924 — Paris"
    },
    {
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=2000",
      title: "Radiance \n Reimagined",
      subtitle: "The New Collection",
      tag: "Handcrafted Excellence"
    },
    {
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=2000",
      title: "Timeless \n Singularities",
      subtitle: "One of a Kind",
      tag: "Limited Editions"
    }
  ];

  useEffect(() => {
    if (view === 'home') {
      const timer = setInterval(() => {
        setCurrentHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [view, HERO_SLIDES.length]);

  useEffect(() => {
    const handleHashChange = () => {
      const targetView = getViewFromHash();
      setView(targetView);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const syncData = async () => {
      try {
        const liveProducts = await storeService.fetchProducts();
        if (isMounted && liveProducts && liveProducts.length > 0) {
          setProducts(liveProducts);
        }
      } catch (e) {
        console.warn('Live products sync notice:', e);
      }
      try {
        const liveArchive = await storeService.fetchArchiveItems();
        if (isMounted && liveArchive && liveArchive.length > 0) {
          setArchiveItems(liveArchive);
        }
      } catch (e) {
        console.warn('Live archive sync notice:', e);
      }
    };
    syncData();

    // Supabase Real-Time Subscriptions for Products & Archive
    const supabase = getSupabaseClient();
    if (supabase) {
      const channel = supabase
        .channel('public:realtime_store')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
          const updated = await storeService.fetchProducts();
          if (isMounted) setProducts(updated);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'archive_items' }, async () => {
          const updated = await storeService.fetchArchiveItems();
          if (isMounted) setArchiveItems(updated);
        })
        .subscribe();

      return () => {
        isMounted = false;
        supabase.removeChannel(channel);
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavigate = (newView: 'home' | 'collections' | 'archive' | 'product' | 'bespoke' | 'admin') => {
    if (newView === 'home') {
      if (window.location.hash) {
        try {
          history.pushState(null, '', window.location.pathname + window.location.search);
        } catch {
          window.location.hash = '';
        }
      }
    } else {
      window.location.hash = `#${newView}`;
    }
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const handleProductClick = (item: any) => {
    setSelectedProduct(item);
    setActiveMediaIndex(0);
    setZoomLevel(1);
    setView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (priceStr: string, code: CurrencyCode = currency) => {
    const basePrice = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    const converted = basePrice * CURRENCIES[code].rate;
    return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(converted);
  };

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const buyNow = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev;
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setIsClearCartConfirmOpen(false);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      return total + price * item.quantity;
    }, 0);
  }, [cart]);

  const formattedCartTotal = useMemo(() => {
    const converted = cartTotal * CURRENCIES[currency].rate;
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(converted);
  }, [cartTotal, currency]);

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view, activeCategory]);

  useEffect(() => {
    setActiveSubCategory('All');
  }, [activeCategory]);

  const categories = ['All', 'Necklaces', 'Earrings', 'Rings', 'Bracelets', 'Stones', 'Diamonds', 'Pearls'] as const;

  const allCollections = useMemo(() => {
    const collections = new Set<string>();
    products.forEach(item => collections.add(item.collection));
    return Array.from(collections).sort();
  }, [products]);

  const allMaterials = useMemo(() => {
    const materials = new Set<string>();
    products.forEach(item => {
      if (item.materials) {
        item.materials.split(',').forEach(m => materials.add(m.trim()));
      }
    });
    return Array.from(materials).sort();
  }, [products]);

  const dynamicArchiveItems = useMemo(() => {
    const baseArchive = archiveItems && archiveItems.length > 0 ? archiveItems : ARCHIVE_ITEMS;
    const outOfStockOrArchived = products.filter(p => p.inStock === false || p.isArchived === true);

    const map = new Map<string, JewelryItem>();
    baseArchive.forEach(item => map.set(item.id, item));
    outOfStockOrArchived.forEach(item => {
      if (!map.has(item.id)) {
        map.set(item.id, {
          ...item,
          price: item.price?.includes('Original') || item.price?.includes('Archived') ? item.price : `${item.price} (Archived)`,
          description: item.archiveStory || item.description
        });
      }
    });

    return Array.from(map.values());
  }, [archiveItems, products]);

  const filteredItems = useMemo(() => {
    return products.filter(item => {
      if (selectedGender !== 'All' && item.gender && item.gender !== 'Unisex' && item.gender !== selectedGender) {
        return false;
      }
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory || item.gemType === activeCategory || item.collection === activeCategory;
      const matchesSubCategory = activeSubCategory === 'All' || item.subCategory === activeSubCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.collection.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.subCategory && item.subCategory.toLowerCase().includes(searchQuery.toLowerCase()));

      const itemPrice = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
      const matchesPrice = itemPrice >= priceRange[0] && itemPrice <= priceRange[1];

      const matchesMaterials = selectedMaterials.length === 0 ||
        selectedMaterials.some(m => item.materials?.includes(m));

      return matchesCategory && matchesSubCategory && matchesSearch && matchesPrice && matchesMaterials;
    });
  }, [activeCategory, activeSubCategory, selectedGender, searchQuery, products, priceRange, selectedMaterials]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const newReview: Review = {
      id: `r-${Date.now()}`,
      reviewerName: reviewForm.reviewerName,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedProducts = products.map(p => {
      if (p.id === selectedProduct.id) {
        const updatedReviews = [...(p.reviews || []), newReview];
        const updatedProduct = { ...p, reviews: updatedReviews };
        setSelectedProduct(updatedProduct);
        return updatedProduct;
      }
      return p;
    });

    setProducts(updatedProducts);
    setIsReviewFormOpen(false);
    setReviewForm({ reviewerName: '', rating: 5, comment: '' });
  };

  const handleZoomMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomOrigin({ x, y });
  };

  const toggleZoom = () => {
    setZoomLevel((prev: number) => prev > 1 ? 1 : 2.5);
  };

  const isDarkNav = view === 'collections' || (!scrolled && view === 'home');

  return (
    <div className="min-h-screen flex flex-col selection:bg-gold selection:text-white">
      {/* Unified Header & Navigation Bar */}
      {view !== 'admin' && view !== 'product' && (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
          {/* Top Announcement Bar from Website Settings */}
          {websiteSettings.announcementBarEnabled && (
            <div className={`py-1.5 px-6 text-center text-[9px] uppercase tracking-[0.25em] font-medium border-b flex flex-wrap justify-center items-center gap-3 transition-colors duration-500 ${isDarkNav
                ? 'bg-[#0D0D0E] text-white/70 border-white/8'
                : 'bg-onyx text-white/90 border-gold/20'
              }`}>
              <span>{websiteSettings.announcementText}</span>
              {websiteSettings.announcementLinkText && (
                <button
                  onClick={() => handleNavigate('bespoke')}
                  className="text-gold underline hover:text-white transition-colors cursor-pointer"
                >
                  {websiteSettings.announcementLinkText}
                </button>
              )}
            </div>
          )}

          {/* Navigation Bar */}
          <nav
            className={`w-full px-6 md:px-12 transition-all duration-500 flex items-center justify-between ${isDarkNav
                ? view === 'collections'
                  ? 'bg-[#0D0D0E]/95 backdrop-blur-md border-b border-white/8 py-3.5 text-white/90'
                  : 'bg-linear-to-b from-black/80 via-black/40 to-transparent border-b border-white/6 py-5 text-white/90'
                : 'bg-ivory/95 backdrop-blur-md border-b border-onyx/8 shadow-[0_1px_0_0_rgba(212,175,55,0.12)] py-3.5 text-onyx'
              }`}
          >
            {/* Left Column: Navigation Links (Desktop) & Menu Trigger (Mobile) */}
            <div className="flex-1 flex items-center justify-start">
              {/* Mobile Menu Button - Positioned on left for classic luxury symmetry */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="md:hidden p-1.5 -ml-1 text-current hover:text-gold transition-colors"
                aria-label="Open Boutique Menu"
              >
                <Menu size={22} strokeWidth={1.25} />
              </button>

              {/* Desktop Primary Nav Links */}
              <div className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-[0.22em] font-medium text-current">
                <button onClick={() => handleNavigate('home')} className="nav-underline">Home</button>
                <div
                  className="relative"
                  onMouseEnter={() => setIsCollectionsDropdownOpen(true)}
                  onMouseLeave={() => setIsCollectionsDropdownOpen(false)}
                >
                  <button
                    onClick={() => {
                      setActiveCategory('All');
                      setActiveSubCategory('All');
                      handleNavigate('collections');
                    }}
                    className={`nav-underline flex items-center gap-1.5 ${view === 'collections' && activeCategory !== 'Pearls' ? 'text-gold' : ''}`}
                  >
                    Collections <ChevronDown size={10} className={`transition-transform duration-300 ${isCollectionsDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isCollectionsDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute top-full left-0 mt-3 p-6 min-w-[320px] z-100 shadow-2xl backdrop-blur-xl border ${isDarkNav
                            ? 'bg-[#111113]/98 border-white/10 text-white'
                            : 'bg-white/98 border-onyx/10 text-onyx'
                          }`}
                      >
                        <div className="flex flex-col gap-4">
                          {/* The Classic Categories (Preserved!) */}
                          <div className="space-y-2">
                            <p className="text-[8px] uppercase tracking-[0.3em] text-gold font-bold mb-1 opacity-90">Categories</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pl-2">
                              {['Necklaces', 'Earrings', 'Rings', 'Bracelets'].map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => {
                                    setActiveCategory(cat);
                                    setActiveSubCategory('All');
                                    handleNavigate('collections');
                                    setIsCollectionsDropdownOpen(false);
                                  }}
                                  className={`text-left text-[9px] uppercase tracking-[0.2em] font-medium transition-all hover:translate-x-1 duration-300 ${activeCategory === cat
                                      ? 'text-gold font-semibold'
                                      : isDarkNav ? 'text-white/60 hover:text-white' : 'text-onyx/60 hover:text-onyx'
                                    }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className={`h-px ${isDarkNav ? 'bg-white/10' : 'bg-onyx/5'}`} />

                          {/* Category 1: Stones */}
                          <div className="space-y-2">
                            <p className="text-[8px] uppercase tracking-[0.3em] text-gold font-bold mb-1 opacity-90">1. Stones</p>
                            <div className="grid grid-cols-1 gap-1.5 pl-2">
                              {['Gemstones', 'Labgrown', 'Semi precious'].map((sub) => (
                                <button
                                  key={sub}
                                  onClick={() => {
                                    setActiveCategory('Stones');
                                    setActiveSubCategory(sub);
                                    handleNavigate('collections');
                                    setIsCollectionsDropdownOpen(false);
                                  }}
                                  className={`text-left text-[9px] uppercase tracking-[0.2em] font-medium transition-all hover:translate-x-1 duration-300 ${activeCategory === 'Stones' && activeSubCategory === sub
                                      ? 'text-gold font-semibold'
                                      : isDarkNav ? 'text-white/60 hover:text-white' : 'text-onyx/60 hover:text-onyx'
                                    }`}
                                >
                                  {sub}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className={`h-px ${isDarkNav ? 'bg-white/10' : 'bg-onyx/5'}`} />

                          {/* Category 2: Diamonds */}
                          <div className="space-y-2">
                            <p className="text-[8px] uppercase tracking-[0.3em] text-gold font-bold mb-1 opacity-90">2. Diamonds</p>
                            <div className="grid grid-cols-1 gap-1.5 pl-2">
                              {['Natural', 'Labgrown', 'Zircon'].map((sub) => (
                                <button
                                  key={sub}
                                  onClick={() => {
                                    setActiveCategory('Diamonds');
                                    setActiveSubCategory(sub);
                                    handleNavigate('collections');
                                    setIsCollectionsDropdownOpen(false);
                                  }}
                                  className={`text-left text-[9px] uppercase tracking-[0.2em] font-medium transition-all hover:translate-x-1 duration-300 ${activeCategory === 'Diamonds' && activeSubCategory === sub
                                      ? 'text-gold font-semibold'
                                      : isDarkNav ? 'text-white/60 hover:text-white' : 'text-onyx/60 hover:text-onyx'
                                    }`}
                                >
                                  {sub}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className={`h-px ${isDarkNav ? 'bg-white/10' : 'bg-onyx/5'}`} />

                          {/* Gender Filter Selection */}
                          <div className="space-y-2">
                            <p className="text-[8px] uppercase tracking-[0.3em] text-gold font-bold mb-1 opacity-90">Curated For</p>
                            <div className="flex gap-2 pl-2">
                              {(['Women', 'Men'] as const).map((gender) => (
                                <button
                                  key={gender}
                                  onClick={() => {
                                    setSelectedGender(gender);
                                    setActiveCategory('All');
                                    handleNavigate('collections');
                                    setIsCollectionsDropdownOpen(false);
                                  }}
                                  className={`text-[9px] uppercase tracking-[0.2em] px-3 py-1 border transition-all duration-300 ${selectedGender === gender
                                      ? 'border-gold text-gold bg-gold/10'
                                      : isDarkNav ? 'border-white/20 text-white/60 hover:text-white' : 'border-onyx/20 text-onyx/60 hover:text-onyx'
                                    }`}
                                >
                                  {gender}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className={`h-px ${isDarkNav ? 'bg-white/10' : 'bg-onyx/5'}`} />

                          <button
                            onClick={() => {
                              setActiveCategory('All');
                              setActiveSubCategory('All');
                              setSelectedGender('All');
                              handleNavigate('collections');
                              setIsCollectionsDropdownOpen(false);
                            }}
                            className="text-left text-[8px] uppercase tracking-[0.25em] text-gold/80 hover:text-gold font-semibold pt-1"
                          >
                            View All Collections →
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Category 3: PEARLS — Dedicated Tab in Navbar (NOT in Collections) */}
                <div
                  className="relative"
                  onMouseEnter={() => setIsPearlsDropdownOpen(true)}
                  onMouseLeave={() => setIsPearlsDropdownOpen(false)}
                >
                  <button
                    onClick={() => {
                      setActiveCategory('Pearls');
                      setActiveSubCategory('All');
                      handleNavigate('collections');
                    }}
                    className={`nav-underline flex items-center gap-1.5 ${view === 'collections' && activeCategory === 'Pearls' ? 'text-gold font-semibold' : ''}`}
                  >
                    Pearls <ChevronDown size={10} className={`transition-transform duration-300 ${isPearlsDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isPearlsDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute top-full left-0 mt-3 p-6 min-w-65 z-100 shadow-2xl backdrop-blur-xl border ${isDarkNav
                            ? 'bg-[#111113]/98 border-white/10 text-white'
                            : 'bg-white/98 border-onyx/10 text-onyx'
                          }`}
                      >
                        <div className="space-y-3">
                          <p className="text-[8px] uppercase tracking-[0.3em] text-gold font-bold mb-3 opacity-90">The Pearl Atelier</p>
                          <div className="grid grid-cols-1 gap-2.5">
                            {['All Pearls', 'South-Sea', 'Japanese-Akoya', 'Tahitian', 'Fresh Water Pearls'].map((sub) => (
                              <button
                                key={sub}
                                onClick={() => {
                                  setActiveCategory('Pearls');
                                  setActiveSubCategory(sub === 'All Pearls' ? 'All' : sub);
                                  handleNavigate('collections');
                                  setIsPearlsDropdownOpen(false);
                                }}
                                className={`text-left text-[9px] uppercase tracking-[0.2em] font-medium transition-all hover:translate-x-1 duration-300 ${activeCategory === 'Pearls' && ((sub === 'All Pearls' && activeSubCategory === 'All') || activeSubCategory === sub)
                                    ? 'text-gold font-semibold'
                                    : isDarkNav ? 'text-white/60 hover:text-white' : 'text-onyx/60 hover:text-onyx'
                                  }`}
                              >
                                {sub}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button onClick={() => handleNavigate('bespoke')} className="nav-underline">Bespoke</button>
                <button onClick={() => handleNavigate('archive')} className="nav-underline">Archive</button>
                <button
                  onClick={() => handleNavigate('admin')}
                  className="nav-underline flex items-center gap-1.5 font-medium"
                  title="Atelier Management Portal"
                >
                  <Key size={11} className="text-gold" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* Center Column: Perfectly Centered Company Name & Logo Lockup */}
            <div className="shrink-0 flex items-center justify-center">
              <button
                onClick={() => handleNavigate('home')}
                className={`group inline-flex items-center px-3 py-1 border transition-all duration-300 focus:outline-none ${isDarkNav
                    ? 'border-transparent hover:border-gold/30 text-gold'
                    : 'border-transparent hover:border-gold/30 text-onyx hover:text-gold'
                  }`}
                title="ANOVI Haute Joaillerie"
              >
                <Logo className="h-6 md:h-7" />
              </button>
            </div>

            {/* Right Column: Actions (Currency, Search, Cart) */}
            <div className="flex-1 flex items-center justify-end gap-5 md:gap-7 text-current">
              {/* Currency Selector */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                  className="flex items-center gap-1.5 text-[10px] font-medium tracking-widest hover:text-gold transition-colors"
                >
                  <span>{currency}</span>
                  <ChevronRight size={10} className={`transform transition-transform duration-300 ${isCurrencyOpen ? 'rotate-90' : ''}`} />
                </button>

                <AnimatePresence>
                  {isCurrencyOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute top-full right-0 mt-3 p-2 min-w-21 z-100 shadow-2xl backdrop-blur-xl border ${isDarkNav
                          ? 'bg-[#111113]/98 border-white/10 text-white'
                          : 'bg-white/98 border-onyx/10 text-onyx'
                        }`}
                    >
                      {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                        <button
                          key={code}
                          onClick={() => { setCurrency(code); setIsCurrencyOpen(false); }}
                          className={`w-full text-left text-[9px] font-bold tracking-widest px-3 py-2 transition-all ${currency === code
                              ? 'text-gold'
                              : isDarkNav ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-onyx/60 hover:bg-onyx/5 hover:text-onyx'
                            }`}
                        >
                          {code}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-medium nav-underline hover:text-gold transition-colors"
              >
                <Search size={13} strokeWidth={1.5} />
                <span>Search</span>
              </button>

              {/* Mobile Search Icon */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden p-1 text-current hover:text-gold transition-colors"
                aria-label="Search Catalog"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>

              {/* Shopping Bag Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-1 text-current hover:text-gold transition-colors"
                aria-label="View Shopping Bag"
              >
                <ShoppingBag size={19} strokeWidth={1.4} />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gold text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>
            </div>
          </nav>
        </header>
      )}

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-70 bg-ivory/98 backdrop-blur-xl flex flex-col p-8 md:p-24"
          >
            <div className="flex justify-end mb-12">
              <button onClick={() => setIsSearchOpen(false)} className="group flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Close</span>
                <X size={32} strokeWidth={1} />
              </button>
            </div>
            <div className="max-w-4xl mx-auto w-full">
              <div className="relative mb-12">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search our collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b border-onyx/20 py-6 text-4xl md:text-6xl font-serif italic outline-none focus:border-gold transition-colors"
                />
                <Search className="absolute right-0 top-1/2 -translate-y-1/2 text-onyx/20" size={32} strokeWidth={1} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-onyx/40">Quick Links</h4>
                  <div className="flex flex-wrap gap-4">
                    {categories.filter(c => c !== 'All').map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setActiveCategory(cat); setView('collections'); setIsSearchOpen(false); }}
                        className="px-6 py-2 border border-onyx/10 rounded-full text-[10px] uppercase tracking-widest hover:border-gold hover:text-gold transition-all"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                {searchQuery && (
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-onyx/40">Results ({filteredItems.length})</h4>
                    <div className="max-h-[40vh] overflow-y-auto pr-4 space-y-6 custom-scrollbar">
                      {filteredItems.slice(0, 5).map(item => (
                        <div
                          key={item.id}
                          className="flex gap-4 group cursor-pointer"
                          onClick={() => { setView('collections'); setIsSearchOpen(false); }}
                        >
                          <div className="w-16 h-16 bg-onyx/5 overflow-hidden">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div>
                            <h5 className="font-serif text-lg">{item.name}</h5>
                            <p className="text-[10px] uppercase tracking-widest text-gold">{item.price}</p>
                          </div>
                        </div>
                      ))}
                      {filteredItems.length === 0 && <p className="text-sm italic text-onyx/40">No pieces found matching your search.</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-60 bg-ivory flex flex-col p-8"
          >
            <div className="flex justify-end">
              <button onClick={() => setIsMenuOpen(false)}>
                <X size={32} strokeWidth={1} />
              </button>
            </div>
            <div className="flex flex-col gap-8 mt-12 text-4xl font-serif italic overflow-y-auto no-scrollbar pb-12 text-gold">
              <button className="text-left" onClick={() => handleNavigate('home')}>Home</button>

              {/* Collections Menu */}
              <div className="flex flex-col gap-4">
                <button
                  className="text-left flex items-center justify-between"
                  onClick={() => {
                    setActiveCategory('All');
                    setActiveSubCategory('All');
                    handleNavigate('collections');
                  }}
                >
                  <span>Collections</span>
                  <span className="text-xs uppercase tracking-widest text-gold font-sans font-normal opacity-80">Explore All</span>
                </button>
                <div className="flex flex-col gap-3 ml-3 font-sans text-xs uppercase tracking-widest text-onyx/80">
                  {/* Classic Categories */}
                  <div className="flex flex-col gap-1.5 border-l border-gold/30 pl-3">
                    <span className="text-[9px] text-gold font-bold tracking-[0.25em]">Jewelry Types</span>
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      {['Necklaces', 'Earrings', 'Rings', 'Bracelets'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => {
                            setActiveCategory(cat);
                            setActiveSubCategory('All');
                            handleNavigate('collections');
                          }}
                          className="px-2.5 py-1 bg-onyx/5 hover:bg-gold hover:text-white rounded-full transition-all"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 border-l border-gold/30 pl-3">
                    <span className="text-[9px] text-gold font-bold tracking-[0.25em]">1. Stones</span>
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      {['Gemstones', 'Labgrown', 'Semi precious'].map(sub => (
                        <button
                          key={sub}
                          onClick={() => {
                            setActiveCategory('Stones');
                            setActiveSubCategory(sub);
                            handleNavigate('collections');
                          }}
                          className="px-2.5 py-1 bg-onyx/5 hover:bg-gold hover:text-white rounded-full transition-all"
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 border-l border-gold/30 pl-3">
                    <span className="text-[9px] text-gold font-bold tracking-[0.25em]">2. Diamonds</span>
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      {['Natural', 'Labgrown', 'Zircon'].map(sub => (
                        <button
                          key={sub}
                          onClick={() => {
                            setActiveCategory('Diamonds');
                            setActiveSubCategory(sub);
                            handleNavigate('collections');
                          }}
                          className="px-2.5 py-1 bg-onyx/5 hover:bg-gold hover:text-white rounded-full transition-all"
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pl-3 pt-1">
                    {(['Women', 'Men'] as const).map(gender => (
                      <button
                        key={gender}
                        onClick={() => {
                          setSelectedGender(gender);
                          setActiveCategory('All');
                          handleNavigate('collections');
                        }}
                        className={`text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${selectedGender === gender ? 'border-gold text-gold bg-gold/10' : 'border-onyx/20 text-onyx/60'
                          }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pearls: Dedicated Tab (NOT inside Collections) */}
              <div className="flex flex-col gap-3">
                <button
                  className="text-left flex items-center justify-between"
                  onClick={() => {
                    setActiveCategory('Pearls');
                    setActiveSubCategory('All');
                    handleNavigate('collections');
                  }}
                >
                  <span>Pearls</span>
                  <span className="text-xs uppercase tracking-widest text-gold font-sans font-normal opacity-80">The Pearl Atelier</span>
                </button>
                <div className="flex flex-wrap gap-2 ml-3 pl-3 border-l border-gold/30 font-sans text-[10px] uppercase tracking-widest text-onyx/80">
                  {['South-Sea', 'Japanese-Akoya', 'Tahitian', 'Fresh Water Pearls'].map(sub => (
                    <button
                      key={sub}
                      onClick={() => {
                        setActiveCategory('Pearls');
                        setActiveSubCategory(sub);
                        handleNavigate('collections');
                      }}
                      className="px-2.5 py-1 bg-onyx/5 hover:bg-gold hover:text-white rounded-full transition-all"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <button className="text-left" onClick={() => handleNavigate('bespoke')}>Bespoke</button>
              <button className="text-left" onClick={() => handleNavigate('archive')}>Archive</button>
              <button className="text-left flex items-center gap-2" onClick={() => handleNavigate('admin')}>
                <Key size={22} className="text-gold" />
                <span>Atelier Admin</span>
              </button>
              <button className="text-left" onClick={() => handleNavigate('bespoke')}>Contact Concierge</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-80 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full md:w-112.5 z-90 bg-ivory shadow-2xl flex flex-col"
            >
              <div className="p-8 flex justify-between items-center border-b border-onyx/5">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-serif italic">Shopping Bag ({cart.length})</h3>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setIsClearCartConfirmOpen(true)}
                      className="text-[9px] uppercase tracking-widest text-onyx/40 hover:text-destructive transition-colors border-b border-onyx/10 pb-0.5"
                    >
                      Clear Bag
                    </button>
                  )}
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:text-gold transition-colors">
                  <X size={24} strokeWidth={1} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                {/* Clear Cart Confirmation Overlay */}
                <AnimatePresence>
                  {isClearCartConfirmOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-50 bg-ivory/95 backdrop-blur-sm flex items-center justify-center p-8 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                      >
                        <h4 className="text-2xl font-serif italic mb-4">Empty your bag?</h4>
                        <p className="text-onyx/60 text-sm font-light mb-8 max-w-62.5 mx-auto">
                          This will remove all items from your shopping bag. This action cannot be undone.
                        </p>
                        <div className="flex flex-col gap-3">
                          <button
                            onClick={clearCart}
                            className="bg-onyx text-white py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-gold transition-colors"
                          >
                            Yes, Clear Everything
                          </button>
                          <button
                            onClick={() => setIsClearCartConfirmOpen(false)}
                            className="text-[10px] uppercase tracking-[0.2em] font-bold py-4 hover:text-gold transition-colors"
                          >
                            No, Keep My Items
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <ShoppingBag size={48} strokeWidth={1} className="text-onyx/10 mb-6" />
                    <p className="text-lg font-serif italic text-onyx/40 mb-8">Your bag is empty.</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="text-[10px] uppercase tracking-widest border-b border-gold pb-1 hover:text-gold transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-6 group">
                        <div className="w-24 h-24 bg-onyx/5 overflow-hidden shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-serif text-lg">{item.name}</h4>
                              <button onClick={() => removeFromCart(item.id)} className="text-onyx/40 hover:text-gold transition-colors">
                                <X size={16} />
                              </button>
                            </div>
                            <p className="text-[10px] uppercase tracking-widest text-onyx/40 mb-2">{item.collection}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center border border-onyx/10 rounded-full px-3 py-1 gap-4">
                              <button onClick={() => updateQuantity(item.id, -1)} className="text-lg hover:text-gold transition-colors">-</button>
                              <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="text-lg hover:text-gold transition-colors">+</button>
                            </div>
                            <p className="text-sm font-medium text-gold">{item.price}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-8 bg-white border-t border-onyx/5">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-onyx/40">Subtotal</span>
                    <span className="text-2xl font-serif italic">{formattedCartTotal}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutModalOpen(true);
                    }}
                    className="w-full bg-onyx text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gold transition-colors duration-500 cursor-pointer shadow-lg"
                  >
                    Proceed to Checkout
                  </button>
                  <p className="text-[9px] text-center text-onyx/40 mt-4 uppercase tracking-widest">
                    Shipping & taxes calculated at checkout
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartItems={cart}
        currency={currency}
        totalFormatted={formattedCartTotal}
        subtotalNumber={cartTotal}
        onOrderSuccess={(order) => {
          setCart([]);
        }}
      />

      <AnimatePresence mode="wait">
        {view === 'admin' ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AdminDashboard
              onReturnToStorefront={() => handleNavigate('home')}
              onRefreshProducts={() => {
                setProducts(storeService.getProducts());
                setWebsiteSettings(storeService.getWebsiteSettings());
              }}
            />
          </motion.div>
        ) : view === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hero Section */}
            <header className="relative h-screen flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentHeroSlide}
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <img
                    src={HERO_SLIDES[currentHeroSlide].image}
                    alt={HERO_SLIDES[currentHeroSlide].title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                </motion.div>
              </AnimatePresence>

              <div className="relative z-10 text-center text-white px-4 max-w-4xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentHeroSlide}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] mb-6 font-medium">
                      {HERO_SLIDES[currentHeroSlide].subtitle}
                    </p>
                    <h2 className="text-5xl md:text-8xl font-serif italic font-light leading-tight mb-12 whitespace-pre-line">
                      {HERO_SLIDES[currentHeroSlide].title}
                    </h2>
                    <motion.button
                      onClick={() => setView('collections')}
                      className="group flex items-center gap-4 mx-auto border border-white/30 px-8 py-4 rounded-full hover:bg-white hover:text-onyx transition-all duration-500"
                    >
                      <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Explore Collection</span>
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="absolute bottom-12 left-12 hidden md:block">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentHeroSlide}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="vertical-text text-[10px] uppercase tracking-[0.3em] text-white/60"
                  >
                    {HERO_SLIDES[currentHeroSlide].tag}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Carousel Indicators */}
              <div className="absolute bottom-12 flex gap-4">
                {HERO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentHeroSlide(idx)}
                    className={`h-1 transition-all duration-500 ${currentHeroSlide === idx ? 'w-12 bg-white' : 'w-4 bg-white/30'}`}
                  />
                ))}
              </div>
            </header>
          </motion.div>
        ) : view === 'collections' ? (
          <motion.div
            key="collections"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-screen overflow-hidden"
          >
            <CollectionsCarouselShowcase
              products={products}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              activeSubCategory={activeSubCategory}
              onSelectSubCategory={setActiveSubCategory}
              selectedGender={selectedGender}
              onSelectGender={setSelectedGender}
              currency={currency}
              formatPrice={(p) => formatPriceUtil(p, currency)}
              onProductClick={handleProductClick}
              onAddToCart={addToCart}
              onBuyNow={buyNow}
              onReturnHome={() => handleNavigate('home')}
              selectedMaterials={selectedMaterials}
              onSelectMaterials={setSelectedMaterials}
              allMaterials={allMaterials}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
            />
          </motion.div>
        ) : view === 'bespoke' ? (
          <motion.div
            key="bespoke"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pt-40 pb-24 bg-ivory min-h-screen"
          >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
              <header className="mb-24 text-center">
                <h3 className="text-xs uppercase tracking-[0.4em] text-gold font-semibold mb-6">Bespoke Creations</h3>
                <h2 className="text-5xl md:text-8xl font-serif italic leading-tight">Custom Masterpieces</h2>
                <p className="mt-8 text-onyx/60 text-sm max-w-2xl mx-auto font-light leading-relaxed">
                  From reimagining family heirlooms to creating entirely new visions from scratch, our bespoke service is a collaborative journey between artisan and dreamer.
                </p>
              </header>

              <div className="space-y-32">
                {BESPOKE_ITEMS.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-24 items-center`}
                  >
                    <div className="flex-1 w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {item.beforeImage && (
                          <div className="relative group">
                            <div className="absolute top-4 left-4 z-10 bg-onyx/80 backdrop-blur-sm text-white text-[8px] uppercase tracking-widest px-2 py-1">Before</div>
                            <div className="aspect-4/5 overflow-hidden bg-onyx/5">
                              <img
                                src={item.beforeImage}
                                alt={`${item.name} Before`}
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </div>
                        )}
                        <div className={`relative group ${!item.beforeImage ? 'md:col-span-2' : ''}`}>
                          <div className="absolute top-4 left-4 z-10 bg-gold text-white text-[8px] uppercase tracking-widest px-2 py-1">After</div>
                          <div className="aspect-4/5 overflow-hidden bg-onyx/5 shadow-2xl">
                            <img
                              src={item.afterImage}
                              alt={`${item.name} After`}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 max-w-xl">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold mb-4">{item.date}</p>
                      <h3 className="text-3xl md:text-5xl font-serif mb-6">{item.name}</h3>
                      <p className="text-onyx/80 text-lg font-serif italic mb-8 leading-relaxed">
                        "{item.description}"
                      </p>
                      <div className="h-px w-12 bg-gold mb-8" />
                      <p className="text-onyx/60 text-sm font-light leading-relaxed mb-12">
                        {item.story}
                      </p>
                      <button
                        onClick={() => window.location.href = `mailto:bespoke@anovi.com?subject=Bespoke Inquiry: ${item.name}`}
                        className="text-[10px] uppercase tracking-[0.3em] font-medium border-b border-gold pb-2 hover:text-gold transition-colors"
                      >
                        Start Your Journey
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bespoke Call to Action */}
              <section className="mt-40 py-24 bg-onyx text-ivory px-6">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-serif italic mb-8">Begin Your Bespoke Journey</h2>
                    <p className="text-ivory/60 text-sm max-w-xl mx-auto font-light leading-relaxed">
                      Whether it's a sketch on a napkin or a stone passed down through generations, we are here to bring your unique story to life.
                    </p>
                  </div>

                  {!isBespokeFormSubmitting ? (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setIsBespokeFormSubmitting(true);
                        try {
                          await storeService.submitInquiryOnServer({
                            name: bespokeForm.name,
                            email: bespokeForm.email,
                            preferredDate: bespokeForm.date,
                            preferredTime: bespokeForm.time,
                            description: bespokeForm.description,
                          });
                        } catch (err) {
                          console.warn('Inquiry submission fallback:', err);
                        }
                        setIsBespokeFormSubmitting(false);
                        setBespokeForm({ date: '', time: '', description: '', name: '', email: '' });
                        alert('Thank you for your bespoke commission inquiry. Our master artisans will contact you shortly to confirm your private consultation.');
                      }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left bg-white/5 p-8 md:p-12 backdrop-blur-sm border border-white/10"
                    >
                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gold">Full Name</label>
                          <input
                            required
                            type="text"
                            value={bespokeForm.name}
                            onChange={(e) => setBespokeForm({ ...bespokeForm, name: e.target.value })}
                            className="w-full bg-transparent border-b border-white/20 py-2 focus:border-gold outline-none transition-colors text-sm font-light text-white"
                            placeholder="Your Name"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gold">Email Address</label>
                          <input
                            required
                            type="email"
                            value={bespokeForm.email}
                            onChange={(e) => setBespokeForm({ ...bespokeForm, email: e.target.value })}
                            className="w-full bg-transparent border-b border-white/20 py-2 focus:border-gold outline-none transition-colors text-sm font-light text-white"
                            placeholder="your@email.com"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gold items-center gap-2">
                              <Calendar size={12} /> Preferred Date
                            </label>
                            <input
                              required
                              type="date"
                              value={bespokeForm.date}
                              onChange={(e) => setBespokeForm({ ...bespokeForm, date: e.target.value })}
                              className="w-full bg-transparent border-b border-white/20 py-2 focus:border-gold outline-none transition-colors text-sm font-light text-white appearance-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gold items-center gap-2">
                              <Clock size={12} /> Preferred Time
                            </label>
                            <select
                              required
                              value={bespokeForm.time}
                              onChange={(e) => setBespokeForm({ ...bespokeForm, time: e.target.value })}
                              className="w-full bg-transparent border-b border-white/20 py-2 focus:border-gold outline-none transition-colors text-sm font-light text-white appearance-none"
                            >
                              <option value="" className="bg-onyx">Select a time</option>
                              <option value="morning" className="bg-onyx">Morning (10 AM - 12 PM)</option>
                              <option value="afternoon" className="bg-onyx">Afternoon (1 PM - 4 PM)</option>
                              <option value="evening" className="bg-onyx">Evening (5 PM - 7 PM)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gold items-center gap-2">
                            <MessageSquare size={12} /> Project Description
                          </label>
                          <textarea
                            rows={6}
                            value={bespokeForm.description}
                            onChange={(e) => setBespokeForm({ ...bespokeForm, description: e.target.value })}
                            className="w-full bg-transparent border border-white/10 p-4 focus:border-gold outline-none transition-colors text-sm font-light text-white resize-none"
                            placeholder="Tell us about your vision, preferred materials, or any stones you'd like to incorporate..."
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-gold text-white py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-onyx transition-all duration-500 shadow-xl"
                        >
                          Request Consultation
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="py-24 flex flex-col items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full mb-8"
                      />
                      <p className="text-gold text-[10px] uppercase tracking-[0.3em] font-bold animate-pulse">Processing Your Request...</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </motion.div>
        ) : view === 'archive' ? (
          <motion.div
            key="archive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pt-40 pb-24 bg-onyx text-ivory min-h-screen"
          >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
              <header className="mb-24 text-center">
                <h3 className="text-xs uppercase tracking-[0.4em] text-gold font-semibold mb-6">The Archive</h3>
                <h2 className="text-5xl md:text-8xl font-serif italic leading-tight">Old Creations</h2>
                <p className="mt-8 text-ivory/40 text-sm max-w-2xl mx-auto font-light leading-relaxed">
                  A curated gallery of our past masterpieces. While these pieces are no longer in our active collection, we invite you to inquire about bespoke recreations or similar commissions.
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-75 md:auto-rows-100">
                {dynamicArchiveItems.map((item, index) => {
                  const spans = [
                    "md:col-span-2 md:row-span-2",
                    "md:col-span-1 md:row-span-1",
                    "md:col-span-1 md:row-span-1",
                    "md:col-span-3 md:row-span-1"
                  ];
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.8 }}
                      className={`group relative overflow-hidden bg-white/5 ${spans[index % spans.length]}`}
                    >
                      <motion.img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-1000 grayscale group-hover:grayscale-0"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 1.5 }}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-onyx/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />

                      {/* Top Right Inquire Button */}
                      <div className="absolute top-6 right-6 -translate-y-2.5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <button
                          onClick={() => window.location.href = `mailto:bespoke@anovi.com?subject=Inquiry: ${item.name}&body=I am interested in learning more about the ${item.name} from your archive.`}
                          className="bg-gold/90 backdrop-blur-md text-white px-6 py-3 text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-onyx transition-all duration-500 shadow-2xl flex items-center gap-2"
                        >
                          Inquire <ArrowUpRight size={12} />
                        </button>
                      </div>

                      {/* Bottom Info */}
                      <div className="absolute bottom-8 left-8 right-8">
                        <p className="text-[8px] uppercase tracking-[0.3em] text-gold mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                          {item.collection} {item.price ? `• ${item.price}` : ''}
                        </p>
                        <h4 className="text-2xl font-serif italic text-white">{item.name}</h4>
                        {item.description && (
                          <p className="text-xs text-white/60 font-light mt-1 max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-150 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : view === 'product' && selectedProduct ? (
          <motion.div
            key={`product-${selectedProduct.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-screen overflow-hidden"
          >
            <ProductDetailCinematic
              product={selectedProduct}
              currency={currency}
              onBack={() => setView('collections')}
              onAddToCart={addToCart}
              onBuyNow={buyNow}
              onOpenCart={() => setIsCartOpen(true)}
              cartCount={cartCount}
              formatPrice={formatPrice}
              onOpenBespokeInquiry={(name) => {
                setBespokeForm(prev => ({
                  ...prev,
                  description: `Inquiry regarding bespoke commission or variation for: ${name}`
                }));
                setView('bespoke');
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Newsletter (Bespoke and Archive Only) */}
      {(view === 'bespoke' || view === 'archive') && (
        <section className="py-24 md:py-40 px-6 bg-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif mb-8">Join the Inner Circle</h2>
            <p className="text-onyx/60 text-sm md:text-base font-light mb-12 tracking-wide">
              Receive exclusive access to new collections, private events, and the stories behind our most rare creations.
            </p>
            <form className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your Email Address"
                className="flex-1 bg-transparent border-b border-onyx/20 py-3 px-2 focus:border-gold outline-none transition-colors text-sm font-light"
              />
              <button className="bg-onyx text-white px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-gold transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Footer (Bespoke and Archive Only) */}
      {(view === 'bespoke' || view === 'archive') && (
        <footer className="bg-ivory border-t border-onyx/5 pt-24 pb-12 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
              <div className="lg:col-span-1">
                <Logo className="h-6 mb-8" />
                <p className="text-onyx/60 text-xs font-light leading-relaxed max-w-xs">
                  Exquisite high jewelry crafted with passion and precision since 1924.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => handleNavigate('admin')}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold font-bold hover:underline"
                  >
                    <Key size={12} />
                    <span>Enter Atelier Management</span>
                  </button>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-8">Collections</h4>
                <ul className="flex flex-col gap-4 text-xs text-onyx/60 font-light">
                  <li><button onClick={() => handleNavigate('home')} className="hover:text-gold transition-colors text-left">Home</button></li>
                  <li><button onClick={() => handleNavigate('collections')} className="hover:text-gold transition-colors text-left">Current Series</button></li>
                  <li><button onClick={() => handleNavigate('bespoke')} className="hover:text-gold transition-colors text-left">Bespoke</button></li>
                  <li><button onClick={() => handleNavigate('archive')} className="hover:text-gold transition-colors text-left">The Archive</button></li>
                  <li><button onClick={() => handleNavigate('admin')} className="hover:text-gold transition-colors text-left flex items-center gap-1 font-medium text-gold"><Sparkles size={11} /> Upload New Piece</button></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-8">Client Care</h4>
                <ul className="flex flex-col gap-4 text-xs text-onyx/60 font-light">
                  <li><a href={`mailto:${websiteSettings.contactEmail}`} className="hover:text-gold transition-colors">Contact Concierge</a></li>
                  <li><a href="#" className="hover:text-gold transition-colors">Shipping & Returns</a></li>
                  <li><a href="#" className="hover:text-gold transition-colors">Care Guide</a></li>
                  <li><button onClick={() => handleNavigate('bespoke')} className="hover:text-gold transition-colors text-left">Book Consultation</button></li>
                  <li><button onClick={() => handleNavigate('admin')} className="hover:text-gold transition-colors text-left flex items-center gap-1.5 text-gold font-semibold"><Key size={11} /> Atelier Admin Portal</button></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-8">Follow Us</h4>
                <div className="flex gap-6">
                  <a href="#" className="text-onyx/60 hover:text-gold transition-colors"><Instagram size={18} strokeWidth={1.5} /></a>
                  <a href="#" className="text-onyx/60 hover:text-gold transition-colors"><Facebook size={18} strokeWidth={1.5} /></a>
                  <a href="#" className="text-onyx/60 hover:text-gold transition-colors"><PinterestIcon size={18} /></a>
                </div>
                <div className="mt-8 text-[11px] text-onyx/60 space-y-1">
                  <p className="font-serif italic text-gold">{websiteSettings.atelierLocation}</p>
                  <p>{websiteSettings.contactPhone}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-onyx/5 gap-6">
              <p className="text-[10px] text-onyx/40 uppercase tracking-widest">© 2026 ANOVI Haute Joaillerie. All Rights Reserved.</p>
              <div className="flex gap-8 text-[10px] text-onyx/40 uppercase tracking-widest">
                <a href="#" className="hover:text-onyx transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-onyx transition-colors">Terms of Service</a>
                <button onClick={() => handleNavigate('admin')} className="hover:text-gold transition-colors">Admin Portal</button>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
} 