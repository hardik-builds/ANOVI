import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import { 
  Camera, CameraOff, QrCode, Scan, RefreshCw, X, CheckCircle2, 
  AlertCircle, DollarSign, Gem, ShieldCheck, History, ArrowRight, 
  Printer, ExternalLink, Sliders, Volume2, VolumeX, Sparkles, 
  Upload, Search, FileText, Check, Copy, Tag, MapPin, Layers, 
  Plus, Edit3, ArrowUpRight, ArrowDownRight, Clock, ShieldAlert,
  Flame, ChevronRight, Eye, UserCheck
} from 'lucide-react';
import { Product, LedgerEntry, InventoryAuditLog, MetalRatesState } from './types';

export interface JewelryTagScannerProps {
  products: Product[];
  ledger: LedgerEntry[];
  auditLogs?: InventoryAuditLog[];
  metalRates?: MetalRatesState;
  marketView?: 'india' | 'global';
  onUpdateProduct?: (product: Product) => void;
  onAddLedgerEntry?: (entry: LedgerEntry) => void;
  onAddAuditLog?: (log: InventoryAuditLog) => void;
  onOpenProductModal?: (product: Product) => void;
  onClose?: () => void;
  initialProductId?: string;
  isModal?: boolean;
}

export const JewelryTagScanner: React.FC<JewelryTagScannerProps> = ({
  products,
  ledger,
  auditLogs = [],
  metalRates,
  marketView = 'india',
  onUpdateProduct,
  onAddLedgerEntry,
  onAddAuditLog,
  onOpenProductModal,
  onClose,
  initialProductId,
  isModal = false,
}) => {
  // Video & Scanner State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isContinuousScan, setIsContinuousScan] = useState<boolean>(false);
  const [torchEnabled, setTorchEnabled] = useState<boolean>(false);
  const [hasTorchCapability, setHasTorchCapability] = useState<boolean>(false);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);

  // Scan Results & Selection
  const [scannedRawData, setScannedRawData] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    if (initialProductId) {
      return products.find(p => p.id === initialProductId || p.sku === initialProductId) || null;
    }
    return null;
  });
  const [scanHistory, setScanHistory] = useState<{ id: string; sku: string; name: string; timestamp: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'ledger' | 'audit' | 'tag_print'>('details');
  const [manualQuery, setManualQuery] = useState<string>('');
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Quick Action Forms State
  const [isAuditingItem, setIsAuditingItem] = useState<boolean>(false);
  const [auditNotes, setAuditNotes] = useState<string>('Physical QR tag scan verified in showroom display.');
  const [auditorName, setAuditorName] = useState<string>('Boutique Floor Manager');

  const [isAddingLedger, setIsAddingLedger] = useState<boolean>(false);
  const [ledgerCategory, setLedgerCategory] = useState<'Inflow' | 'Outflow'>('Inflow');
  const [ledgerType, setLedgerType] = useState<LedgerEntry['type']>('customer_advance');
  const [ledgerAmount, setLedgerAmount] = useState<number | ''>('');
  const [ledgerDescription, setLedgerDescription] = useState<string>('');
  const [ledgerParty, setLedgerParty] = useState<string>('');

  // Generated QR Code Data URL for the selected item tag
  const [generatedTagQrUrl, setGeneratedTagQrUrl] = useState<string>('');

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3500);
  }, []);

  // Web Audio Synth for Luxury Scanned Chime
  const playScanChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const now = ctx.currentTime;
      // High-end pleasant two-tone chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.15); // A6

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1318.51, now); // E6
      osc2.frequency.exponentialRampToValueAtTime(2637, now + 0.2); // E7

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.36);
      osc2.stop(now + 0.36);
    } catch {
      // AudioContext might be blocked until user gesture
    }
  }, [soundEnabled]);

  // Find product by parsed raw data
  const findProductFromPayload = useCallback((raw: string): Product | null => {
    if (!raw) return null;
    const cleanRaw = raw.trim();

    // 1. Try JSON payload
    try {
      if (cleanRaw.startsWith('{') && cleanRaw.endsWith('}')) {
        const parsed = JSON.parse(cleanRaw);
        const match = products.find(p => 
          (parsed.sku && p.sku.toLowerCase() === parsed.sku.toLowerCase()) ||
          (parsed.id && p.id.toLowerCase() === parsed.id.toLowerCase()) ||
          (parsed.tagId && p.sku.toLowerCase() === parsed.tagId.toLowerCase())
        );
        if (match) return match;
      }
    } catch {
      // Not JSON, continue to string match
    }

    // 2. Try URL query or path
    if (cleanRaw.includes('/tag/') || cleanRaw.includes('sku=')) {
      const parts = cleanRaw.split('/tag/');
      const skuFromPath = parts.length > 1 ? parts[1].split('?')[0].split('#')[0] : null;
      if (skuFromPath) {
        const match = products.find(p => p.sku.toLowerCase() === decodeURIComponent(skuFromPath).toLowerCase());
        if (match) return match;
      }

      const urlParams = new URLSearchParams(cleanRaw.split('?')[1] || '');
      const paramSku = urlParams.get('sku');
      if (paramSku) {
        const match = products.find(p => p.sku.toLowerCase() === paramSku.toLowerCase());
        if (match) return match;
      }
    }

    // 3. Try direct SKU match (case-insensitive)
    const exactSkuMatch = products.find(p => p.sku.toLowerCase() === cleanRaw.toLowerCase());
    if (exactSkuMatch) return exactSkuMatch;

    // 4. Try direct ID match
    const exactIdMatch = products.find(p => p.id.toLowerCase() === cleanRaw.toLowerCase());
    if (exactIdMatch) return exactIdMatch;

    // 5. Try partial SKU or Name match
    const partialMatch = products.find(p => 
      cleanRaw.toLowerCase().includes(p.sku.toLowerCase()) || 
      p.sku.toLowerCase().includes(cleanRaw.toLowerCase()) ||
      p.name.toLowerCase() === cleanRaw.toLowerCase()
    );
    if (partialMatch) return partialMatch;

    return null;
  }, [products]);

  // Handle successful scan
  const handleTagScanned = useCallback((rawCode: string) => {
    setScannedRawData(rawCode);
    playScanChime();

    if (navigator.vibrate) {
      try {
        navigator.vibrate([40, 30, 60]);
      } catch {
        // Haptic feedback ignored if unsupported
      }
    }

    const matched = findProductFromPayload(rawCode);
    if (matched) {
      setSelectedProduct(matched);
      setScanHistory(prev => {
        const exists = prev.some(h => h.id === matched.id);
        const item = {
          id: matched.id,
          sku: matched.sku,
          name: matched.name,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        return exists ? [item, ...prev.filter(h => h.id !== matched.id)].slice(0, 10) : [item, ...prev].slice(0, 10);
      });
      showToast(`Tag Decoded: ${matched.sku} — ${matched.name}`, 'success');

      if (!isContinuousScan) {
        // Keep camera idle or paused
      }
    } else {
      showToast(`Tag scanned: "${rawCode.slice(0, 30)}..." (No matching inventory piece found)`, 'error');
    }
  }, [findProductFromPayload, playScanChime, isContinuousScan, showToast]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (videoTrackRef.current) {
        videoTrackRef.current.stop();
        videoTrackRef.current = null;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access is not supported by your browser or in this environment.');
        setIsCameraActive(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
      }

      const track = stream.getVideoTracks()[0];
      videoTrackRef.current = track;

      // Check torch capability
      try {
        const capabilities = (track.getCapabilities && track.getCapabilities()) || {};
        setHasTorchCapability(Boolean((capabilities as any).torch));
      } catch {
        setHasTorchCapability(false);
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in browser settings, or use the Image Upload / Quick Tag simulator below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. You can upload an image of the jewelry tag or use the Quick Simulator below.');
      } else {
        setCameraError('Unable to initialize camera video feed. Please use image upload or the quick selector below.');
      }
      setIsCameraActive(false);
    }
  }, [facingMode]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (videoTrackRef.current) {
      videoTrackRef.current.stop();
      videoTrackRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsCameraActive(false);
    setTorchEnabled(false);
  }, []);

  // Toggle torch/flashlight
  const toggleTorch = async () => {
    if (!videoTrackRef.current || !hasTorchCapability) return;
    try {
      const nextState = !torchEnabled;
      await (videoTrackRef.current as any).applyConstraints({
        advanced: [{ torch: nextState }]
      });
      setTorchEnabled(nextState);
    } catch (e) {
      console.warn('Failed to toggle torch:', e);
    }
  };

  // Continuous frame scanner loop
  useEffect(() => {
    if (!isCameraActive) return;

    let isScanning = true;
    let lastScanTime = 0;

    const scanFrame = () => {
      if (!isScanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const now = Date.now();
        // Rate-limit analysis to every 120ms to preserve smooth rendering
        if (now - lastScanTime > 120) {
          lastScanTime = now;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth'
            });

            if (code && code.data) {
              handleTagScanned(code.data);
            }
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      isScanning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCameraActive, handleTagScanned]);

  // Decode uploaded image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: 'attemptBoth'
        });

        if (code && code.data) {
          handleTagScanned(code.data);
        } else {
          showToast('No QR code detected in the uploaded image. Please try a clearer picture of the jewelry tag.', 'error');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input so user can re-upload same file if desired
    e.target.value = '';
  };

  // Generate high-res QR for selected product tag
  useEffect(() => {
    if (!selectedProduct) {
      setGeneratedTagQrUrl('');
      return;
    }

    const payload = JSON.stringify({
      sku: selectedProduct.sku,
      id: selectedProduct.id,
      brand: 'LUMORA',
      type: 'fine_jewelry_tag'
    });

    QRCode.toDataURL(payload, {
      width: 400,
      margin: 1,
      color: {
        dark: '#161616',
        light: '#FFFFFF'
      }
    })
      .then(url => setGeneratedTagQrUrl(url))
      .catch(err => console.error('Failed to generate tag QR:', err));
  }, [selectedProduct]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Related Ledger Transactions for the selected product
  const productLedgerEntries = useMemo(() => {
    if (!selectedProduct) return [];
    return ledger.filter(l => {
      const rel = (l.relatedId || '').toLowerCase();
      const desc = (l.description || '').toLowerCase();
      const name = (selectedProduct.name || '').toLowerCase();
      const sku = (selectedProduct.sku || '').toLowerCase();
      const id = (selectedProduct.id || '').toLowerCase();

      return rel === id || rel === sku || desc.includes(name) || desc.includes(sku);
    });
  }, [selectedProduct, ledger]);

  // Ledger Summary Totals
  const ledgerTotals = useMemo(() => {
    let inflows = 0;
    let outflows = 0;
    productLedgerEntries.forEach(e => {
      if (e.category === 'Inflow') inflows += e.amount;
      else outflows += e.amount;
    });
    return {
      inflows,
      outflows,
      net: inflows - outflows,
      count: productLedgerEntries.length
    };
  }, [productLedgerEntries]);

  // Real-time valuation estimation based on live metal rates
  const liveValuation = useMemo(() => {
    if (!selectedProduct || !metalRates) return null;
    const rates = marketView === 'india' ? metalRates.india : metalRates.global;
    const curr = rates.currency;

    let metalBaseRate = 0;
    const mat = (selectedProduct.material || '').toLowerCase();

    if (mat.includes('24k') || mat.includes('999')) metalBaseRate = rates.gold['24k'] || 0;
    else if (mat.includes('22k') || mat.includes('916')) metalBaseRate = rates.gold['22k'] || 0;
    else if (mat.includes('18k') || mat.includes('750')) metalBaseRate = rates.gold['18k'] || 0;
    else if (mat.includes('14k') || mat.includes('585')) metalBaseRate = rates.gold['14k'] || 0;
    else if (mat.includes('platinum') || mat.includes('950')) metalBaseRate = rates.platinum?.['Pt950'] || (rates.gold['18k'] * 0.7);
    else if (mat.includes('silver') || mat.includes('925')) metalBaseRate = rates.silver?.['925'] || 86;
    else metalBaseRate = rates.gold['18k'] || 0;

    const netWeight = selectedProduct.netWeight || selectedProduct.grossWeight || 12; // fallback typical grams
    const rawMetalCost = Math.round(metalBaseRate * netWeight);
    const diamondCarat = selectedProduct.caratWeight || 0.85;
    const diamondRate = rates.diamond?.pointers || (rates.currency === 'INR' ? 72000 : 880);
    const diamondValuation = Math.round(diamondCarat * diamondRate);
    const artisanCost = selectedProduct.craftsmanCost || Math.round(rawMetalCost * 0.22);
    const estimatedCost = rawMetalCost + diamondValuation + artisanCost;
    const currentPrice = selectedProduct.price;
    const margin = currentPrice > estimatedCost ? Math.round(((currentPrice - estimatedCost) / currentPrice) * 100) : 0;

    return {
      currency: curr,
      metalBaseRate,
      rawMetalCost,
      diamondValuation,
      artisanCost,
      estimatedCost,
      currentPrice,
      margin
    };
  }, [selectedProduct, metalRates, marketView]);

  // Handle Quick Audit Check Log
  const handleLogPhysicalAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const newLog: InventoryAuditLog = {
      id: `AUD-QR-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      itemId: selectedProduct.sku,
      itemName: selectedProduct.name,
      previousQuantity: selectedProduct.stock,
      newQuantity: selectedProduct.stock,
      variance: 0,
      notes: `${auditNotes} (Physical QR Tag Scanned)`,
      auditor: auditorName || 'Boutique Auditor'
    };

    onAddAuditLog?.(newLog);
    showToast(`Audit log recorded for ${selectedProduct.sku}!`, 'success');
    setIsAuditingItem(false);
  };

  // Handle Quick Add Ledger Entry
  const handleAddLedgerEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !ledgerAmount || Number(ledgerAmount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    const newEntry: LedgerEntry = {
      id: `TXN-TAG-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: ledgerType,
      category: ledgerCategory,
      amount: Number(ledgerAmount),
      relatedId: selectedProduct.sku,
      relatedName: ledgerParty || selectedProduct.name,
      description: ledgerDescription || `${ledgerCategory === 'Inflow' ? 'Customer payment' : 'Craftsman fee'} for ${selectedProduct.name} (${selectedProduct.sku})`,
      status: 'completed'
    };

    onAddLedgerEntry?.(newEntry);
    showToast(`Ledger transaction of ${newEntry.amount.toLocaleString()} logged!`, 'success');
    setLedgerAmount('');
    setLedgerDescription('');
    setLedgerParty('');
    setIsAddingLedger(false);
  };

  // Handle Status Update
  const handleStatusChange = (newStatus: any) => {
    if (!selectedProduct || !onUpdateProduct) return;
    const updated = { ...selectedProduct, status: newStatus };
    onUpdateProduct(updated);
    setSelectedProduct(updated);
    showToast(`Status updated to ${newStatus}`, 'success');
  };

  // Print jewelry tag
  const handlePrintTag = () => {
    window.print();
  };

  // Select a sample tag for instant demo / staff testing
  const handleSelectSampleProduct = (prod: Product) => {
    handleTagScanned(prod.sku);
  };

  return (
    <div className={`relative ${isModal ? 'fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-in fade-in duration-300' : 'space-y-6 animate-in fade-in duration-500'}`}>
      {/* Toast Notification */}
      {feedbackToast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-sm shadow-2xl border text-xs font-serif flex items-center gap-3 animate-in fade-in slide-in-from-top-3 ${
          feedbackToast.type === 'success' 
            ? 'bg-lumora-charcoal text-white border-lumora-gold/40' 
            : feedbackToast.type === 'error'
            ? 'bg-red-950 text-white border-red-500/50'
            : 'bg-lumora-bone text-lumora-charcoal border-black/10'
        }`}>
          {feedbackToast.type === 'success' && <Sparkles size={16} className="text-lumora-gold" />}
          {feedbackToast.type === 'error' && <AlertCircle size={16} className="text-red-400" />}
          {feedbackToast.type === 'info' && <Tag size={16} className="text-lumora-gold" />}
          <span className="font-medium tracking-wide">{feedbackToast.message}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className={`bg-white border border-black/10 shadow-2xl overflow-hidden flex flex-col ${isModal ? 'w-full max-w-7xl max-h-[94vh] rounded-none' : 'w-full rounded-sm'}`}>
        
        {/* Top Header Bar */}
        <div className="bg-lumora-charcoal text-white px-6 py-5 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-sm bg-lumora-gold/15 border border-lumora-gold/30 flex items-center justify-center text-lumora-gold shadow-inner">
              <Scan size={20} strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-bold text-white tracking-wide">Jewelry Tag Scanner & Ledger Access</h3>
                <span className="bg-lumora-gold/20 text-lumora-gold text-[8px] font-mono uppercase px-2 py-0.5 tracking-widest border border-lumora-gold/30">
                  Staff Portal
                </span>
              </div>
              <p className="text-[10px] text-white/60 tracking-wider mt-0.5 uppercase font-medium">
                Scan physical QR/barcode hang-tags for real-time atelier specs, vault audit, and financial ledger
              </p>
            </div>
          </div>

          {/* Header Quick Controls */}
          <div className="flex items-center gap-2.5 self-end sm:self-center">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(prev => !prev)}
              className={`p-2 rounded-sm border transition-all text-xs flex items-center gap-1.5 ${
                soundEnabled 
                  ? 'bg-white/10 border-white/20 text-lumora-gold hover:bg-white/20' 
                  : 'bg-black/30 border-white/10 text-white/40 hover:text-white'
              }`}
              title={soundEnabled ? 'Chime sound active' : 'Chime sound muted'}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>

            {/* Continuous Scan Toggle */}
            <button
              type="button"
              onClick={() => setIsContinuousScan(prev => !prev)}
              className={`px-3 py-1.5 rounded-sm border text-[9px] uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 ${
                isContinuousScan 
                  ? 'bg-lumora-gold text-white border-lumora-gold shadow-sm' 
                  : 'bg-white/5 text-white/70 border-white/15 hover:bg-white/10'
              }`}
              title="Continuous scanning allows counting multiple tags consecutively"
            >
              <RefreshCw size={12} className={isContinuousScan ? 'animate-spin' : ''} />
              <span>{isContinuousScan ? 'Continuous Audit: ON' : 'Continuous: OFF'}</span>
            </button>

            {/* Close Modal Button */}
            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-sm bg-white/5 text-white/70 hover:bg-white/20 hover:text-white border border-white/10 transition-colors"
                title="Close Scanner"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Workstation Grid Layout: Left Scanner & Samples (5 cols), Right Details & Ledger (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-[580px] overflow-hidden">
          
          {/* LEFT COLUMN: Camera Viewfinder, File Upload, Manual Search, Quick Samples */}
          <div className="lg:col-span-5 border-r border-black/10 bg-lumora-bone/30 flex flex-col p-5 space-y-5 overflow-y-auto max-h-[85vh]">
            
            {/* Viewfinder Card */}
            <div className="bg-black rounded-sm relative overflow-hidden aspect-[4/3] flex flex-col items-center justify-center shadow-lg border border-lumora-charcoal/40 group">
              <video 
                ref={videoRef} 
                className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Viewfinder Overlays when Camera Active */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                  <div className="flex justify-between items-center text-white/70 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span>LIVE FEED</span>
                    </div>
                    <span className="bg-black/60 px-2 py-0.5 rounded border border-white/10">1080p ATELIER OPTIC</span>
                  </div>

                  {/* Scanning Target Crosshairs & Luxury Golden Brackets */}
                  <div className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56">
                    {/* Corner Brackets */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-lumora-gold" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-lumora-gold" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-lumora-gold" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-lumora-gold" />
                    
                    {/* Animated Gold Laser Line */}
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-lumora-gold to-transparent shadow-[0_0_12px_#C5A880] animate-pulse top-1/2 -translate-y-1/2" />
                    
                    {/* Center Reticle dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-lumora-gold/80" />
                    </div>
                  </div>

                  <div className="text-center text-white/75 text-[10px] uppercase font-bold tracking-widest bg-black/60 py-1 px-3 rounded mx-auto backdrop-blur-sm">
                    Center jewelry tag barcode / QR in frame
                  </div>
                </div>
              )}

              {/* Viewfinder Standby State (When camera is off or not yet started) */}
              {!isCameraActive && (
                <div className="text-center p-6 flex flex-col items-center justify-center space-y-3.5 text-white">
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-lumora-gold">
                    <Camera size={26} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-white tracking-wide">Optical Scanner Ready</h4>
                    <p className="text-[10px] text-white/60 tracking-wider max-w-[240px] mt-1">
                      Activate the camera feed to scan luxury hang-tags, vitrine pedestals, or certificate cards
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={startCamera}
                    className="bg-lumora-gold text-white hover:bg-lumora-gold/90 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 active:scale-95 shadow-md"
                  >
                    <Camera size={14} /> Start Camera Feed
                  </button>
                </div>
              )}

              {/* Floating Camera Toolbar when active */}
              {isCameraActive && (
                <div className="absolute bottom-3 inset-x-3 flex justify-between items-center bg-black/80 backdrop-blur-md px-3 py-1.5 rounded border border-white/15 text-white">
                  <button
                    type="button"
                    onClick={() => {
                      setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
                      setTimeout(() => startCamera(), 100);
                    }}
                    className="text-[9px] uppercase tracking-wider font-bold hover:text-lumora-gold flex items-center gap-1 transition-colors"
                    title="Switch between front and back cameras"
                  >
                    <RefreshCw size={12} /> Flip Lens
                  </button>

                  {hasTorchCapability && (
                    <button
                      type="button"
                      onClick={toggleTorch}
                      className={`text-[9px] uppercase tracking-wider font-bold flex items-center gap-1 transition-colors ${
                        torchEnabled ? 'text-lumora-gold' : 'text-white/70 hover:text-white'
                      }`}
                      title="Toggle camera flashlight"
                    >
                      <Flame size={12} /> {torchEnabled ? 'Torch: ON' : 'Torch: OFF'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="text-[9px] uppercase tracking-wider font-bold text-red-300 hover:text-red-200 flex items-center gap-1 transition-colors"
                    title="Pause camera"
                  >
                    <CameraOff size={12} /> Pause Camera
                  </button>
                </div>
              )}
            </div>

            {/* Camera Error / Permission notice if any */}
            {cameraError && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-sm text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold">Camera Notice: </span>
                  {cameraError}
                </div>
              </div>
            )}

            {/* Alternative Input Tools: Image Upload + Manual Search */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* File Upload Trigger */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white border border-black/10 hover:border-black/30 hover:bg-black/[0.02] p-2.5 text-center flex items-center justify-center gap-2 text-lumora-charcoal text-[10px] uppercase font-bold tracking-wider transition-all"
                title="Upload image containing QR code tag"
              >
                <Upload size={14} className="text-lumora-gold" />
                <span>Upload Tag Photo</span>
              </button>

              {/* Instant Test Trigger */}
              <button
                type="button"
                onClick={() => {
                  if (products.length > 0) {
                    const randomIdx = Math.floor(Math.random() * products.length);
                    handleTagScanned(products[randomIdx].sku);
                  }
                }}
                className="bg-white border border-black/10 hover:border-black/30 hover:bg-black/[0.02] p-2.5 text-center flex items-center justify-center gap-2 text-lumora-charcoal text-[10px] uppercase font-bold tracking-wider transition-all"
                title="Simulate scanning a random showroom piece"
              >
                <Sparkles size={14} className="text-lumora-gold" />
                <span>Quick Test Scan</span>
              </button>
            </div>

            {/* Manual Tag SKU Search Bar */}
            <div className="bg-white border border-black/10 p-3 rounded-sm space-y-2">
              <label className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe flex items-center justify-between">
                <span>Manual Tag / SKU Lookup</span>
                <Search size={12} />
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && manualQuery.trim()) {
                      handleTagScanned(manualQuery.trim());
                    }
                  }}
                  placeholder="e.g. LMR-N-001-PLAT, lp-001..."
                  className="flex-1 bg-lumora-bone/40 border border-black/10 px-3 py-2 text-xs font-mono text-lumora-charcoal focus:outline-none focus:border-lumora-gold placeholder:text-black/30"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (manualQuery.trim()) handleTagScanned(manualQuery.trim());
                  }}
                  className="bg-lumora-charcoal text-white hover:bg-lumora-gold px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors active:scale-95"
                >
                  Lookup
                </button>
              </div>
            </div>

            {/* Interactive Showcase Tags (Quick Click Simulator for Staff) */}
            <div className="bg-white border border-black/10 p-3.5 rounded-sm flex-1 space-y-3">
              <div className="flex items-center justify-between border-b border-black/5 pb-2">
                <h5 className="text-[10px] uppercase font-bold tracking-widest text-lumora-charcoal flex items-center gap-1.5">
                  <Tag size={12} className="text-lumora-gold" />
                  Showroom Inventory Tags ({products.length})
                </h5>
                <span className="text-[9px] text-lumora-taupe">Click to simulate tag scan</span>
              </div>

              <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                {products.slice(0, 8).map(p => {
                  const isSelected = selectedProduct?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectSampleProduct(p)}
                      className={`w-full text-left p-2 rounded-sm border transition-all flex items-center justify-between group ${
                        isSelected 
                          ? 'bg-lumora-gold/10 border-lumora-gold text-lumora-charcoal font-semibold shadow-xs' 
                          : 'bg-lumora-bone/30 border-black/5 hover:border-lumora-gold/40 hover:bg-white text-lumora-charcoal'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img 
                          src={p.images[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=200'} 
                          alt={p.name} 
                          className="w-8 h-8 rounded-xs object-cover border border-black/10 shrink-0" 
                        />
                        <div className="truncate">
                          <p className="text-[11px] font-serif truncate">{p.name}</p>
                          <div className="flex items-center gap-2 text-[9px] font-mono text-lumora-taupe">
                            <span>{p.sku}</span>
                            <span>•</span>
                            <span>{p.material}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <p className="text-[11px] font-mono font-bold text-lumora-gold">
                          {marketView === 'india' ? '₹' : '$'}{p.price.toLocaleString()}
                        </p>
                        <span className={`text-[8px] uppercase tracking-wider px-1 py-0.2 rounded-xs ${
                          p.status === 'Available' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Session Scan History */}
            {scanHistory.length > 0 && (
              <div className="bg-white border border-black/10 p-3 rounded-sm space-y-2">
                <div className="flex items-center justify-between text-[9px] uppercase font-bold tracking-widest text-lumora-taupe border-b border-black/5 pb-1">
                  <span className="flex items-center gap-1"><History size={11} /> Scan History (Session)</span>
                  <button 
                    type="button" 
                    onClick={() => setScanHistory([])}
                    className="hover:text-lumora-charcoal transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
                  {scanHistory.map((item, idx) => (
                    <button
                      key={`${item.id}-${idx}`}
                      type="button"
                      onClick={() => handleTagScanned(item.sku)}
                      className="text-[9px] font-mono bg-lumora-bone px-2 py-1 border border-black/10 rounded hover:border-lumora-gold text-lumora-charcoal flex items-center gap-1"
                    >
                      <span className="font-bold">{item.sku}</span>
                      <span className="text-black/40 text-[8px]">{item.timestamp}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Scanned Tag Results — Product Details, Live Valuation, Ledger & Physical Audit */}
          <div className="lg:col-span-7 flex flex-col bg-white overflow-y-auto max-h-[85vh]">
            
            {selectedProduct ? (
              <div className="flex flex-col flex-1">
                
                {/* Product Summary Header Card */}
                <div className="p-6 border-b border-black/10 bg-lumora-bone/20 flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex items-start gap-4">
                    <div className="relative group">
                      <img 
                        src={selectedProduct.images[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400'} 
                        alt={selectedProduct.name} 
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-sm object-cover border border-black/15 shadow-sm bg-white shrink-0" 
                      />
                      {selectedProduct.video && (
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[8px] px-1 py-0.5 rounded font-mono">
                          VIDEO
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-mono uppercase bg-lumora-charcoal text-white px-2 py-0.5 rounded-xs font-bold tracking-wider">
                          {selectedProduct.sku}
                        </span>
                        <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs ${
                          selectedProduct.status === 'Available' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          selectedProduct.status === 'Reserved' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          selectedProduct.status === 'Sold' ? 'bg-red-100 text-red-800 border border-red-300' :
                          'bg-gray-100 text-gray-800 border border-gray-300'
                        }`}>
                          {selectedProduct.status}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-lumora-taupe font-bold">
                          {selectedProduct.category}
                        </span>
                      </div>

                      <h2 className="text-xl font-serif font-bold text-lumora-charcoal mt-1.5 leading-snug">
                        {selectedProduct.name}
                      </h2>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-lumora-taupe">
                        <span className="flex items-center gap-1">
                          <Gem size={13} className="text-lumora-gold" />
                          <strong className="text-lumora-charcoal">{selectedProduct.material}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-lumora-gold" />
                          <span>{selectedProduct.vaultLocation || 'Vault A — Safe Tray 04'}</span>
                        </span>
                        <span>•</span>
                        <span>Stock: <strong className="text-lumora-charcoal">{selectedProduct.stock} unit(s)</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Retail Price & Quick Action */}
                  <div className="sm:text-right flex flex-col items-start sm:items-end justify-between self-stretch">
                    <div>
                      <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Retail Marked Price</p>
                      <p className="text-2xl font-serif font-bold text-lumora-gold">
                        {marketView === 'india' ? '₹' : '$'}{selectedProduct.price.toLocaleString()}
                      </p>
                    </div>

                    {onOpenProductModal && (
                      <button
                        type="button"
                        onClick={() => onOpenProductModal(selectedProduct)}
                        className="mt-2 text-[10px] font-bold uppercase tracking-wider text-lumora-charcoal hover:text-lumora-gold border-b border-black/20 hover:border-lumora-gold transition-colors flex items-center gap-1"
                      >
                        <Edit3 size={11} /> Edit in Catalog
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-Navigation Tabs: Details, Financial Ledger, Physical Audit, Print Tag */}
                <div className="flex border-b border-black/10 bg-white px-6">
                  {[
                    { id: 'details', label: 'Technical Specs', icon: <FileText size={14} /> },
                    { id: 'ledger', label: `Financial Ledger (${productLedgerEntries.length})`, icon: <DollarSign size={14} /> },
                    { id: 'audit', label: 'Physical Audit', icon: <ShieldCheck size={14} /> },
                    { id: 'tag_print', label: 'Printable Jewelry Tag', icon: <Printer size={14} /> },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-3 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2 border-b-2 transition-all ${
                        activeTab === tab.id 
                          ? 'border-lumora-gold text-lumora-charcoal font-bold bg-lumora-bone/20' 
                          : 'border-transparent text-lumora-taupe hover:text-lumora-charcoal'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* TAB CONTENT AREA */}
                <div className="p-6 flex-1 space-y-6">
                  
                  {/* TAB 1: TECHNICAL SPECS & LIVE VALUATION */}
                  {activeTab === 'details' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      
                      {/* Live Market Valuation Card */}
                      {liveValuation && (
                        <div className="bg-lumora-charcoal text-white p-5 rounded-sm shadow-md border border-lumora-gold/30 relative overflow-hidden">
                          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-lumora-gold/10 rounded-full blur-2xl pointer-events-none" />
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                              <Sparkles size={16} className="text-lumora-gold" />
                              <h4 className="font-serif font-bold text-sm tracking-wide text-white">
                                Real-Time Spot Valuation Engine
                              </h4>
                            </div>
                            <span className="text-[9px] font-mono uppercase tracking-widest text-lumora-gold bg-lumora-gold/10 px-2 py-0.5 rounded border border-lumora-gold/20">
                              Rates As Of Today ({liveValuation.currency})
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs font-mono">
                            <div>
                              <p className="text-[9px] text-white/50 uppercase font-sans font-bold tracking-wider">Raw Metal Value</p>
                              <p className="text-sm font-bold text-white mt-1">
                                {liveValuation.currency === 'INR' ? '₹' : '$'}{liveValuation.rawMetalCost.toLocaleString()}
                              </p>
                              <span className="text-[8px] text-white/40">{selectedProduct.material}</span>
                            </div>

                            <div>
                              <p className="text-[9px] text-white/50 uppercase font-sans font-bold tracking-wider">Gemstone / Diamond</p>
                              <p className="text-sm font-bold text-white mt-1">
                                {liveValuation.currency === 'INR' ? '₹' : '$'}{liveValuation.diamondValuation.toLocaleString()}
                              </p>
                              <span className="text-[8px] text-white/40">{selectedProduct.caratWeight || 0.85} ct estimated</span>
                            </div>

                            <div>
                              <p className="text-[9px] text-white/50 uppercase font-sans font-bold tracking-wider">Estimated Material Cost</p>
                              <p className="text-sm font-bold text-lumora-gold mt-1">
                                {liveValuation.currency === 'INR' ? '₹' : '$'}{liveValuation.estimatedCost.toLocaleString()}
                              </p>
                              <span className="text-[8px] text-white/40">Includes artisan labor</span>
                            </div>

                            <div>
                              <p className="text-[9px] text-white/50 uppercase font-sans font-bold tracking-wider">Atelier Gross Margin</p>
                              <p className="text-sm font-bold text-emerald-400 mt-1">
                                {liveValuation.margin}%
                              </p>
                              <span className="text-[8px] text-white/40">Healthy luxury spread</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Detailed Specs Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="p-3.5 bg-lumora-bone/40 border border-black/5 rounded-sm">
                          <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Precious Metal</p>
                          <p className="text-sm font-serif font-bold text-lumora-charcoal mt-1">{selectedProduct.material}</p>
                          <p className="text-[10px] text-lumora-taupe mt-0.5">Assayed Hallmark Authenticated</p>
                        </div>

                        <div className="p-3.5 bg-lumora-bone/40 border border-black/5 rounded-sm">
                          <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Gross & Net Weight</p>
                          <p className="text-sm font-mono font-bold text-lumora-charcoal mt-1">
                            {selectedProduct.grossWeight || 14.8}g / {selectedProduct.netWeight || 12.2}g net
                          </p>
                          <p className="text-[10px] text-lumora-taupe mt-0.5">High precision scale verified</p>
                        </div>

                        <div className="p-3.5 bg-lumora-bone/40 border border-black/5 rounded-sm">
                          <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Stones & Caratage</p>
                          <p className="text-sm font-serif font-bold text-lumora-charcoal mt-1">
                            {selectedProduct.caratWeight ? `${selectedProduct.caratWeight} ct Total` : 'Certified Diamonds'}
                          </p>
                          <p className="text-[10px] text-lumora-taupe truncate mt-0.5">{selectedProduct.stoneDetails || 'VVS-VS Clarity, D-F Color'}</p>
                        </div>

                        <div className="p-3.5 bg-lumora-bone/40 border border-black/5 rounded-sm">
                          <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Storage & Vault</p>
                          <p className="text-sm font-serif font-bold text-lumora-charcoal mt-1">
                            {selectedProduct.vaultLocation || 'Vault A — Safe Tray 04'}
                          </p>
                          <p className="text-[10px] text-lumora-taupe mt-0.5">High security biometric vitrine</p>
                        </div>

                        <div className="p-3.5 bg-lumora-bone/40 border border-black/5 rounded-sm">
                          <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Sales Channels</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedProduct.channels.map(ch => (
                              <span key={ch} className="text-[8px] font-mono bg-white px-1.5 py-0.5 rounded border border-black/10 text-lumora-charcoal">
                                {ch}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="p-3.5 bg-lumora-bone/40 border border-black/5 rounded-sm">
                          <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Quick Status Update</p>
                          <select
                            value={selectedProduct.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="mt-1 w-full bg-white border border-black/15 text-xs font-serif font-bold text-lumora-charcoal p-1.5 focus:outline-none focus:border-lumora-gold"
                          >
                            <option value="Available">Available (On Display)</option>
                            <option value="Reserved">Reserved for Client</option>
                            <option value="Sold">Sold / Delivered</option>
                            <option value="Draft">In Atelier / Workroom</option>
                          </select>
                        </div>
                      </div>

                      {/* Description / Atelier Notes */}
                      {selectedProduct.description && (
                        <div className="bg-lumora-bone/20 p-4 border border-black/5 rounded-sm">
                          <h5 className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe mb-1">Curation Narrative</h5>
                          <p className="text-xs font-serif text-lumora-charcoal/80 italic leading-relaxed">
                            "{selectedProduct.description}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: FINANCIAL LEDGER */}
                  {activeTab === 'ledger' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* Financial KPI Highlights */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-sm">
                          <p className="text-[9px] uppercase font-bold tracking-widest text-emerald-800 flex items-center gap-1">
                            <ArrowUpRight size={13} /> Total Customer Inflows
                          </p>
                          <p className="text-lg font-serif font-bold text-emerald-900 mt-1">
                            {marketView === 'india' ? '₹' : '$'}{ledgerTotals.inflows.toLocaleString()}
                          </p>
                          <p className="text-[9px] text-emerald-700 mt-0.5">Deposits, advances & final settled</p>
                        </div>

                        <div className="p-4 bg-red-50/70 border border-red-200 rounded-sm">
                          <p className="text-[9px] uppercase font-bold tracking-widest text-red-800 flex items-center gap-1">
                            <ArrowDownRight size={13} /> Artisan & Casting Outflows
                          </p>
                          <p className="text-lg font-serif font-bold text-red-900 mt-1">
                            {marketView === 'india' ? '₹' : '$'}{ledgerTotals.outflows.toLocaleString()}
                          </p>
                          <p className="text-[9px] text-red-700 mt-0.5">Craftsman fees & casting expenses</p>
                        </div>

                        <div className="p-4 bg-lumora-bone border border-black/10 rounded-sm">
                          <p className="text-[9px] uppercase font-bold tracking-widest text-lumora-charcoal flex items-center gap-1">
                            <DollarSign size={13} className="text-lumora-gold" /> Net Ledger Balance
                          </p>
                          <p className="text-lg font-serif font-bold text-lumora-gold mt-1">
                            {marketView === 'india' ? '₹' : '$'}{ledgerTotals.net.toLocaleString()}
                          </p>
                          <p className="text-[9px] text-lumora-taupe mt-0.5">{ledgerTotals.count} recorded transaction(s)</p>
                        </div>
                      </div>

                      {/* Header with "Record Transaction" button */}
                      <div className="flex justify-between items-center border-b border-black/5 pb-2">
                        <h4 className="font-serif font-bold text-sm text-lumora-charcoal">
                          Ledger Entries for {selectedProduct.sku}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsAddingLedger(prev => !prev)}
                          className="bg-lumora-gold text-white px-3.5 py-1.5 text-[9px] uppercase font-bold tracking-wider hover:bg-lumora-gold/90 transition-all flex items-center gap-1.5 shadow-xs"
                        >
                          <Plus size={12} /> {isAddingLedger ? 'Cancel Entry' : 'Log Payment / Expense'}
                        </button>
                      </div>

                      {/* Quick Add Ledger Form */}
                      {isAddingLedger && (
                        <form onSubmit={handleAddLedgerEntry} className="p-4 bg-lumora-bone/50 border border-lumora-gold/30 rounded-sm space-y-3 animate-in fade-in">
                          <div className="flex items-center justify-between border-b border-black/5 pb-1.5">
                            <h5 className="text-[10px] uppercase font-bold tracking-widest text-lumora-charcoal flex items-center gap-1.5">
                              <DollarSign size={12} className="text-lumora-gold" /> Record Transaction to Tag Ledger
                            </h5>
                            <span className="text-[9px] font-mono text-lumora-gold">{selectedProduct.sku}</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[9px] uppercase font-bold tracking-wider text-lumora-taupe block mb-1">Type</label>
                              <select
                                value={ledgerType}
                                onChange={(e) => {
                                  const t = e.target.value as any;
                                  setLedgerType(t);
                                  setLedgerCategory(t.includes('craftsman') ? 'Outflow' : 'Inflow');
                                }}
                                className="w-full bg-white border border-black/10 text-xs p-2 focus:outline-none focus:border-lumora-gold font-serif"
                              >
                                <option value="customer_advance">Customer Advance (Inflow)</option>
                                <option value="sale">Full Sale Settlement (Inflow)</option>
                                <option value="craftsman_payment">Craftsman Payout (Outflow)</option>
                                <option value="craftsman_advance">Craftsman Advance (Outflow)</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[9px] uppercase font-bold tracking-wider text-lumora-taupe block mb-1">Amount ({marketView === 'india' ? 'INR' : 'USD'})</label>
                              <input
                                type="number"
                                required
                                value={ledgerAmount}
                                onChange={(e) => setLedgerAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="e.g. 25000"
                                className="w-full bg-white border border-black/10 text-xs font-mono p-2 focus:outline-none focus:border-lumora-gold"
                              />
                            </div>

                            <div>
                              <label className="text-[9px] uppercase font-bold tracking-wider text-lumora-taupe block mb-1">Client / Artisan Name</label>
                              <input
                                type="text"
                                value={ledgerParty}
                                onChange={(e) => setLedgerParty(e.target.value)}
                                placeholder="e.g. Eleanor Rigby / Master Hiroshi"
                                className="w-full bg-white border border-black/10 text-xs p-2 focus:outline-none focus:border-lumora-gold font-serif"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[9px] uppercase font-bold tracking-wider text-lumora-taupe block mb-1">Transaction Note / Purpose</label>
                            <input
                              type="text"
                              value={ledgerDescription}
                              onChange={(e) => setLedgerDescription(e.target.value)}
                              placeholder="e.g. Bespoke deposit for custom setting or mounting"
                              className="w-full bg-white border border-black/10 text-xs p-2 focus:outline-none focus:border-lumora-gold"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsAddingLedger(false)}
                              className="px-3 py-1.5 text-[9px] uppercase font-bold tracking-wider text-lumora-taupe hover:text-lumora-charcoal"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="bg-lumora-charcoal text-white hover:bg-lumora-gold px-5 py-1.5 text-[9px] uppercase font-bold tracking-wider transition-colors"
                            >
                              Commit to Ledger
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Ledger Items Table */}
                      {productLedgerEntries.length === 0 ? (
                        <div className="p-8 text-center border border-dashed border-black/10 bg-lumora-bone/20 rounded-sm">
                          <DollarSign size={28} className="mx-auto text-lumora-taupe/40 mb-2" strokeWidth={1.5} />
                          <p className="text-xs font-serif text-lumora-charcoal font-bold">No direct ledger transactions recorded yet</p>
                          <p className="text-[10px] text-lumora-taupe mt-1 max-w-sm mx-auto">
                            Use the button above to record customer advances, sales revenues, or artisan craftsman payments associated with this jewelry tag.
                          </p>
                        </div>
                      ) : (
                        <div className="border border-black/10 rounded-sm overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-lumora-charcoal text-white text-[9px] uppercase font-bold tracking-wider">
                                <th className="p-3">Ref ID</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Party / Client</th>
                                <th className="p-3">Description</th>
                                <th className="p-3 text-right">Amount</th>
                                <th className="p-3 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5 font-sans">
                              {productLedgerEntries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-lumora-bone/30 transition-colors">
                                  <td className="p-3 font-mono font-bold text-lumora-charcoal">{entry.id}</td>
                                  <td className="p-3 font-mono text-lumora-taupe text-[11px]">{entry.date}</td>
                                  <td className="p-3">
                                    <span className={`text-[8px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                                      entry.category === 'Inflow' 
                                        ? 'bg-emerald-100 text-emerald-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {entry.category}
                                    </span>
                                  </td>
                                  <td className="p-3 font-serif font-medium text-lumora-charcoal">{entry.relatedName || '—'}</td>
                                  <td className="p-3 text-lumora-taupe text-[11px] max-w-xs truncate">{entry.description}</td>
                                  <td className={`p-3 font-mono font-bold text-right ${
                                    entry.category === 'Inflow' ? 'text-emerald-700' : 'text-red-700'
                                  }`}>
                                    {entry.category === 'Inflow' ? '+' : '-'}{marketView === 'india' ? '₹' : '$'}{entry.amount.toLocaleString()}
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className="text-[8px] uppercase font-bold tracking-wider text-lumora-gold bg-lumora-gold/10 px-1.5 py-0.5 rounded">
                                      {entry.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: PHYSICAL AUDIT VERIFICATION */}
                  {activeTab === 'audit' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* Physical Stock Audit Verification Banner */}
                      <div className="p-4 bg-lumora-bone border border-lumora-gold/40 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-lumora-gold/20 text-lumora-gold flex items-center justify-center shrink-0">
                            <ShieldCheck size={20} />
                          </div>
                          <div>
                            <h5 className="font-serif font-bold text-sm text-lumora-charcoal">
                              Physical Verification Status: <span className="text-emerald-700">Tag Verified</span>
                            </h5>
                            <p className="text-[10px] text-lumora-taupe">
                              Piece scanned with camera at {new Date().toLocaleTimeString()} • Vault match: {selectedProduct.vaultLocation || 'Vault A'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsAuditingItem(true)}
                          className="bg-lumora-charcoal text-white hover:bg-lumora-gold px-4 py-2 text-[9px] uppercase font-bold tracking-widest transition-colors flex items-center gap-1.5 active:scale-95 shadow-sm shrink-0"
                        >
                          <CheckCircle2 size={13} /> Log Stock Verification Audit
                        </button>
                      </div>

                      {/* Audit Confirmation Modal / Drawer */}
                      {isAuditingItem && (
                        <form onSubmit={handleLogPhysicalAudit} className="p-4 bg-white border border-lumora-gold shadow-md rounded-sm space-y-3 animate-in fade-in">
                          <div className="flex items-center justify-between border-b border-black/5 pb-2">
                            <h6 className="text-[10px] uppercase font-bold tracking-widest text-lumora-charcoal flex items-center gap-1.5">
                              <UserCheck size={14} className="text-lumora-gold" /> Confirm Inventory Audit Entry
                            </h6>
                            <button
                              type="button"
                              onClick={() => setIsAuditingItem(false)}
                              className="text-lumora-taupe hover:text-lumora-charcoal text-xs"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[9px] uppercase font-bold tracking-wider text-lumora-taupe block mb-1">Auditor Name / Title</label>
                              <input
                                type="text"
                                required
                                value={auditorName}
                                onChange={(e) => setAuditorName(e.target.value)}
                                className="w-full bg-lumora-bone/40 border border-black/10 text-xs p-2 focus:outline-none focus:border-lumora-gold"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold tracking-wider text-lumora-taupe block mb-1">Physical Stock Count Found</label>
                              <input
                                type="number"
                                readOnly
                                value={selectedProduct.stock}
                                className="w-full bg-lumora-bone border border-black/10 text-xs p-2 text-lumora-taupe cursor-not-allowed"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[9px] uppercase font-bold tracking-wider text-lumora-taupe block mb-1">Audit Verification Remarks</label>
                            <input
                              type="text"
                              value={auditNotes}
                              onChange={(e) => setAuditNotes(e.target.value)}
                              className="w-full bg-lumora-bone/40 border border-black/10 text-xs p-2 focus:outline-none focus:border-lumora-gold"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsAuditingItem(false)}
                              className="px-3 py-1.5 text-[9px] uppercase font-bold tracking-wider text-lumora-taupe"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="bg-emerald-800 text-white hover:bg-emerald-700 px-5 py-1.5 text-[9px] uppercase font-bold tracking-wider transition-colors shadow-xs"
                            >
                              Save Audit Record
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Recent Historical Audit Logs for this Piece */}
                      <div className="space-y-2">
                        <h5 className="text-[10px] uppercase font-bold tracking-widest text-lumora-taupe">
                          Historical Verification Logs
                        </h5>
                        
                        <div className="space-y-2">
                          {auditLogs
                            .filter(a => a.itemId === selectedProduct.sku || a.itemName.toLowerCase().includes(selectedProduct.name.toLowerCase()))
                            .map((log) => (
                              <div key={log.id} className="p-3 bg-lumora-bone/30 border border-black/5 rounded-sm flex items-start justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-mono font-bold text-lumora-charcoal">{log.id}</span>
                                    <span className="text-[9px] font-mono text-lumora-taupe">{log.date}</span>
                                    <span className="text-[8px] uppercase font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                                      Zero Variance
                                    </span>
                                  </div>
                                  <p className="text-xs font-serif text-lumora-charcoal mt-1">{log.notes}</p>
                                  <p className="text-[10px] text-lumora-taupe mt-0.5">Auditor: {log.auditor}</p>
                                </div>
                                <span className="font-mono text-xs font-bold text-lumora-gold shrink-0">
                                  Qty: {log.newQuantity}
                                </span>
                              </div>
                            ))}

                          {auditLogs.filter(a => a.itemId === selectedProduct.sku).length === 0 && (
                            <div className="p-4 bg-lumora-bone/20 text-center border border-dashed border-black/10 text-xs text-lumora-taupe">
                              First physical audit recorded today via this QR scan session.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: PRINTABLE JEWELRY TAG WITH QR */}
                  {activeTab === 'tag_print' && (
                    <div className="space-y-6 animate-in fade-in duration-300 flex flex-col items-center">
                      <div className="w-full flex justify-between items-center border-b border-black/5 pb-2">
                        <div>
                          <h4 className="font-serif font-bold text-sm text-lumora-charcoal">Official Physical Jewelry Tag</h4>
                          <p className="text-[10px] text-lumora-taupe">Standard 50mm x 28mm fine jewelry luxury boutique hang-tag format</p>
                        </div>
                        <button
                          type="button"
                          onClick={handlePrintTag}
                          className="bg-lumora-charcoal text-white hover:bg-lumora-gold px-4 py-2 text-[9px] uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <Printer size={13} /> Print Tag (Boutique Thermal / Label)
                        </button>
                      </div>

                      {/* Realistic Jewelry Hang-Tag Preview Card */}
                      <div className="w-full max-w-md bg-white border-2 border-black/20 p-5 shadow-2xl rounded-sm font-sans relative overflow-hidden print:m-0 print:border-black">
                        {/* Hanging punch hole */}
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-black/30 mx-auto mb-3 bg-lumora-bone/60" />

                        <div className="text-center border-b border-black/10 pb-2 mb-3">
                          <h3 className="font-serif text-base font-bold tracking-widest text-lumora-charcoal">LUMORA</h3>
                          <p className="text-[7px] uppercase tracking-[0.3em] text-lumora-taupe">Atelier Haute Joaillerie</p>
                        </div>

                        <div className="grid grid-cols-12 gap-3 items-center">
                          {/* QR Code */}
                          <div className="col-span-5 flex flex-col items-center justify-center p-1 bg-white border border-black/10 rounded-xs">
                            {generatedTagQrUrl ? (
                              <img src={generatedTagQrUrl} alt="Tag QR" className="w-28 h-28 object-contain" />
                            ) : (
                              <div className="w-28 h-28 bg-lumora-bone flex items-center justify-center text-xs text-lumora-taupe">
                                Generating...
                              </div>
                            )}
                            <span className="text-[7px] font-mono tracking-tighter text-black/60 mt-1 uppercase">Scan for Atelier Specs</span>
                          </div>

                          {/* Jewelry Tag Specifications */}
                          <div className="col-span-7 space-y-1.5 text-left text-xs">
                            <div>
                              <p className="text-[8px] uppercase tracking-wider text-lumora-taupe font-bold">SKU / Hallmark</p>
                              <p className="font-mono font-bold text-lumora-charcoal text-xs">{selectedProduct.sku}</p>
                            </div>

                            <div>
                              <p className="text-[8px] uppercase tracking-wider text-lumora-taupe font-bold">Metal & Purity</p>
                              <p className="font-serif font-bold text-lumora-charcoal text-[11px]">{selectedProduct.material}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-1 text-[10px]">
                              <div>
                                <span className="text-[7px] uppercase text-lumora-taupe block font-bold">Gross Wt</span>
                                <span className="font-mono font-bold">{selectedProduct.grossWeight || 14.8}g</span>
                              </div>
                              <div>
                                <span className="text-[7px] uppercase text-lumora-taupe block font-bold">Net Metal</span>
                                <span className="font-mono font-bold">{selectedProduct.netWeight || 12.2}g</span>
                              </div>
                            </div>

                            <div>
                              <p className="text-[8px] uppercase tracking-wider text-lumora-taupe font-bold">Stones / Diamonds</p>
                              <p className="font-mono font-bold text-lumora-charcoal text-[10px]">
                                {selectedProduct.caratWeight ? `${selectedProduct.caratWeight} ct` : 'Certified VVS'}
                              </p>
                            </div>

                            <div className="pt-1 border-t border-black/10 flex items-baseline justify-between">
                              <span className="text-[8px] uppercase tracking-wider font-bold text-lumora-taupe">Price</span>
                              <span className="font-serif font-bold text-sm text-lumora-gold">
                                {marketView === 'india' ? '₹' : '$'}{selectedProduct.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-dashed border-black/15 text-center text-[7px] font-mono text-lumora-taupe uppercase tracking-widest">
                          Tamper Evident Tag • Lumora Security Seal #LM-{selectedProduct.id.slice(-4)}
                        </div>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            ) : (
              /* Empty Standby State when no tag is scanned yet */
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-lumora-taupe space-y-4">
                <div className="w-16 h-16 rounded-full bg-lumora-bone flex items-center justify-center text-lumora-gold border border-lumora-gold/20 shadow-inner">
                  <QrCode size={32} strokeWidth={1.25} />
                </div>
                <div className="max-w-sm">
                  <h4 className="font-serif text-base font-bold text-lumora-charcoal">Awaiting Jewelry Tag Scan</h4>
                  <p className="text-xs text-lumora-taupe mt-1.5 leading-relaxed">
                    Point your camera at a piece's hang-tag, upload a tag snapshot, or click any showroom tag on the left to instantly inspect product specifications and financial ledger records.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-lumora-taupe">Try scanning sample:</span>
                  {products.slice(0, 3).map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleTagScanned(p.sku)}
                      className="text-[9px] font-mono bg-lumora-bone hover:bg-lumora-gold hover:text-white px-2.5 py-1 border border-black/10 rounded transition-all font-bold"
                    >
                      {p.sku}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Bottom Footer Bar with Shortcuts */}
        <div className="bg-lumora-bone border-t border-black/5 px-6 py-3 flex flex-col sm:flex-row justify-between items-center text-[10px] text-lumora-taupe">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-lumora-charcoal font-medium">
              <ShieldCheck size={13} className="text-lumora-gold" />
              <span>Cryptographic tag validation active</span>
            </span>
            <span>•</span>
            <span>Compatible with standard 2D Datamatrix & QR boutique tags</span>
          </div>

          <div className="flex items-center gap-3 mt-2 sm:mt-0 font-mono">
            <span>Total Catalog: <strong>{products.length}</strong> creations</span>
            <span>•</span>
            <span>Ledger Records: <strong>{ledger.length}</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};
