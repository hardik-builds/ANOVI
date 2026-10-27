import React, { useState } from 'react';
import { 
  Coins, 
  Gem, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Save, 
  RefreshCw, 
  Printer, 
  Calendar, 
  Calculator, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  Sliders,
  Scale,
  X
} from 'lucide-react';
import { MetalRatesState, MarketDailyRates } from './types';

interface DailyRatesMasterProps {
  rates: MetalRatesState;
  marketView: 'india' | 'global';
  onMarketViewChange: (market: 'india' | 'global') => void;
  onSaveRates: (updatedRates: MetalRatesState) => void;
  onOpenCalculator?: () => void;
}

export const DailyRatesMaster: React.FC<DailyRatesMasterProps> = ({
  rates,
  marketView,
  onMarketViewChange,
  onSaveRates,
  onOpenCalculator
}) => {
  const [currentMarket, setCurrentMarket] = useState<'india' | 'global'>(marketView);
  const [effectiveDate, setEffectiveDate] = useState<string>(
    rates.effectiveDate || new Date().toISOString().split('T')[0]
  );
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>(rates.trend || 'stable');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'gold' | 'silver' | 'platinum_titanium' | 'diamonds'>('all');

  // Working state copy for editing
  const [marketRates, setMarketRates] = useState<Record<'india' | 'global', MarketDailyRates>>({
    india: {
      currency: 'INR',
      unit: 'g',
      gold: {
        '24k': rates.india?.gold?.['24k'] || 7819.36,
        '22k': rates.india?.gold?.['22k'] || 7167.75,
        '20k': rates.india?.gold?.['20k'] || 6516.13,
        '18k': rates.india?.gold?.['18k'] || 5864.52,
        '14k': rates.india?.gold?.['14k'] || 4561.29,
        '9k': rates.india?.gold?.['9k'] || 2932.26,
      },
      silver: {
        '99.99': rates.india?.silver?.['99.99'] || 93.15,
        '92.5': rates.india?.silver?.['92.5'] || 86.16,
        '80.0': rates.india?.silver?.['80.0'] || 74.52,
      },
      platinum: {
        'Pt950': rates.india?.platinum?.['Pt950'] || 3850,
        'Pt900': rates.india?.platinum?.['Pt900'] || 3550,
        'Pt850': rates.india?.platinum?.['Pt850'] || 3320,
      },
      titanium: {
        'Grade5': rates.india?.titanium?.['Grade5'] || 145,
        'CP2': rates.india?.titanium?.['CP2'] || 95,
      },
      diamond: {
        baseCaratRate: rates.india?.diamond?.baseCaratRate || 95000,
        melee: rates.india?.diamond?.melee || 45000,
        pointers: rates.india?.diamond?.pointers || 72000,
        halves: rates.india?.diamond?.halves || 110000,
        solitaire1ct: rates.india?.diamond?.solitaire1ct || 175000,
        solitaire2ct: rates.india?.diamond?.solitaire2ct || 390000,
        vvsDef: rates.india?.diamond?.vvsDef || 165000,
        vsGh: rates.india?.diamond?.vsGh || 105000,
        siIj: rates.india?.diamond?.siIj || 68000,
        labGrownSolitaire: rates.india?.diamond?.labGrownSolitaire || 28000,
        labGrownMelee: rates.india?.diamond?.labGrownMelee || 14000,
      },
      gemstones: {
        naturalEmerald: rates.india?.gemstones?.naturalEmerald || 28000,
        naturalRuby: rates.india?.gemstones?.naturalRuby || 24000,
        naturalSapphire: rates.india?.gemstones?.naturalSapphire || 26000,
      }
    },
    global: {
      currency: 'USD',
      unit: 'g',
      gold: {
        '24k': rates.global?.gold?.['24k'] || 82.40,
        '22k': rates.global?.gold?.['22k'] || 75.54,
        '20k': rates.global?.gold?.['20k'] || 70.42,
        '18k': rates.global?.gold?.['18k'] || 61.80,
        '14k': rates.global?.gold?.['14k'] || 48.06,
        '9k': rates.global?.gold?.['9k'] || 30.90,
      },
      silver: {
        '99.99': rates.global?.silver?.['99.99'] || 3.10,
        '92.5': rates.global?.silver?.['92.5'] || 2.86,
        '80.0': rates.global?.silver?.['80.0'] || 2.48,
      },
      platinum: {
        'Pt950': rates.global?.platinum?.['Pt950'] || 42.50,
        'Pt900': rates.global?.platinum?.['Pt900'] || 39.20,
        'Pt850': rates.global?.platinum?.['Pt850'] || 36.80,
      },
      titanium: {
        'Grade5': rates.global?.titanium?.['Grade5'] || 1.65,
        'CP2': rates.global?.titanium?.['CP2'] || 1.10,
      },
      diamond: {
        baseCaratRate: rates.global?.diamond?.baseCaratRate || 1150,
        melee: rates.global?.diamond?.melee || 550,
        pointers: rates.global?.diamond?.pointers || 880,
        halves: rates.global?.diamond?.halves || 1350,
        solitaire1ct: rates.global?.diamond?.solitaire1ct || 2150,
        solitaire2ct: rates.global?.diamond?.solitaire2ct || 4800,
        vvsDef: rates.global?.diamond?.vvsDef || 1950,
        vsGh: rates.global?.diamond?.vsGh || 1250,
        siIj: rates.global?.diamond?.siIj || 820,
        labGrownSolitaire: rates.global?.diamond?.labGrownSolitaire || 340,
        labGrownMelee: rates.global?.diamond?.labGrownMelee || 165,
      },
      gemstones: {
        naturalEmerald: rates.global?.gemstones?.naturalEmerald || 350,
        naturalRuby: rates.global?.gemstones?.naturalRuby || 300,
        naturalSapphire: rates.global?.gemstones?.naturalSapphire || 320,
      }
    }
  });

  const curr = marketRates[currentMarket];
  const symbol = currentMarket === 'india' ? '₹' : '$';

  // Instant simulator state
  const [simMetal, setSimMetal] = useState<'gold_18k' | 'gold_22k' | 'platinum' | 'silver' | 'titanium'>('gold_18k');
  const [simWeight, setSimWeight] = useState<number>(12.5);
  const [simDiamondTier, setSimDiamondTier] = useState<keyof typeof curr.diamond>('vsGh');
  const [simDiamondWeight, setSimDiamondWeight] = useState<number>(1.25);
  const [simMakingPerGram, setSimMakingPerGram] = useState<number>(currentMarket === 'india' ? 850 : 25);

  const handleGoldChange = (caratage: keyof typeof curr.gold, val: number) => {
    setMarketRates(prev => ({
      ...prev,
      [currentMarket]: {
        ...prev[currentMarket],
        gold: {
          ...prev[currentMarket].gold,
          [caratage]: val
        }
      }
    }));
  };

  const handleAutoCalcGold = (base24k: number) => {
    const b = Number(base24k) || 0;
    setMarketRates(prev => ({
      ...prev,
      [currentMarket]: {
        ...prev[currentMarket],
        gold: {
          '24k': b,
          '22k': Number((b * 22 / 24).toFixed(2)),
          '20k': Number((b * 20 / 24).toFixed(2)),
          '18k': Number((b * 18 / 24).toFixed(2)),
          '14k': Number((b * 14 / 24).toFixed(2)),
          '9k': Number((b * 9 / 24).toFixed(2)),
        }
      }
    }));
  };

  const handleSilverChange = (purity: keyof typeof curr.silver, val: number) => {
    setMarketRates(prev => ({
      ...prev,
      [currentMarket]: {
        ...prev[currentMarket],
        silver: {
          ...prev[currentMarket].silver,
          [purity]: val
        }
      }
    }));
  };

  const handleAutoCalcSilver = (fine999: number) => {
    const s = Number(fine999) || 0;
    setMarketRates(prev => ({
      ...prev,
      [currentMarket]: {
        ...prev[currentMarket],
        silver: {
          '99.99': s,
          '92.5': Number((s * 0.925).toFixed(2)),
          '80.0': Number((s * 0.80).toFixed(2)),
        }
      }
    }));
  };

  const handlePlatinumChange = (purity: keyof typeof curr.platinum, val: number) => {
    setMarketRates(prev => ({
      ...prev,
      [currentMarket]: {
        ...prev[currentMarket],
        platinum: {
          ...prev[currentMarket].platinum,
          [purity]: val
        }
      }
    }));
  };

  const handleTitaniumChange = (grade: keyof typeof curr.titanium, val: number) => {
    setMarketRates(prev => ({
      ...prev,
      [currentMarket]: {
        ...prev[currentMarket],
        titanium: {
          ...prev[currentMarket].titanium,
          [grade]: val
        }
      }
    }));
  };

  const handleDiamondChange = (tier: keyof typeof curr.diamond, val: number) => {
    setMarketRates(prev => ({
      ...prev,
      [currentMarket]: {
        ...prev[currentMarket],
        diamond: {
          ...prev[currentMarket].diamond,
          [tier]: val
        }
      }
    }));
  };

  const handleSaveAll = () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const finalState: MetalRatesState = {
      india: marketRates.india,
      global: marketRates.global,
      effectiveDate,
      lastUpdated: `${effectiveDate} ${timestamp}`,
      trend,
      notes: `Official atelier fixing updated for ${effectiveDate}`
    };

    onSaveRates(finalState);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // Simulator calculations
  let simMetalRatePerGram = curr.gold['18k'];
  if (simMetal === 'gold_22k') simMetalRatePerGram = curr.gold['22k'];
  if (simMetal === 'platinum') simMetalRatePerGram = curr.platinum['Pt950'];
  if (simMetal === 'silver') simMetalRatePerGram = curr.silver['92.5'];
  if (simMetal === 'titanium') simMetalRatePerGram = curr.titanium['Grade5'];

  const simRawMetalCost = simWeight * simMetalRatePerGram;
  const simDiamondRatePerCt = curr.diamond[simDiamondTier] || curr.diamond.vsGh;
  const simRawDiamondCost = simDiamondWeight * simDiamondRatePerCt;
  const simLaborCost = simWeight * simMakingPerGram;
  const simTotalEstimatedCost = simRawMetalCost + simRawDiamondCost + simLaborCost;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Header Card */}
      <div className="bg-white border border-black/[0.06] p-6 sm:p-8 rounded-sm shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-lumora-charcoal text-lumora-gold flex items-center justify-center shadow-inner">
                <Coins size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-lumora-charcoal">
                    Daily Rates Master
                  </h3>
                  <span className="text-[9px] uppercase tracking-widest font-mono bg-lumora-gold/15 text-lumora-gold px-2.5 py-0.5 rounded-sm font-bold">
                    Official Fixing
                  </span>
                </div>
                <p className="text-[10px] text-lumora-taupe uppercase tracking-widest font-bold mt-0.5">
                  Set daily spot valuations for Gold, Silver, Platinum, Titanium & Diamond per carat
                </p>
              </div>
            </div>
          </div>

          {/* Quick Context & Market Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Market View Toggle */}
            <div className="inline-flex rounded-sm p-1 bg-lumora-bone border border-black/10">
              <button
                type="button"
                onClick={() => {
                  setCurrentMarket('india');
                  onMarketViewChange('india');
                }}
                className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-xs transition-all ${
                  currentMarket === 'india'
                    ? 'bg-lumora-charcoal text-white shadow-xs'
                    : 'text-lumora-taupe hover:text-lumora-charcoal'
                }`}
              >
                🇮🇳 India (INR ₹)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentMarket('global');
                  onMarketViewChange('global');
                }}
                className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-xs transition-all ${
                  currentMarket === 'global'
                    ? 'bg-lumora-charcoal text-white shadow-xs'
                    : 'text-lumora-taupe hover:text-lumora-charcoal'
                }`}
              >
                🌐 Global (USD $)
              </button>
            </div>

            {/* Effective Date Picker */}
            <div className="flex items-center gap-1.5 bg-lumora-bone border border-black/10 px-3 py-1.5 rounded-sm">
              <Calendar size={13} className="text-lumora-taupe" />
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="bg-transparent text-[10px] font-mono font-bold text-lumora-charcoal focus:outline-none"
              />
            </div>

            {/* Trend Indicator */}
            <div className="flex items-center gap-1 bg-lumora-bone border border-black/10 px-2.5 py-1 rounded-sm">
              <span className="text-[8px] uppercase tracking-wider font-bold text-lumora-taupe mr-1">Trend:</span>
              <button
                type="button"
                onClick={() => setTrend('up')}
                className={`p-1 rounded-xs ${trend === 'up' ? 'bg-emerald-100 text-emerald-800' : 'text-stone-400 hover:text-emerald-700'}`}
                title="Bullish / Up"
              >
                <TrendingUp size={13} />
              </button>
              <button
                type="button"
                onClick={() => setTrend('stable')}
                className={`p-1 rounded-xs ${trend === 'stable' ? 'bg-amber-100 text-amber-800' : 'text-stone-400 hover:text-amber-700'}`}
                title="Stable / Neutral"
              >
                <Minus size={13} />
              </button>
              <button
                type="button"
                onClick={() => setTrend('down')}
                className={`p-1 rounded-xs ${trend === 'down' ? 'bg-rose-100 text-rose-800' : 'text-stone-400 hover:text-rose-700'}`}
                title="Bearish / Down"
              >
                <TrendingDown size={13} />
              </button>
            </div>

            {/* Print Rate Card */}
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="px-3 py-2 bg-white border border-black/15 hover:border-black/30 text-lumora-charcoal text-[9px] font-bold uppercase tracking-wider rounded-sm transition-all flex items-center gap-1.5"
              title="Open printable showroom rate card"
            >
              <Printer size={13} /> Rate Card
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveAll}
              className={`px-5 py-2 text-[9px] font-bold uppercase tracking-[0.2em] rounded-sm transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                saveSuccess
                  ? 'bg-emerald-700 text-white'
                  : 'bg-lumora-gold hover:bg-lumora-gold/90 text-white'
              }`}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 size={13} /> Rates Broadcasted!
                </>
              ) : (
                <>
                  <Save size={13} /> Save Today's Rates
                </>
              )}
            </button>
          </div>
        </div>

        {/* Informative notification strip */}
        <div className="mt-5 pt-4 border-t border-black/[0.04] flex flex-wrap items-center justify-between gap-3 text-[10px] text-lumora-taupe">
          <div className="flex items-center gap-4 font-mono">
            <span>Market: <strong className="text-lumora-charcoal uppercase">{currentMarket} ({curr.currency})</strong></span>
            <span>•</span>
            <span>Effective Date: <strong className="text-lumora-charcoal">{effectiveDate}</strong></span>
            <span>•</span>
            <span>Last Updated: <strong className="text-lumora-charcoal">{rates.lastUpdated || 'Today'}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase font-bold text-lumora-gold flex items-center gap-1">
              <Sparkles size={11} /> Synchronized with Pricing Calculator & Bespoke Orders
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Filter Tabs for Quick Navigation */}
      <div className="flex items-center gap-2 border-b border-black/[0.06] pb-3 overflow-x-auto">
        {[
          { id: 'all', label: 'All Rates Master' },
          { id: 'gold', label: 'Gold Caratages (24K - 9K)' },
          { id: 'silver', label: 'Silver Purities (999 - 925)' },
          { id: 'platinum_titanium', label: 'Platinum & Titanium' },
          { id: 'diamonds', label: 'Diamond Per Carat Rates' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-1.5 text-[9px] uppercase font-bold tracking-wider rounded-xs whitespace-nowrap transition-all ${
              activeSubTab === tab.id
                ? 'bg-lumora-charcoal text-white font-bold'
                : 'bg-white text-lumora-taupe border border-black/10 hover:text-lumora-charcoal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: PRECIOUS METALS & DIAMONDS (Col 8) */}
        <div className="lg:col-span-8 space-y-8">

          {/* 1. GOLD SECTION */}
          {(activeSubTab === 'all' || activeSubTab === 'gold') && (
            <div className="bg-white border border-black/[0.06] rounded-sm p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xs bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                    <Scale size={16} />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-lumora-charcoal">
                      Gold Daily Caratage Rates
                    </h4>
                    <p className="text-[9px] uppercase tracking-wider text-lumora-taupe font-bold">
                      Bullion spot values across standard caratages
                    </p>
                  </div>
                </div>

                {/* Auto-calculate helper */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAutoCalcGold(curr.gold['24k'])}
                    className="px-3 py-1 text-[9px] uppercase font-bold tracking-wider text-lumora-gold bg-lumora-gold/10 hover:bg-lumora-gold/20 rounded-xs border border-lumora-gold/30 transition-colors flex items-center gap-1"
                    title="Recalculate 22k, 20k, 18k, 14k, 9k proportionally from 24K"
                  >
                    <RefreshCw size={10} /> Auto-Compute Purities
                  </button>
                </div>
              </div>

              {/* 24K Primary Hero Input */}
              <div className="p-4 bg-lumora-bone/40 border border-lumora-gold/30 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[8px] uppercase tracking-widest font-mono font-bold text-lumora-gold">
                    Fine Bullion Benchmark (999 Pure)
                  </span>
                  <h5 className="font-serif font-bold text-sm text-lumora-charcoal">
                    24 Karat Pure Gold Rate (per gram)
                  </h5>
                  <p className="text-[9px] text-lumora-taupe">
                    {currentMarket === 'india' 
                      ? `10g / 1 Tola Bar: ${symbol}${(curr.gold['24k'] * 10).toLocaleString('en-IN')}` 
                      : `1 Troy Ounce: ${symbol}${(curr.gold['24k'] * 31.1035).toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-44">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-lumora-taupe">
                      {symbol}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={curr.gold['24k']}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        handleGoldChange('24k', val);
                      }}
                      className="w-full pl-7 pr-3 py-2 bg-white border border-lumora-gold text-sm font-mono font-bold text-lumora-charcoal rounded-sm focus:outline-none focus:ring-1 focus:ring-lumora-gold"
                    />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-lumora-taupe font-mono">/ {curr.unit}</span>
                </div>
              </div>

              {/* Individual Caratages Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: '22k' as const, label: '22 Karat (916 Hallmark)', purity: '91.67%', desc: 'Bridal & High-Karat Classic' },
                  { key: '20k' as const, label: '20 Karat (833 Traditional)', purity: '83.33%', desc: 'Heritage Filigree Work' },
                  { key: '18k' as const, label: '18 Karat (750 Luxury)', purity: '75.00%', desc: 'Lumora Signature Diamond Setting' },
                  { key: '14k' as const, label: '14 Karat (585 Modern)', purity: '58.33%', desc: 'Durable Everyday Fine Jewelry' },
                  { key: '9k' as const, label: '9 Karat (375 Entry)', purity: '37.50%', desc: 'Contemporary Demi-Fine' }
                ].map(item => (
                  <div key={item.key} className="p-3.5 bg-white border border-black/10 rounded-sm space-y-2 hover:border-black/25 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-lumora-charcoal block">{item.label}</span>
                        <span className="text-[8px] text-lumora-taupe font-mono">Purity: {item.purity}</span>
                      </div>
                      <span className="text-[8px] font-mono uppercase bg-lumora-bone px-1.5 py-0.5 rounded-xs font-bold text-lumora-charcoal">
                        {item.key}
                      </span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-lumora-taupe">
                        {symbol}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={curr.gold[item.key]}
                        onChange={(e) => handleGoldChange(item.key, parseFloat(e.target.value) || 0)}
                        className="w-full pl-6 pr-2 py-1.5 bg-lumora-bone/30 border border-black/15 text-xs font-mono font-bold text-lumora-charcoal rounded-sm focus:outline-none focus:border-lumora-gold"
                      />
                    </div>
                    <p className="text-[8px] text-lumora-taupe truncate">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. SILVER SECTION */}
          {(activeSubTab === 'all' || activeSubTab === 'silver') && (
            <div className="bg-white border border-black/[0.06] rounded-sm p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xs bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                    <Coins size={16} />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-lumora-charcoal">
                      Silver Daily Rates
                    </h4>
                    <p className="text-[9px] uppercase tracking-wider text-lumora-taupe font-bold">
                      Fine 999 bullion and 925 sterling silver
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAutoCalcSilver(curr.silver['99.99'])}
                  className="px-3 py-1 text-[9px] uppercase font-bold tracking-wider text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xs border border-slate-300 transition-colors flex items-center gap-1"
                  title="Recalculate Sterling 925 from 99.99 Fine Silver"
                >
                  <RefreshCw size={10} /> Auto-Compute 925
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-lumora-bone/40 border border-black/10 rounded-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase font-bold text-lumora-charcoal">Fine Silver (99.99% / 999)</span>
                    <span className="text-[8px] font-mono bg-white px-1.5 py-0.5 rounded-xs border border-black/10 font-bold">Bullion</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-lumora-taupe">{symbol}</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={curr.silver['99.99']}
                      onChange={(e) => handleSilverChange('99.99', parseFloat(e.target.value) || 0)}
                      className="w-full pl-6 pr-2 py-2 bg-white border border-black/15 text-xs font-mono font-bold text-lumora-charcoal rounded-sm focus:outline-none focus:border-lumora-gold"
                    />
                  </div>
                  <span className="text-[8px] text-lumora-taupe block font-mono">
                    {currentMarket === 'india' ? `1 Kg Bar: ${symbol}${(curr.silver['99.99'] * 1000).toLocaleString('en-IN')}` : `Per oz: ${symbol}${(curr.silver['99.99'] * 31.1035).toFixed(2)}`}
                  </span>
                </div>

                <div className="p-4 bg-white border border-black/10 rounded-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase font-bold text-lumora-charcoal">Sterling Silver (92.5%)</span>
                    <span className="text-[8px] font-mono bg-lumora-bone px-1.5 py-0.5 rounded-xs font-bold">925 Hallmark</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-lumora-taupe">{symbol}</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={curr.silver['92.5']}
                      onChange={(e) => handleSilverChange('92.5', parseFloat(e.target.value) || 0)}
                      className="w-full pl-6 pr-2 py-2 bg-white border border-black/15 text-xs font-mono font-bold text-lumora-charcoal rounded-sm focus:outline-none focus:border-lumora-gold"
                    />
                  </div>
                  <span className="text-[8px] text-lumora-taupe block">Standard for sterling silversmithing</span>
                </div>

                <div className="p-4 bg-white border border-black/10 rounded-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase font-bold text-lumora-charcoal">Coin Silver (80.0%)</span>
                    <span className="text-[8px] font-mono bg-lumora-bone px-1.5 py-0.5 rounded-xs font-bold">800 Grade</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-lumora-taupe">{symbol}</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={curr.silver['80.0'] || 0}
                      onChange={(e) => handleSilverChange('80.0' as any, parseFloat(e.target.value) || 0)}
                      className="w-full pl-6 pr-2 py-2 bg-white border border-black/15 text-xs font-mono font-bold text-lumora-charcoal rounded-sm focus:outline-none focus:border-lumora-gold"
                    />
                  </div>
                  <span className="text-[8px] text-lumora-taupe block">Utensils & ceremonial silverware</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. PLATINUM & TITANIUM SECTION */}
          {(activeSubTab === 'all' || activeSubTab === 'platinum_titanium') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* PLATINUM CARD */}
              <div className="bg-white border border-black/[0.06] rounded-sm p-6 space-y-5 shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-black/[0.06] pb-3">
                  <div className="w-8 h-8 rounded-xs bg-stone-100 text-stone-700 flex items-center justify-center border border-stone-200">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-lumora-charcoal">
                      Platinum Rates (Pt 950 / Pt 900)
                    </h4>
                    <p className="text-[8px] uppercase tracking-wider text-lumora-taupe font-bold">
                      Prestige dense white noble metal
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-lumora-bone/30 border border-black/10 rounded-sm space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-bold text-lumora-charcoal">Platinum 950 (Pt950)</span>
                      <span className="text-[8px] font-mono bg-lumora-gold/15 text-lumora-gold font-bold px-1.5 py-0.5 rounded-xs">95% Pure</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-lumora-taupe">{symbol}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={curr.platinum['Pt950']}
                        onChange={(e) => handlePlatinumChange('Pt950', parseFloat(e.target.value) || 0)}
                        className="w-full pl-6 pr-2 py-1.5 bg-white border border-black/15 text-xs font-mono font-bold text-lumora-charcoal rounded-sm focus:outline-none focus:border-lumora-gold"
                      />
                    </div>
                    <span className="text-[8px] text-lumora-taupe block font-mono">
                      {currentMarket === 'india' ? 'Standard luxury bridal tier' : 'Per gram'}
                    </span>
                  </div>

                  <div className="p-3 bg-white border border-black/10 rounded-sm space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-bold text-lumora-charcoal">Platinum 900 (Pt900)</span>
                      <span className="text-[8px] font-mono text-lumora-taupe font-bold">90% Pure</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-lumora-taupe">{symbol}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={curr.platinum['Pt900']}
                        onChange={(e) => handlePlatinumChange('Pt900', parseFloat(e.target.value) || 0)}
                        className="w-full pl-6 pr-2 py-1.5 bg-white border border-black/15 text-xs font-mono font-bold text-lumora-charcoal rounded-sm focus:outline-none focus:border-lumora-gold"
                      />
                    </div>
                    <span className="text-[8px] text-lumora-taupe block font-mono">Precision setting platinum</span>
                  </div>
                </div>
              </div>

              {/* TITANIUM CARD */}
              <div className="bg-white border border-black/[0.06] rounded-sm p-6 space-y-5 shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-black/[0.06] pb-3">
                  <div className="w-8 h-8 rounded-xs bg-zinc-100 text-zinc-700 flex items-center justify-center border border-zinc-200">
                    <Layers size={16} />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-lumora-charcoal">
                      Titanium Daily Values
                    </h4>
                    <p className="text-[8px] uppercase tracking-wider text-lumora-taupe font-bold">
                      Grade 5 Horology & Avant-Garde Jewelry
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-lumora-bone/30 border border-black/10 rounded-sm space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-bold text-lumora-charcoal">Grade 5 Titanium (Ti-6Al-4V)</span>
                      <span className="text-[8px] font-mono bg-zinc-200 text-zinc-800 font-bold px-1.5 py-0.5 rounded-xs">High-Tech</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-lumora-taupe">{symbol}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={curr.titanium['Grade5']}
                        onChange={(e) => handleTitaniumChange('Grade5', parseFloat(e.target.value) || 0)}
                        className="w-full pl-6 pr-2 py-1.5 bg-white border border-black/15 text-xs font-mono font-bold text-lumora-charcoal rounded-sm focus:outline-none focus:border-lumora-gold"
                      />
                    </div>
                    <span className="text-[8px] text-lumora-taupe block font-mono">Rate per gram (high-strength, ultra-light)</span>
                  </div>

                  <div className="p-3 bg-white border border-black/10 rounded-sm space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-bold text-lumora-charcoal">CP-2 Commercial Pure Titanium</span>
                      <span className="text-[8px] font-mono text-lumora-taupe font-bold">Grade 2</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-lumora-taupe">{symbol}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={curr.titanium['CP2']}
                        onChange={(e) => handleTitaniumChange('CP2', parseFloat(e.target.value) || 0)}
                        className="w-full pl-6 pr-2 py-1.5 bg-white border border-black/15 text-xs font-mono font-bold text-lumora-charcoal rounded-sm focus:outline-none focus:border-lumora-gold"
                      />
                    </div>
                    <span className="text-[8px] text-lumora-taupe block font-mono">Rate per gram</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. DIAMOND PER CARAT RATES SECTION */}
          {(activeSubTab === 'all' || activeSubTab === 'diamonds') && (
            <div className="bg-white border border-black/[0.06] rounded-sm p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xs bg-lumora-gold/20 text-lumora-gold flex items-center justify-center border border-lumora-gold/30">
                    <Gem size={18} />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-lumora-charcoal">
                      Diamond Per Carat Master Rates
                    </h4>
                    <p className="text-[9px] uppercase tracking-wider text-lumora-taupe font-bold">
                      Rapaport-aligned benchmark valuations by clarity, color & pointer weight
                    </p>
                  </div>
                </div>

                <span className="text-[9px] uppercase font-mono tracking-wider text-lumora-taupe font-bold bg-lumora-bone px-2 py-1 rounded-xs">
                  Rates denoted in {symbol} per Carat (ct)
                </span>
              </div>

              {/* Quality Tiers: VVS / VS / SI */}
              <div className="space-y-3">
                <h5 className="text-[10px] uppercase tracking-wider font-bold text-lumora-charcoal flex items-center gap-1.5">
                  <Sparkles size={12} className="text-lumora-gold" /> Natural Diamond Rates by Clarity & Color Grade (per ct)
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-lumora-bone/40 border border-lumora-gold/40 rounded-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-bold text-lumora-charcoal">VVS / DEF Grade</span>
                      <span className="text-[8px] font-mono bg-lumora-gold text-white px-1.5 py-0.5 rounded-xs font-bold">Top Tier</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-lumora-taupe">{symbol}</span>
                      <input
                        type="number"
                        step="100"
                        min="0"
                        value={curr.diamond.vvsDef}
                        onChange={(e) => handleDiamondChange('vvsDef', parseFloat(e.target.value) || 0)}
                        className="w-full pl-6 pr-2 py-2 bg-white border border-black/15 text-xs font-mono font-bold text-lumora-charcoal rounded-sm focus:outline-none focus:border-lumora-gold"
                      />
                    </div>
                    <p className="text-[8px] text-lumora-taupe">Near-flawless collection stones</p>
                  </div>

                  <div className="p-4 bg-white border border-black/10 rounded-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-bold text-lumora-charcoal">VS / GH Grade</span>
                      <span className="text-[8px] font-mono bg-lumora-bone text-lumora-charcoal px-1.5 py-0.5 rounded-xs font-bold">Atelier Standard</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-lumora-taupe">{symbol}</span>
                      <input
                        type="number"
                        step="100"
                        min="0"
                        value={curr.diamond.vsGh}
                        onChange={(e) => handleDiamondChange('vsGh', parseFloat(e.target.value) || 0)}
                        className="w-full pl-6 pr-2 py-2 bg-white border border-black/15 text-xs font-mono font-bold text-lumora-charcoal rounded-sm focus:outline-none focus:border-lumora-gold"
                      />
                    </div>
                    <p className="text-[8px] text-lumora-taupe">Lumora signature fine jewelry standard</p>
                  </div>

                  <div className="p-4 bg-white border border-black/10 rounded-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-bold text-lumora-charcoal">SI / IJ Grade</span>
                      <span className="text-[8px] font-mono bg-lumora-bone text-lumora-taupe px-1.5 py-0.5 rounded-xs font-bold">Commercial</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-lumora-taupe">{symbol}</span>
                      <input
                        type="number"
                        step="100"
                        min="0"
                        value={curr.diamond.siIj}
                        onChange={(e) => handleDiamondChange('siIj', parseFloat(e.target.value) || 0)}
                        className="w-full pl-6 pr-2 py-2 bg-white border border-black/15 text-xs font-mono font-bold text-lumora-charcoal rounded-sm focus:outline-none focus:border-lumora-gold"
                      />
                    </div>
                    <p className="text-[8px] text-lumora-taupe">Accessible commercial fine diamond</p>
                  </div>
                </div>
              </div>

              {/* Natural Carat Weight / Pointer Tiers */}
              <div className="space-y-3 pt-2">
                <h5 className="text-[10px] uppercase tracking-wider font-bold text-lumora-charcoal flex items-center gap-1.5">
                  <Scale size={12} className="text-lumora-gold" /> Pointer & Solitaire Caratage Tiers (per ct)
                </h5>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { key: 'melee' as const, label: '0.01 - 0.20 ct', title: 'Stars & Melee' },
                    { key: 'pointers' as const, label: '0.21 - 0.49 ct', title: 'Pointers' },
                    { key: 'halves' as const, label: '0.50 - 0.99 ct', title: 'Halves' },
                    { key: 'solitaire1ct' as const, label: '1.00 - 1.99 ct', title: '1 Carat Solitaires' },
                    { key: 'solitaire2ct' as const, label: '2.00+ ct', title: '2+ Carat Marquee' }
                  ].map(tier => (
                    <div key={tier.key} className="p-3 bg-white border border-black/10 rounded-sm space-y-1.5">
                      <span className="text-[8px] font-mono text-lumora-taupe block font-bold">{tier.label}</span>
                      <span className="text-[9px] uppercase font-bold text-lumora-charcoal block truncate">{tier.title}</span>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-lumora-taupe">{symbol}</span>
                        <input
                          type="number"
                          step="50"
                          min="0"
                          value={curr.diamond[tier.key]}
                          onChange={(e) => handleDiamondChange(tier.key, parseFloat(e.target.value) || 0)}
                          className="w-full pl-5 pr-1.5 py-1 bg-lumora-bone/20 border border-black/15 text-[11px] font-mono font-bold text-lumora-charcoal rounded-sm focus:outline-none focus:border-lumora-gold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab-Grown Diamonds Section */}
              <div className="p-4 bg-lumora-bone/30 border border-black/10 rounded-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] uppercase tracking-wider font-bold text-lumora-charcoal flex items-center gap-1.5">
                    <Gem size={12} className="text-emerald-600" /> Lab-Grown Diamonds (CVD & HPHT) Rate per Carat
                  </h5>
                  <span className="text-[8px] font-mono uppercase bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-xs border border-emerald-200">
                    Eco / Lab Certified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 bg-white p-3 border border-black/10 rounded-sm">
                    <span className="text-[9px] uppercase font-bold text-lumora-charcoal block">Lab-Grown Solitaire (1.00+ ct)</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-lumora-taupe">{symbol}</span>
                      <input
                        type="number"
                        step="50"
                        min="0"
                        value={curr.diamond.labGrownSolitaire}
                        onChange={(e) => handleDiamondChange('labGrownSolitaire', parseFloat(e.target.value) || 0)}
                        className="w-full pl-6 pr-2 py-1.5 bg-white border border-black/15 text-xs font-mono font-bold text-lumora-charcoal rounded-sm focus:outline-none focus:border-lumora-gold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 bg-white p-3 border border-black/10 rounded-sm">
                    <span className="text-[9px] uppercase font-bold text-lumora-charcoal">Lab-Grown Accent / Melee (0.01 - 0.20 ct)</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-lumora-taupe">{symbol}</span>
                      <input
                        type="number"
                        step="25"
                        min="0"
                        value={curr.diamond.labGrownMelee}
                        onChange={(e) => handleDiamondChange('labGrownMelee', parseFloat(e.target.value) || 0)}
                        className="w-full pl-6 pr-2 py-1.5 bg-white border border-black/15 text-xs font-mono font-bold text-lumora-charcoal rounded-sm focus:outline-none focus:border-lumora-gold"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: LIVE VALUATION TESTER & RATE CARD PREVIEW (Col 4) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Interactive Live Valuation Tester */}
          <div className="bg-lumora-charcoal text-white rounded-sm p-6 space-y-5 border border-lumora-gold/30 shadow-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Calculator size={16} className="text-lumora-gold" />
                <h4 className="font-serif font-bold text-sm">Instant Rate Tester</h4>
              </div>
              <span className="text-[8px] uppercase tracking-widest font-mono text-lumora-gold">Live Sandbox</span>
            </div>

            <p className="text-[10px] text-white/70 leading-relaxed">
              Quickly test the impact of today's rates on raw material costing for a proposed piece.
            </p>

            <div className="space-y-3.5">
              {/* Metal Select */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold tracking-wider text-white/60">Metal & Caratage</label>
                <select
                  value={simMetal}
                  onChange={(e) => setSimMetal(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/15 text-xs text-white focus:outline-none focus:border-lumora-gold rounded-sm"
                >
                  <option value="gold_18k" className="text-lumora-charcoal">18K Gold ({symbol}{curr.gold['18k']}/g)</option>
                  <option value="gold_22k" className="text-lumora-charcoal">22K Gold ({symbol}{curr.gold['22k']}/g)</option>
                  <option value="platinum" className="text-lumora-charcoal">Platinum 950 ({symbol}{curr.platinum['Pt950']}/g)</option>
                  <option value="silver" className="text-lumora-charcoal">Sterling Silver 925 ({symbol}{curr.silver['92.5']}/g)</option>
                  <option value="titanium" className="text-lumora-charcoal">Grade 5 Titanium ({symbol}{curr.titanium['Grade5']}/g)</option>
                </select>
              </div>

              {/* Metal Weight */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-white/60">Net Metal Weight</label>
                  <span className="text-[10px] font-mono text-lumora-gold">{simWeight} g</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={simWeight}
                  onChange={(e) => setSimWeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white/10 border border-white/15 text-xs font-mono text-white rounded-sm focus:outline-none"
                />
              </div>

              {/* Diamond Tier */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold tracking-wider text-white/60">Diamond Specification</label>
                <select
                  value={simDiamondTier}
                  onChange={(e) => setSimDiamondTier(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/15 text-xs text-white focus:outline-none focus:border-lumora-gold rounded-sm"
                >
                  <option value="vvsDef" className="text-lumora-charcoal">VVS / DEF ({symbol}{curr.diamond.vvsDef}/ct)</option>
                  <option value="vsGh" className="text-lumora-charcoal">VS / GH ({symbol}{curr.diamond.vsGh}/ct)</option>
                  <option value="siIj" className="text-lumora-charcoal">SI / IJ ({symbol}{curr.diamond.siIj}/ct)</option>
                  <option value="solitaire1ct" className="text-lumora-charcoal">1 Carat Solitaire ({symbol}{curr.diamond.solitaire1ct}/ct)</option>
                  <option value="labGrownSolitaire" className="text-lumora-charcoal">Lab-Grown Solitaire ({symbol}{curr.diamond.labGrownSolitaire}/ct)</option>
                </select>
              </div>

              {/* Diamond Weight */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-white/60">Carat Weight (tcw)</label>
                  <span className="text-[10px] font-mono text-lumora-gold">{simDiamondWeight} ct</span>
                </div>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={simDiamondWeight}
                  onChange={(e) => setSimDiamondWeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white/10 border border-white/15 text-xs font-mono text-white rounded-sm focus:outline-none"
                />
              </div>

              {/* Making charges */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold tracking-wider text-white/60">Craftsman Labor / Making per gram</label>
                <input
                  type="number"
                  step="10"
                  min="0"
                  value={simMakingPerGram}
                  onChange={(e) => setSimMakingPerGram(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white/10 border border-white/15 text-xs font-mono text-white rounded-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Calculated Breakdown Card */}
            <div className="p-4 bg-black/40 border border-white/10 rounded-sm space-y-2 font-mono text-[10px]">
              <div className="flex justify-between text-white/70">
                <span>Raw Metal:</span>
                <span className="text-white">{symbol}{Math.round(simRawMetalCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Diamonds ({simDiamondWeight}ct):</span>
                <span className="text-white">{symbol}{Math.round(simRawDiamondCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Craftsman Making:</span>
                <span className="text-white">{symbol}{Math.round(simLaborCost).toLocaleString()}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between text-xs font-bold text-lumora-gold">
                <span>Base Workshop Cost:</span>
                <span>{symbol}{Math.round(simTotalEstimatedCost).toLocaleString()}</span>
              </div>
            </div>

            {onOpenCalculator && (
              <button
                type="button"
                onClick={onOpenCalculator}
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-[9px] uppercase font-bold tracking-wider rounded-sm transition-all flex items-center justify-center gap-1.5"
              >
                <Sliders size={12} /> Open Full Pricing Calculator <ArrowRight size={12} />
              </button>
            )}
          </div>

          {/* Quick Summary of Today's Benchmark Card */}
          <div className="bg-white border border-black/[0.06] rounded-sm p-6 space-y-4 shadow-xs">
            <h4 className="font-serif font-bold text-sm text-lumora-charcoal border-b border-black/[0.06] pb-2">
              Today's Atelier Spot Card
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-black/[0.04]">
                <span className="text-lumora-taupe text-[10px] uppercase font-bold">24K Pure Gold</span>
                <span className="font-mono font-bold text-lumora-charcoal">{symbol}{curr.gold['24k'].toLocaleString()}/g</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-black/[0.04]">
                <span className="text-lumora-taupe text-[10px] uppercase font-bold">22K Gold (916)</span>
                <span className="font-mono font-bold text-lumora-charcoal">{symbol}{curr.gold['22k'].toLocaleString()}/g</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-black/[0.04]">
                <span className="text-lumora-taupe text-[10px] uppercase font-bold">18K Gold (750)</span>
                <span className="font-mono font-bold text-lumora-gold">{symbol}{curr.gold['18k'].toLocaleString()}/g</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-black/[0.04]">
                <span className="text-lumora-taupe text-[10px] uppercase font-bold">Fine Silver 999</span>
                <span className="font-mono font-bold text-lumora-charcoal">{symbol}{curr.silver['99.99'].toLocaleString()}/g</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-black/[0.04]">
                <span className="text-lumora-taupe text-[10px] uppercase font-bold">Platinum 950</span>
                <span className="font-mono font-bold text-lumora-charcoal">{symbol}{curr.platinum['Pt950'].toLocaleString()}/g</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-black/[0.04]">
                <span className="text-lumora-taupe text-[10px] uppercase font-bold">Grade 5 Titanium</span>
                <span className="font-mono font-bold text-lumora-charcoal">{symbol}{curr.titanium['Grade5'].toLocaleString()}/g</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-lumora-taupe text-[10px] uppercase font-bold">VS/GH Diamond</span>
                <span className="font-mono font-bold text-lumora-charcoal">{symbol}{curr.diamond.vsGh.toLocaleString()}/ct</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveAll}
              className="w-full mt-2 py-2.5 bg-lumora-charcoal hover:bg-lumora-gold text-white text-[9px] uppercase font-bold tracking-[0.2em] rounded-sm transition-all flex items-center justify-center gap-2"
            >
              <Save size={13} /> Save & Broadcast Today's Rates
            </button>
          </div>

        </div>

      </div>

      {/* SHOWROOM PRINTABLE RATE CARD MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-lumora-charcoal/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-8 rounded-sm shadow-2xl border border-black/10 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-lumora-taupe">LUMORA FINE JEWELLERY</span>
                <h3 className="font-serif font-bold text-xl text-lumora-charcoal">Daily Atelier Bullion & Diamond Fixing</h3>
                <p className="text-[10px] font-mono text-lumora-taupe">Date: {effectiveDate} | Market: {currentMarket.toUpperCase()}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="text-lumora-taupe hover:text-lumora-charcoal p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Print Table */}
            <div className="space-y-4">
              <div>
                <h5 className="text-[9px] uppercase tracking-wider font-bold text-lumora-charcoal mb-2">Precious Metals Fixing ({curr.currency} / {curr.unit})</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-lumora-bone/40 rounded-xs flex justify-between">
                    <span className="font-serif font-bold">24K Pure Gold (999):</span>
                    <span className="font-mono font-bold text-lumora-gold">{symbol}{curr.gold['24k']}</span>
                  </div>
                  <div className="p-2.5 bg-lumora-bone/40 rounded-xs flex justify-between">
                    <span className="font-serif font-bold">22K Gold (916):</span>
                    <span className="font-mono font-bold text-lumora-gold">{symbol}{curr.gold['22k']}</span>
                  </div>
                  <div className="p-2.5 bg-lumora-bone/40 rounded-xs flex justify-between">
                    <span className="font-serif font-bold">18K Gold (750):</span>
                    <span className="font-mono font-bold text-lumora-gold">{symbol}{curr.gold['18k']}</span>
                  </div>
                  <div className="p-2.5 bg-lumora-bone/40 rounded-xs flex justify-between">
                    <span className="font-serif font-bold">14K Gold (585):</span>
                    <span className="font-mono font-bold">{symbol}{curr.gold['14k']}</span>
                  </div>
                  <div className="p-2.5 bg-lumora-bone/40 rounded-xs flex justify-between">
                    <span className="font-serif font-bold">Fine Silver 999:</span>
                    <span className="font-mono font-bold">{symbol}{curr.silver['99.99']}</span>
                  </div>
                  <div className="p-2.5 bg-lumora-bone/40 rounded-xs flex justify-between">
                    <span className="font-serif font-bold">Sterling Silver 925:</span>
                    <span className="font-mono font-bold">{symbol}{curr.silver['92.5']}</span>
                  </div>
                  <div className="p-2.5 bg-lumora-bone/40 rounded-xs flex justify-between">
                    <span className="font-serif font-bold">Platinum 950:</span>
                    <span className="font-mono font-bold">{symbol}{curr.platinum['Pt950']}</span>
                  </div>
                  <div className="p-2.5 bg-lumora-bone/40 rounded-xs flex justify-between">
                    <span className="font-serif font-bold">Titanium Grade 5:</span>
                    <span className="font-mono font-bold">{symbol}{curr.titanium['Grade5']}</span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-[9px] uppercase tracking-wider font-bold text-lumora-charcoal mb-2">Diamond Valuations ({curr.currency} / Carat)</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-lumora-bone/40 rounded-xs flex justify-between">
                    <span className="font-serif font-bold">VVS / DEF Collection:</span>
                    <span className="font-mono font-bold text-lumora-gold">{symbol}{curr.diamond.vvsDef.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 bg-lumora-bone/40 rounded-xs flex justify-between">
                    <span className="font-serif font-bold">VS / GH Fine Atelier:</span>
                    <span className="font-mono font-bold text-lumora-gold">{symbol}{curr.diamond.vsGh.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 bg-lumora-bone/40 rounded-xs flex justify-between">
                    <span className="font-serif font-bold">SI / IJ Commercial:</span>
                    <span className="font-mono font-bold">{symbol}{curr.diamond.siIj.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 bg-lumora-bone/40 rounded-xs flex justify-between">
                    <span className="font-serif font-bold">1.00+ ct Solitaire:</span>
                    <span className="font-mono font-bold">{symbol}{curr.diamond.solitaire1ct.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-black/10 pt-4 flex justify-between items-center text-[10px] text-lumora-taupe">
              <span>Verified by Atelier Treasury &bull; Lumora Haute Joaillerie</span>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 bg-lumora-charcoal text-white hover:bg-lumora-gold text-[9px] font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-all"
              >
                <Printer size={13} /> Print Document
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
