import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, CreditCard, DollarSign, Lock, Truck, Info, ExternalLink, Zap, Check, AlertTriangle } from 'lucide-react';
import { Order, OrderItem } from '../types';
import { storeService } from '../services/storeService';
import { initializeRazorpayPayment, loadRazorpayScript, isRazorpayConfigured } from '../services/razorpayService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: {
    id: string;
    name: string;
    price: string;
    image: string;
    collection: string;
    quantity: number;
  }[];
  currency: string;
  totalFormatted: string;
  subtotalNumber: number;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currency,
  totalFormatted,
  subtotalNumber,
  onOrderSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'United States',
    postalCode: '',
    paymentMethod: 'Bank Wire' as Order['paymentMethod'],
    specialNotes: '',
  });

  const [razorpayKey, setRazorpayKey] = useState<string>('');
  const [showRazorpayGuide, setShowRazorpayGuide] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [razorpayPaymentId, setRazorpayPaymentId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const integrations = storeService.getIntegrationConfig();
      setRazorpayKey(integrations.razorpayKeyId || '');
      loadRazorpayScript();
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const processOrderCompletion = (method: Order['paymentMethod'], paymentId?: string) => {
    const orderItems: OrderItem[] = cartItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      collection: item.collection,
    }));

    // Security requirement: Never mark orders as Paid solely from frontend reports or unintegrated methods
    const newOrder = storeService.addOrder({
      customerName: formData.name || 'Private Patron',
      customerEmail: formData.email || 'client@atelier.anovi.com',
      customerPhone: formData.phone || '+44 20 7946 0912',
      shippingAddress: formData.address || 'Confidential Private Residence',
      city: formData.city || 'London',
      country: formData.country || 'United Kingdom',
      postalCode: formData.postalCode || 'SW1A 1AA',
      items: orderItems,
      subtotal: subtotalNumber,
      currency: currency,
      status: 'Preparing Atelier',
      trackingNumber: 'PENDING_ATELIER_DISPATCH',
      paymentMethod: method,
      paymentStatus: 'Pending Verification',
      notes: paymentId 
        ? `Transaction ID: ${paymentId} (Pending server verification) | ${formData.specialNotes || 'Client acquisition request'}`
        : formData.specialNotes || 'Acquisition order placed pending concierge verification and insured dispatch schedule.'
    });

    setIsSubmitting(false);
    setConfirmedOrder(newOrder);
    onOrderSuccess(newOrder);
  };

  const handleRazorpayCheckout = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setErrorMessage('Please provide your Name, Email, and Phone number before proceeding.');
      return;
    }

    if (!isRazorpayConfigured(razorpayKey)) {
      setErrorMessage('Razorpay Gateway is pending live merchant credentials approval. Online payment is temporarily paused for this exhibition. Please select "Private Bank Wire" or "Armored Courier COD" to submit your commission reservation.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const amountInSubunits = Math.round((subtotalNumber || 1000) * 100);

    const result = await initializeRazorpayPayment({
      key: razorpayKey,
      amount: amountInSubunits,
      currency: currency === 'INR' ? 'INR' : 'USD',
      name: 'ANOVI Haute Joaillerie',
      description: 'Atelier High Jewelry Commission',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=200',
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: '#D4AF37',
        backdrop_color: '#0A0A0A',
      },
    });

    if (result.success && result.response) {
      setRazorpayPaymentId(result.response.razorpay_payment_id);
      processOrderCompletion('Razorpay', result.response.razorpay_payment_id);
    } else {
      setIsSubmitting(false);
      setErrorMessage(result.error || 'Payment was cancelled or could not be initiated.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.paymentMethod === 'Razorpay' && isRazorpayConfigured(razorpayKey)) {
      handleRazorpayCheckout();
    } else {
      setIsSubmitting(true);
      setTimeout(() => {
        processOrderCompletion(formData.paymentMethod);
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="bg-ivory border border-onyx/15 text-onyx max-w-3xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-8 py-5 bg-onyx text-white flex justify-between items-center border-b border-gold/30">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-gold font-semibold">ANOVI Haute Joaillerie</p>
            <h3 className="text-xl font-serif italic">
              {confirmedOrder ? 'Acquisition Confirmed' : 'Private Client Checkout & White-Glove Dispatch'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {confirmedOrder ? (
          <div className="p-8 md:p-12 text-center space-y-6 overflow-y-auto custom-scrollbar">
            <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto border border-gold/30">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">Commission Registered</p>
              <h2 className="text-3xl font-serif italic text-onyx">{confirmedOrder.orderNumber}</h2>
              <p className="text-xs text-onyx/60 max-w-md mx-auto leading-relaxed">
                Thank you, {confirmedOrder.customerName}. Your bespoke acquisition request has been entered into the Atelier ledger. Our private client concierge will contact you to verify settlement details and arrange armored insured dispatch.
              </p>
            </div>

            <div className="p-6 bg-white border border-onyx/10 text-left max-w-lg mx-auto space-y-3 text-xs">
              <div className="flex justify-between border-b border-onyx/5 pb-2">
                <span className="text-onyx/50">Recipient Email:</span>
                <span className="font-medium">{confirmedOrder.customerEmail}</span>
              </div>
              <div className="flex justify-between border-b border-onyx/5 pb-2">
                <span className="text-onyx/50">Destination:</span>
                <span className="font-medium text-right">{confirmedOrder.shippingAddress}, {confirmedOrder.city}</span>
              </div>
              <div className="flex justify-between border-b border-onyx/5 pb-2">
                <span className="text-onyx/50">Payment Settlement:</span>
                <span className="font-medium flex items-center gap-1.5 text-gold font-semibold">
                  <Check size={14} /> {confirmedOrder.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between border-b border-onyx/5 pb-2">
                <span className="text-onyx/50">Settlement Verification:</span>
                <span className="font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                  Pending Atelier Verification
                </span>
              </div>
              {razorpayPaymentId && (
                <div className="flex justify-between border-b border-onyx/5 pb-2">
                  <span className="text-onyx/50">Reference ID:</span>
                  <span className="font-mono text-onyx bg-onyx/5 px-2 py-0.5 rounded text-[11px]">
                    {razorpayPaymentId}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-1">
                <span className="text-gold font-bold">Acquisition Value:</span>
                <span className="text-gold font-serif text-lg font-bold">{totalFormatted}</span>
              </div>
            </div>

            <p className="text-[10px] text-onyx/50 uppercase tracking-widest flex items-center justify-center gap-2">
              <ShieldCheck size={14} className="text-gold" />
              Recorded in the Atelier Administration vault · White-glove insured delivery
            </p>

            <button
              onClick={onClose}
              className="bg-onyx text-white px-8 py-3 text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-gold transition-colors duration-300"
            >
              Return to Catalog
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar text-xs">
            {/* Bag Summary */}
            <div className="bg-white p-4 border border-onyx/10 space-y-3">
              <div className="flex justify-between items-center border-b border-onyx/5 pb-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-gold">Commission Summary ({cartItems.length} items)</span>
                <span className="font-serif text-base font-bold text-gold">{totalFormatted}</span>
              </div>
              <div className="flex gap-3 overflow-x-auto py-1 no-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 flex-shrink-0 bg-ivory p-2 border border-onyx/5">
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover" />
                    <div>
                      <p className="font-medium text-[11px] truncate max-w-[150px]">{item.name}</p>
                      <p className="text-[10px] text-onyx/50">{item.price} × {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Particulars */}
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold border-b border-onyx/10 pb-1">
                1. Confidential Client Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-1 text-onyx/70">Full Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="Lady Eleanor Vance"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-onyx/15 p-2 text-xs focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-1 text-onyx/70">Email Address *</label>
                  <input 
                    type="email"
                    required
                    placeholder="eleanor@vance-estate.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-onyx/15 p-2 text-xs focus:border-gold outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold mb-1 text-onyx/70">Contact Telephone (For Courier Notice) *</label>
                <input 
                  type="tel"
                  required
                  placeholder="+91 98765 43210 / +44 20 7946 0912"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white border border-onyx/15 p-2 text-xs focus:border-gold outline-none"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold border-b border-onyx/10 pb-1">
                2. Insured Destination
              </h4>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold mb-1 text-onyx/70">Street Address *</label>
                <input 
                  type="text"
                  required
                  placeholder="Apartment, Suite, or Private Estate"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-white border border-onyx/15 p-2 text-xs focus:border-gold outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-1 text-onyx/70">City *</label>
                  <input 
                    type="text"
                    required
                    placeholder="Mumbai / London / New York"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-white border border-onyx/15 p-2 text-xs focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-1 text-onyx/70">Country *</label>
                  <input 
                    type="text"
                    required
                    placeholder="India / United Kingdom"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-white border border-onyx/15 p-2 text-xs focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-1 text-onyx/70">Postal Code *</label>
                  <input 
                    type="text"
                    required
                    placeholder="400001 / SW1A 1AA"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full bg-white border border-onyx/15 p-2 text-xs focus:border-gold outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold border-b border-onyx/10 pb-1">
                3. Payment Gateway & Settlement
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: 'Razorpay', label: 'Razorpay (UPI / Cards / NetBanking)', icon: DollarSign, badge: 'Popular' },
                  { id: 'Credit Card / Stripe', label: 'Credit Card (Stripe Encrypted)', icon: CreditCard },
                  { id: 'Cash on Delivery', label: 'Armored Courier COD', icon: Truck },
                  { id: 'Bank Wire', label: 'Private Bank Wire Transfer', icon: Lock },
                ].map(opt => (
                  <label 
                    key={opt.id}
                    className={`flex items-center justify-between p-3 border cursor-pointer transition-colors ${
                      formData.paymentMethod === opt.id ? 'bg-gold/10 border-gold' : 'bg-white border-onyx/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio"
                        name="paymentMethod"
                        value={opt.id}
                        checked={formData.paymentMethod === opt.id}
                        onChange={() => {
                          setFormData({ ...formData, paymentMethod: opt.id as any });
                          setErrorMessage(null);
                        }}
                        className="accent-gold"
                      />
                      <opt.icon size={16} className="text-gold" />
                      <span className="text-xs font-medium">{opt.label}</span>
                    </div>
                    {opt.badge && (
                      <span className="text-[9px] uppercase tracking-wider bg-gold/20 text-gold px-1.5 py-0.5 font-bold">
                        {opt.badge}
                      </span>
                    )}
                  </label>
                ))}
              </div>

              {/* Razorpay Dedicated Section */}
              {formData.paymentMethod === 'Razorpay' && (
                <div className="p-4 bg-white border border-gold/40 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-onyx/5 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-[#0C2340] rounded flex items-center justify-center text-white text-[10px] font-bold">
                        R
                      </div>
                      <span className="font-semibold text-xs text-[#0C2340]">Razorpay Payment Gateway</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                        isRazorpayConfigured(razorpayKey)
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isRazorpayConfigured(razorpayKey) ? 'Active Integration' : 'Pending Merchant Activation'}
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowRazorpayGuide(!showRazorpayGuide)}
                      className="text-[10px] text-gold hover:underline flex items-center gap-1 font-medium"
                    >
                      <Info size={12} />
                      {showRazorpayGuide ? 'Hide Details' : 'Gateway Information'}
                    </button>
                  </div>

                  {isRazorpayConfigured(razorpayKey) ? (
                    <p className="text-[11px] text-onyx/70 leading-relaxed">
                      Settles via official <strong>Razorpay Checkout</strong>: supports <strong>UPI (GPay, PhonePe, Paytm, BHIM)</strong>, 
                      Credit/Debit Cards (Visa, Mastercard, RuPay, Amex), and 50+ NetBanking options with direct webhook reconciliation.
                    </p>
                  ) : (
                    <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded text-[11px] text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                        <AlertTriangle size={13} />
                        <span>Online Card & UPI Gateway Pending Activation</span>
                      </div>
                      <p className="leading-relaxed text-amber-800/90">
                        Direct merchant payment approval is pending. For the exhibition, you can place your commission order via <strong>Private Bank Wire</strong> or <strong>Armored Courier COD</strong>, and our atelier concierge will coordinate direct fulfillment.
                      </p>
                    </div>
                  )}

                  {/* Razorpay Credentials Required Info Drawer */}
                  {showRazorpayGuide && (
                    <div className="bg-[#FAF8F5] border border-gold/30 p-3 rounded text-[11px] space-y-2 text-onyx/80">
                      <div className="flex items-center gap-1.5 font-bold text-gold text-[11px]">
                        <Zap size={13} />
                        <span>Razorpay Merchant Activation Status:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-onyx/75 pl-1">
                        <li><strong>Key ID Status:</strong> {isRazorpayConfigured(razorpayKey) ? 'Configured with live merchant ID.' : 'Awaiting live merchant credentials from dashboard.razorpay.com.'}</li>
                        <li><strong>Payment Verification:</strong> Server-side HMAC SHA-256 webhook verification enabled once merchant secret is configured.</li>
                        <li><strong>Supported Currencies:</strong> INR for domestic India patrons; USD / EUR for international atelier patrons.</li>
                        <li><strong>Exhibition Fallback:</strong> Concierge Bank Wire and Insured Cash-on-Delivery remain active for high-value acquisitions.</li>
                      </ul>
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[10px] text-onyx/50">Merchant portal: dashboard.razorpay.com</span>
                        <a 
                          href="https://dashboard.razorpay.com" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[10px] text-gold font-bold flex items-center gap-1 hover:underline"
                        >
                          Razorpay Dashboard <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2 text-[10px] text-onyx/60 font-mono bg-ivory px-2.5 py-1.5 border border-onyx/10">
                      <span className="text-onyx/40">Status:</span>
                      <span className="font-semibold text-onyx">
                        {isRazorpayConfigured(razorpayKey) ? 'Ready to Launch' : 'Pending Merchant Key'}
                      </span>
                    </div>

                    {isRazorpayConfigured(razorpayKey) ? (
                      <button
                        type="button"
                        onClick={handleRazorpayCheckout}
                        disabled={isSubmitting}
                        className="bg-gold text-onyx px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Zap size={12} />
                        <span>Launch Razorpay Gateway</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => processOrderCompletion('Razorpay')}
                        disabled={isSubmitting}
                        className="bg-onyx text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-gold hover:text-onyx transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Reserve via Concierge</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Credit Card / Stripe */}
              {formData.paymentMethod === 'Credit Card / Stripe' && (
                <div className="p-4 bg-white border border-onyx/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-onyx">
                    <CreditCard size={16} className="text-gold" />
                    <span>Stripe Luxury Card Processing</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-medium">
                      Pending Activation
                    </span>
                  </div>
                  <p className="text-[11px] text-onyx/70 leading-relaxed">
                    Card processing is pending live Stripe account approval. Raw card data is never collected in the browser for PCI compliance. 
                    Submitting this form reserves your selected piece and prompts our Mayfair atelier concierge to issue a direct, encrypted payment link.
                  </p>
                </div>
              )}

              {/* Bank Wire */}
              {formData.paymentMethod === 'Bank Wire' && (
                <div className="p-4 bg-white border border-onyx/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-onyx">
                    <Lock size={16} className="text-gold" />
                    <span>Private Bank Wire (SWIFT / IBAN / RTGS)</span>
                  </div>
                  <p className="text-[11px] text-onyx/70 leading-relaxed">
                    Official pro-forma invoice and wire transfer details will be transmitted to your email. Our atelier reserves the piece upon submission and ships via insured armored courier upon funds clearance.
                  </p>
                </div>
              )}

              {/* Cash on Delivery */}
              {formData.paymentMethod === 'Cash on Delivery' && (
                <div className="p-4 bg-white border border-onyx/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-onyx">
                    <Truck size={16} className="text-gold" />
                    <span>Armored Courier Cash/Draft on Delivery</span>
                  </div>
                  <p className="text-[11px] text-onyx/70 leading-relaxed">
                    Available for private client addresses across London, Paris, New York, and Mumbai. Settlement collected by licensed armed courier upon identity verification.
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center justify-between">
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-onyx/10 gap-3">
              <span className="text-[10px] text-onyx/50 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-gold" /> 256-Bit SSL Insured Transfer
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-onyx text-white hover:bg-gold transition-colors px-8 py-4 text-[10px] uppercase tracking-[0.3em] font-bold duration-300 disabled:opacity-50"
              >
                {isSubmitting 
                  ? 'Connecting Secure Gateway...' 
                  : formData.paymentMethod === 'Razorpay'
                    ? `Proceed to Razorpay (${totalFormatted})`
                    : `Complete Acquisition (${totalFormatted})`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
