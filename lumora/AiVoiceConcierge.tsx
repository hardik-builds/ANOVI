import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  CreditCard,
  UserPlus,
  Package,
  Wrench,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Compass,
  FileText,
  Image as LucideImage,
  Upload,
  X,
  Plus,
  Tag,
  Camera,
  Layers,
  HelpCircle,
  AlertTriangle,
  Check,
  Trash2,
  Database,
  History,
  CheckCheck,
  Info,
  Radio,
  Square,
  Play,
  Sliders,
  Edit3,
  Save,
  FileCheck,
  Gem,
  CheckCircle,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { Customer, Product, LedgerEntry, BespokeOrder, RepairJob, PendingActionState } from './types';

export interface AiVoiceAction {
  id: string;
  timestamp: string;
  type: string;
  summary: string;
  details: Record<string, any>;
  status: 'executed' | 'failed';
  linkTab?: string;
  linkId?: string;
  productImages?: string[];
  mutationType?: 'added' | 'updated' | 'deleted' | 'navigated' | 'viewed';
  entityType?: string;
  recordIdentifier?: string;
  recordName?: string;
  finalState?: {
    status: string;
    details?: Record<string, any>;
    syncMessage?: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  images?: string[];
  action?: AiVoiceAction;
  pendingAction?: PendingActionState | null;
  suggestedPrompts?: string[];
  isVoiceInput?: boolean;
}

interface AiVoiceConciergeProps {
  customers: Customer[];
  products: Product[];
  ledger: LedgerEntry[];
  bespokeOrders: BespokeOrder[];
  repairJobs: RepairJob[];
  metalRates: any;
  marketView: 'india' | 'global';
  activeLocation?: string;
  onRecordPayment: (paymentData: {
    amount: number;
    customerName: string;
    location?: string;
    paymentType?: 'customer_advance' | 'customer_final' | 'sale' | 'craftsman_payment' | 'craftsman_advance';
    category?: 'Inflow' | 'Outflow';
    paymentMethod?: string;
    relatedOrderId?: string;
    description?: string;
    date?: string;
  }) => { success: boolean; entry?: LedgerEntry; message?: string };
  onAddCustomer: (customerData: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    area?: string;
    leadSource?: string;
    ageGroup?: string;
    notes?: string;
  }) => { success: boolean; customer?: Customer; message?: string };
  onAdjustStock: (data: {
    productNameOrSku: string;
    newStock?: number;
    stockDelta?: number;
    newPrice?: number;
  }) => { success: boolean; product?: Product; message?: string };
  onAddProduct?: (data: {
    name: string;
    category?: string;
    price?: number;
    stock?: number;
    material?: string;
    description?: string;
    images?: string[];
    video?: string;
    sku?: string;
  }) => { success: boolean; product?: Product; message?: string };
  onCreateBespokeOrder: (data: {
    customerName: string;
    customerPhone?: string;
    metalType?: string;
    metalPurity?: string;
    metalWeight?: number;
    specifications?: string;
    totalAmount?: number;
    advancePaid?: number;
    stonesSummary?: string;
  }) => { success: boolean; order?: BespokeOrder; message?: string };
  onUpdateMetalRates: (data: {
    market?: 'india' | 'global';
    gold24kPerGram?: number;
    silverPerGram?: number;
    notes?: string;
  }) => { success: boolean; message?: string };
  onLogRepair: (data: {
    customerName: string;
    customerPhone?: string;
    itemDescription: string;
    repairDetails: string;
    costEstimate?: number;
  }) => { success: boolean; repair?: RepairJob; message?: string };
  onDeleteProduct?: (idOrSku: string) => { success: boolean; product?: Product; message?: string };
  onDeleteCustomer?: (idOrName: string) => { success: boolean; customer?: Customer; message?: string };
  onDeleteOrder?: (orderId: string) => { success: boolean; order?: any; message?: string };
  onUpdateProduct?: (data: { idOrSku: string; updates: Partial<Product> }) => { success: boolean; product?: Product; message?: string };
  onUpdateCustomer?: (data: { idOrName: string; updates: Partial<Customer> }) => { success: boolean; customer?: Customer; message?: string };
  onNavigateTab: (tab: any) => void;
  isFloatingView?: boolean;
  onCloseFloating?: () => void;
}

export const AiVoiceConcierge: React.FC<AiVoiceConciergeProps> = ({
  customers,
  products,
  ledger,
  bespokeOrders,
  repairJobs,
  metalRates,
  marketView,
  activeLocation = 'Mumbai Flagship',
  onRecordPayment,
  onAddCustomer,
  onAdjustStock,
  onAddProduct,
  onCreateBespokeOrder,
  onUpdateMetalRates,
  onLogRepair,
  onDeleteProduct,
  onDeleteCustomer,
  onDeleteOrder,
  onUpdateProduct,
  onUpdateCustomer,
  onNavigateTab,
  isFloatingView = false,
  onCloseFloating
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Welcome to LUMORA Voice & AI Concierge. You can speak or type natural commands, or attach multiple photos of jewelry pieces to create products, record payments, add clients, adjust stock, or update metal spot rates without touching any forms.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedPrompts: [
        '📸 Upload photos to automatically create a new luxury product',
        'Record payment of ₹75,000 from Aarav Mehta (Mumbai) via Bank Transfer',
        'Add VIP customer Priya Sharma, Delhi, +91 9820011223, Instagram lead',
        'Create bespoke order for Rhea Kapoor: 18K Yellow Gold ring, advance ₹40,000',
        'Adjust stock of Diamond Tennis Bracelet to 12 units',
        'Update 24k Gold rate to ₹84,500/10g'
      ]
    }
  ]);

  const [pendingAction, setPendingAction] = useState<PendingActionState | null>(null);
  const [inputQuery, setInputQuery] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [speechLang, setSpeechLang] = useState<'en-IN' | 'en-US' | 'en-GB' | 'hi-IN'>('en-IN');
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [recentActionHistory, setRecentActionHistory] = useState<AiVoiceAction[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'payments' | 'customers' | 'inventory' | 'rates' | 'bespoke'>('all');
  const [sidebarTab, setSidebarTab] = useState<'activity' | 'guide'>('activity');

  // Universal MediaRecorder Audio Recording & Quick Record State
  const [isMediaRecording, setIsMediaRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioRecordingError, setAudioRecordingError] = useState<string | null>(null);
  const [activeQuickRecord, setActiveQuickRecord] = useState<'none' | 'payment' | 'customer' | 'bespoke' | 'product' | 'repair' | 'rates'>('none');

  // Quick Record Form States
  const [qpClient, setQpClient] = useState('');
  const [qpAmount, setQpAmount] = useState('');
  const [qpMethod, setQpMethod] = useState('UPI');
  const [qpLocation, setQpLocation] = useState(activeLocation || 'Mumbai Flagship');
  const [qpType, setQpType] = useState<'customer_advance' | 'customer_final' | 'sale'>('customer_advance');
  const [qpNotes, setQpNotes] = useState('');

  const [qcName, setQcName] = useState('');
  const [qcPhone, setQcPhone] = useState('');
  const [qcEmail, setQcEmail] = useState('');
  const [qcLocation, setQcLocation] = useState(activeLocation || 'Mumbai Flagship');
  const [qcSource, setQcSource] = useState('Walk-in');

  const [qbClient, setQbClient] = useState('');
  const [qbMetal, setQbMetal] = useState('Yellow Gold');
  const [qbPurity, setQbPurity] = useState('18K (75.0%)');
  const [qbSpecs, setQbSpecs] = useState('');
  const [qbTotal, setQbTotal] = useState('');
  const [qbAdvance, setQbAdvance] = useState('');

  const [qprName, setQprName] = useState('');
  const [qprCategory, setQprCategory] = useState<'Rings' | 'Necklaces' | 'Earrings' | 'Bracelets' | 'Bespoke' | 'High Jewelry'>('Rings');
  const [qprMaterial, setQprMaterial] = useState('18k Yellow Gold');
  const [qprPrice, setQprPrice] = useState('');
  const [qprStock, setQprStock] = useState('1');
  const [qprDesc, setQprDesc] = useState('');

  const [qrClient, setQrClient] = useState('');
  const [qrItem, setQrItem] = useState('');
  const [qrDetails, setQrDetails] = useState('');
  const [qrCost, setQrCost] = useState('');

  const [qgRate24k, setQgRate24k] = useState(String(metalRates?.india?.gold?.['24k'] ? metalRates.india.gold['24k'] * 10 : 78190));
  const [qgSilver, setQgSilver] = useState(String(metalRates?.india?.silver?.['99.99'] || 95));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<any>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setSpeechTranscript(currentTranscript);
        setInputQuery(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition initialization failed:', e);
      setIsSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, [speechLang]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isListening, isProcessing, attachedImages]);

  // Handle image files to base64
  const handleImageFiles = async (files: FileList | File[]) => {
    const newBase64s: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file && file.type.startsWith('image/')) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newBase64s.push(base64);
      }
    }
    if (newBase64s.length > 0) {
      setAttachedImages(prev => [...prev, ...newBase64s]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Clipboard paste support for images
  const handlePaste = async (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const files = (Array.from(e.clipboardData.files) as File[]).filter(f => f.type.startsWith('image/'));
      if (files.length > 0) {
        e.preventDefault();
        await handleImageFiles(files);
      }
    }
  };

  // Voice synthesis helper
  const speakResponse = (text: string) => {
    if (!isTtsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const cleanText = text.replace(/[*_#`[\]()]/g, ' ').replace(/₹/g, ' rupees ').replace(/\$/g, ' dollars ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => (v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Premium'))));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  // --- UNIVERSAL VOICE & AUDIO RECORDING ENGINE ---
  const startVoiceRecording = async () => {
    setAudioRecordingError(null);
    setSpeechTranscript('');
    setIsListening(true);
    setRecordingDuration(0);

    // 1. Timer interval
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    // 2. Start MediaRecorder for high-fidelity audio stream capture
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;

        let mimeType = 'audio/webm';
        if (typeof MediaRecorder !== 'undefined') {
          if (!MediaRecorder.isTypeSupported('audio/webm')) {
            if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
            else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
            else mimeType = '';
          }
          const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          mediaRecorder.start(250);
          setIsMediaRecording(true);
        }
      }
    } catch (micErr: any) {
      console.warn('Microphone access warning:', micErr);
      setAudioRecordingError('Microphone stream access unavailable. You can use speech recognition or type below.');
    }

    // 3. Simultaneously start Web Speech Recognition for instant live transcript if supported
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech recognition start failed or already active:', err);
      }
    }
  };

  const stopVoiceRecording = async (shouldExecute = true) => {
    setIsListening(false);
    setIsMediaRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }

    // Process recorded audio
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = async () => {
        const mime = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mime });

        // Clean up audio tracks
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(t => t.stop());
          audioStreamRef.current = null;
        }

        if (shouldExecute) {
          if (audioBlob.size > 500) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Audio = reader.result as string;
              handleExecuteCommand(inputQuery, true, undefined, base64Audio, mime);
            };
            reader.readAsDataURL(audioBlob);
          } else if (inputQuery.trim() || speechTranscript.trim()) {
            handleExecuteCommand(inputQuery || speechTranscript, true);
          }
        }
      };

      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    } else {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
        audioStreamRef.current = null;
      }
      if (shouldExecute && (inputQuery.trim() || speechTranscript.trim())) {
        handleExecuteCommand(inputQuery || speechTranscript, true);
      }
    }
  };

  const cancelVoiceRecording = () => {
    setIsListening(false);
    setIsMediaRecording(false);
    setSpeechTranscript('');
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(t => t.stop());
      audioStreamRef.current = null;
    }
  };

  const toggleVoiceListening = () => {
    if (isListening) {
      stopVoiceRecording(true);
    } else {
      startVoiceRecording();
    }
  };

  // Client-side fallback rule parser for zero-network resilience & progressive clarification
  const parseLocallyFallback = (rawText: string, currentImages: string[], activePendingAction?: PendingActionState | null) => {
    const text = rawText.toLowerCase().trim();

    // Cancellation check
    if (text.includes('cancel') || text.includes('abort') || text.includes('nevermind') || text.includes('never mind') || text === 'stop') {
      return {
        status: 'cancelled',
        reply: 'I have cancelled the in-progress action. What would you like to do next?',
        summary: 'Action Cancelled',
        action: null,
        pendingAction: null,
        suggestedNextActions: ['Record a customer payment', 'Add VIP customer', 'Check gold rates', 'Upload product photos']
      };
    }

    // A. Handle Active Pending Action (Merging response with previously collected slots)
    if (activePendingAction) {
      const type = activePendingAction.actionType;
      const collected = { ...activePendingAction.collectedFields };

      if (type === 'RECORD_PAYMENT') {
        const amountMatch = rawText.match(/(?:₹|rs\.?|inr|\$)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/i);
        if (amountMatch) {
          const num = parseFloat(amountMatch[1].replace(/,/g, ''));
          if (num > 0) collected.amount = num;
        }

        if (text.includes('upi') || text.includes('gpay') || text.includes('phonepe') || text.includes('paytm')) collected.paymentMethod = 'UPI';
        else if (text.includes('bank') || text.includes('transfer') || text.includes('neft') || text.includes('rtgs') || text.includes('imps')) collected.paymentMethod = 'Bank Transfer';
        else if (text.includes('card') || text.includes('credit') || text.includes('debit')) collected.paymentMethod = 'Credit Card';
        else if (text.includes('cash')) collected.paymentMethod = 'Cash';
        else if (text.includes('cheque') || text.includes('check')) collected.paymentMethod = 'Cheque';
        else if (text.includes('wire') || text.includes('swift')) collected.paymentMethod = 'Wire';

        const custMatch = rawText.match(/(?:from|by|for|customer|client)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
        if (custMatch) collected.customerName = custMatch[1];
        else if (!collected.customerName) {
          const found = customers.find(c => text.includes(c.name.toLowerCase()));
          if (found) collected.customerName = found.name;
        }

        if (text.includes('delhi')) collected.location = 'Delhi Atelier';
        else if (text.includes('mumbai')) collected.location = 'Mumbai Flagship';
        else if (text.includes('london')) collected.location = 'London Studio';
        else if (text.includes('dubai')) collected.location = 'Dubai Galleria';

        // Check missing
        const missing: string[] = [];
        if (!collected.customerName) missing.push('customerName');
        if (!collected.amount || collected.amount <= 0) missing.push('amount');
        if (!collected.paymentMethod) missing.push('paymentMethod');

        if (missing.length === 0) {
          const finalAmount = Number(collected.amount);
          const finalClient = collected.customerName || 'Valued Client';
          const finalMethod = collected.paymentMethod || 'Bank Transfer';
          const finalLoc = collected.location || activeLocation || 'Mumbai Flagship';

          return {
            status: 'ready',
            reply: `✅ [RECORD ADDED] The new Payment Ledger record for "${finalClient}" of ₹${finalAmount.toLocaleString()} via ${finalMethod} has been successfully created and recorded into the financial ledger.`,
            summary: `Payment Recorded: ₹${finalAmount.toLocaleString()} • ${finalClient}`,
            action: {
              actionType: 'RECORD_PAYMENT',
              mutationType: 'added',
              entityType: 'Payment Ledger',
              recordName: `Payment: ${finalClient} (₹${finalAmount.toLocaleString()})`,
              finalState: {
                status: 'Reconciled in Atelier Ledger (Inflow)',
                amount: finalAmount,
                client: finalClient,
                method: finalMethod,
                location: finalLoc
              },
              amount: finalAmount,
              customerName: finalClient,
              location: finalLoc,
              paymentType: collected.paymentType || 'customer_advance',
              category: 'Inflow',
              paymentMethod: finalMethod,
              description: `Payment received from ${finalClient} (${finalLoc}) via ${finalMethod}`
            },
            pendingAction: null,
            suggestedNextActions: ['View in Payments Ledger', 'Record another payment', 'Check gold rates']
          };
        } else {
          let question = '';
          if (missing.includes('amount') && missing.includes('paymentMethod')) {
            question = `Could you specify the payment amount (₹) and payment method (e.g., Bank Transfer, UPI, or Cash) for ${collected.customerName || 'the client'}?`;
          } else if (missing.includes('amount')) {
            question = `What is the payment amount (₹) for ${collected.customerName || 'the client'}?`;
          } else if (missing.includes('paymentMethod')) {
            question = `Was the payment of ₹${Number(collected.amount || 0).toLocaleString()} received via Bank Transfer, UPI, Card, or Cash?`;
          } else {
            question = `Who is this payment from?`;
          }

          return {
            status: 'needs_clarification',
            reply: question,
            summary: 'Awaiting Payment Details',
            action: null,
            pendingAction: {
              actionType: 'RECORD_PAYMENT',
              collectedFields: collected,
              missingFields: missing,
              clarifyingQuestion: question
            },
            suggestedNextActions: missing.includes('paymentMethod') ? [
              `${collected.amount ? `₹${Number(collected.amount).toLocaleString()} ` : ''}via Bank Transfer`,
              `${collected.amount ? `₹${Number(collected.amount).toLocaleString()} ` : ''}via UPI`,
              `${collected.amount ? `₹${Number(collected.amount).toLocaleString()} ` : ''}in Cash`
            ] : [
              '₹50,000 via Bank Transfer',
              '₹1,00,000 via UPI',
              '₹25,000 in Cash'
            ]
          };
        }
      }

      if (type === 'ADD_CUSTOMER') {
        const phoneMatch = rawText.match(/(?:\+91|91)?[0-9]{10}/);
        if (phoneMatch) collected.phone = phoneMatch[0];
        const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) collected.email = emailMatch[0];

        if (text.includes('delhi')) collected.location = 'Delhi Atelier';
        else if (text.includes('mumbai')) collected.location = 'Mumbai Flagship';
        else if (text.includes('london')) collected.location = 'London Studio';
        else if (text.includes('dubai')) collected.location = 'Dubai Galleria';
        else if (text.includes('kolkata')) collected.location = 'Kolkata';
        else if (text.includes('bangalore')) collected.location = 'Bangalore';

        const nameMatch = rawText.match(/(?:name|is|client|customer)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
        if (nameMatch) collected.name = nameMatch[1];

        const missing: string[] = [];
        if (!collected.name) missing.push('name');
        if (!collected.phone && !collected.email) missing.push('phone/email');
        if (!collected.location) missing.push('location');

        if (missing.length === 0) {
          return {
            status: 'ready',
            reply: `✅ [RECORD ADDED] The new Customer CRM profile for "${collected.name}" (${collected.location}, Contact: ${collected.phone || collected.email}) has been successfully created and saved to the atelier database.`,
            summary: `New Client Added: ${collected.name}`,
            action: {
              actionType: 'ADD_CUSTOMER',
              mutationType: 'added',
              entityType: 'Customer',
              recordName: collected.name,
              finalState: {
                status: 'Active VIP Profile in CRM',
                location: collected.location,
                phone: collected.phone || 'N/A',
                email: collected.email || 'N/A',
                leadSource: collected.leadSource || 'Walk-in'
              },
              name: collected.name,
              phone: collected.phone || '',
              email: collected.email || '',
              location: collected.location,
              area: collected.location,
              leadSource: collected.leadSource || 'Walk-in',
              notes: 'Added via LUMORA Voice Concierge'
            },
            pendingAction: null,
            suggestedNextActions: ['View in Customers CRM', 'Create bespoke order for this client', 'Record an advance payment']
          };
        } else {
          const question = `Could you please provide ${collected.name ? `${collected.name}'s` : "the client's"} ${missing.join(' and ')}?`;
          return {
            status: 'needs_clarification',
            reply: question,
            summary: 'Awaiting Customer Details',
            action: null,
            pendingAction: {
              actionType: 'ADD_CUSTOMER',
              collectedFields: collected,
              missingFields: missing,
              clarifyingQuestion: question
            },
            suggestedNextActions: [
              '+91 9820011223, Mumbai Flagship',
              '+91 9911223344, Delhi Atelier',
              'client@luxuryjewelry.com, London Studio'
            ]
          };
        }
      }

      if (type === 'CREATE_BESPOKE_ORDER') {
        const amountMatch = rawText.match(/(?:₹|rs\.?|inr|\$)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/i);
        if (amountMatch) {
          const val = parseFloat(amountMatch[1].replace(/,/g, ''));
          if (val > 0) collected.totalAmount = val;
        }

        if (text.includes('gold')) collected.metalType = text.includes('rose') ? 'Rose Gold' : (text.includes('white') ? 'White Gold' : 'Yellow Gold');
        else if (text.includes('platinum')) collected.metalType = 'Platinum';

        if (text.includes('18k')) collected.metalPurity = '18K (75.0%)';
        else if (text.includes('22k')) collected.metalPurity = '22K (91.6%)';
        else if (text.includes('24k')) collected.metalPurity = '24K (99.9%)';
        else if (text.includes('14k')) collected.metalPurity = '14K (58.3%)';

        if (rawText.length > 8 && !rawText.match(/^[0-9]+$/)) {
          collected.specifications = (collected.specifications ? collected.specifications + '. ' : '') + rawText;
        }

        const missing: string[] = [];
        if (!collected.customerName) missing.push('customerName');
        if (!collected.specifications && !collected.metalType) missing.push('specifications');
        if (!collected.totalAmount) missing.push('totalAmount');

        if (missing.length === 0) {
          const finalTot = Number(collected.totalAmount);
          const finalAdv = collected.advancePaid || Math.round(finalTot * 0.4);
          return {
            status: 'ready',
            reply: `✅ [RECORD ADDED] The new Bespoke Order for "${collected.customerName}" (Spec: ${collected.specifications || collected.metalType}, Total: ₹${finalTot.toLocaleString()}, Advance: ₹${finalAdv.toLocaleString()}) has been successfully created and added to the production queue.`,
            summary: `Bespoke Order: ${collected.customerName} (₹${finalTot.toLocaleString()})`,
            action: {
              actionType: 'CREATE_BESPOKE_ORDER',
              mutationType: 'added',
              entityType: 'Bespoke Order',
              recordName: `Bespoke Order: ${collected.customerName}`,
              finalState: {
                status: 'In Production Queue (Craftsman Assigned)',
                customer: collected.customerName,
                totalAmount: finalTot,
                advancePaid: finalAdv,
                metal: collected.metalType || 'Yellow Gold'
              },
              customerName: collected.customerName,
              metalType: collected.metalType || 'Yellow Gold',
              metalPurity: collected.metalPurity || '18K (75.0%)',
              specifications: collected.specifications || 'Custom jewelry commission',
              totalAmount: finalTot,
              advancePaid: finalAdv
            },
            pendingAction: null,
            suggestedNextActions: ['View in Bespoke Atelier', 'Record advance payment', 'Assign Master Goldsmith']
          };
        } else {
          const question = `What are the jewelry specifications (metal/stones) and estimated budget for ${collected.customerName || 'this order'}?`;
          return {
            status: 'needs_clarification',
            reply: question,
            summary: 'Awaiting Bespoke Specifications',
            action: null,
            pendingAction: {
              actionType: 'CREATE_BESPOKE_ORDER',
              collectedFields: collected,
              missingFields: missing,
              clarifyingQuestion: question
            },
            suggestedNextActions: [
              '18K Yellow Gold Solitaire Ring, ₹1,50,000',
              'Platinum Diamond Halo Pendant, ₹2,20,000',
              '18K Rose Gold Emerald Bracelet, ₹1,80,000'
            ]
          };
        }
      }
    }

    // B. Fresh Commands without pending action - check if complete or needs clarification:

    // 0. Deletion Commands (Delete Product / Customer / Order)
    if (text.startsWith('delete product') || text.startsWith('remove product') || text.includes('delete product from inventory') || text.includes('remove from catalog')) {
      const match = rawText.replace(/^(?:delete|remove)\s+product\s+/i, '').trim();
      const matchedProd = products.find(p => p.sku.toLowerCase() === match.toLowerCase() || p.name.toLowerCase().includes(match.toLowerCase()) || match.toLowerCase().includes(p.name.toLowerCase()));
      const targetSku = matchedProd?.sku || match;
      const targetName = matchedProd?.name || match;

      return {
        status: 'ready',
        reply: `🗑️ [RECORD DELETED] The Product record "${targetName}" (SKU: ${targetSku}) has been permanently deleted from the inventory catalog.`,
        summary: `Product Deleted: ${targetName}`,
        action: {
          actionType: 'DELETE_PRODUCT',
          mutationType: 'deleted',
          entityType: 'Product',
          recordName: targetName,
          recordIdentifier: targetSku,
          finalState: {
            status: 'Permanently Removed from Catalog',
            sku: targetSku,
            deletedAt: new Date().toLocaleTimeString()
          },
          sku: targetSku,
          name: targetName
        },
        pendingAction: null,
        suggestedNextActions: ['View Inventory Catalog', 'Add new product', 'Check audit log']
      };
    }

    if (text.startsWith('delete customer') || text.startsWith('remove customer') || text.startsWith('delete client') || text.startsWith('remove client')) {
      const match = rawText.replace(/^(?:delete|remove)\s+(?:customer|client)\s+/i, '').trim();
      const matchedCust = customers.find(c => c.name.toLowerCase().includes(match.toLowerCase()) || match.toLowerCase().includes(c.name.toLowerCase()) || c.id.toLowerCase() === match.toLowerCase());
      const targetName = matchedCust?.name || match;
      const targetId = matchedCust?.id || 'CUST-REC';

      return {
        status: 'ready',
        reply: `🗑️ [RECORD DELETED] The Customer CRM record for "${targetName}" (${targetId}) has been permanently deleted from the atelier records.`,
        summary: `Customer Deleted: ${targetName}`,
        action: {
          actionType: 'DELETE_CUSTOMER',
          mutationType: 'deleted',
          entityType: 'Customer',
          recordName: targetName,
          recordIdentifier: targetId,
          finalState: {
            status: 'Purged from Customer Database',
            customerName: targetName,
            deletedAt: new Date().toLocaleTimeString()
          },
          name: targetName,
          id: targetId
        },
        pendingAction: null,
        suggestedNextActions: ['View Customers CRM', 'Add new client', 'Check ledger']
      };
    }

    if (text.startsWith('delete order') || text.startsWith('cancel order') || text.startsWith('cancel bespoke')) {
      const match = rawText.replace(/^(?:delete|cancel)\s+(?:order|bespoke|bespoke order)\s+/i, '').trim();
      const matchedOrder = bespokeOrders.find(o => o.id.toLowerCase() === match.toLowerCase() || o.customerName.toLowerCase().includes(match.toLowerCase()));
      const targetId = matchedOrder?.id || match || 'BES-ORD';
      const custName = matchedOrder?.customerName || 'Client';

      return {
        status: 'ready',
        reply: `🗑️ [RECORD DELETED] The Bespoke Order record "${targetId}" for ${custName} has been cancelled and removed from the atelier production queue.`,
        summary: `Order Cancelled: ${targetId}`,
        action: {
          actionType: 'DELETE_ORDER',
          mutationType: 'deleted',
          entityType: 'Bespoke Order',
          recordName: `${targetId} (${custName})`,
          recordIdentifier: targetId,
          finalState: {
            status: 'Cancelled & Removed from Production Queue',
            orderId: targetId,
            deletedAt: new Date().toLocaleTimeString()
          },
          orderId: targetId
        },
        pendingAction: null,
        suggestedNextActions: ['View Bespoke Orders', 'Create new order', 'Check craftsmen']
      };
    }

    // 1. Multi-image or Product creation
    if (currentImages.length > 0 || text.includes('add product') || text.includes('create product') || text.includes('new product') || text.includes('upload product') || text.includes('new ring') || text.includes('new necklace') || text.includes('new bracelet') || text.includes('new earring')) {
      const priceMatch = rawText.match(/(?:₹|rs\.?|inr|\$)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/i);
      const extractedPrice = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : (currentImages.length > 0 ? 85000 : null);
      const stockMatch = rawText.match(/([0-9]+)\s*(?:units|pcs|pieces|stock|items)/i);
      const extractedStock = stockMatch ? parseInt(stockMatch[1]) : 1;

      let category = 'Rings';
      if (text.includes('necklace') || text.includes('pendant') || text.includes('chain')) category = 'Necklaces';
      else if (text.includes('earring') || text.includes('stud') || text.includes('jhumka')) category = 'Earrings';
      else if (text.includes('bracelet') || text.includes('bangle') || text.includes('cuff')) category = 'Bracelets';
      else if (text.includes('bespoke') || text.includes('custom')) category = 'Bespoke';

      let material = '18K Yellow Gold with Diamonds';
      if (text.includes('rose gold')) material = '18K Rose Gold with VVS Diamonds';
      else if (text.includes('white gold')) material = '18K White Gold with Solitaire Diamond';
      else if (text.includes('platinum')) material = 'Platinum 950 with Fine Diamonds';
      else if (text.includes('silver')) material = 'Sterling Silver 925';

      const productName = rawText.length > 5 && !rawText.startsWith('http') ? rawText.slice(0, 45).replace(/^(create|add|upload|new)\s+/i, '') : `Royal ${category.slice(0, -1)} Masterpiece`;

      // If user typed "create product" with no photo and no price
      if (currentImages.length === 0 && !extractedPrice && !text.includes('gold') && !text.includes('diamond')) {
        const question = `What is the name, category, and retail price (₹) for the new jewelry piece?`;
        return {
          status: 'needs_clarification',
          reply: question,
          summary: 'Awaiting Product Specifications',
          action: null,
          pendingAction: {
            actionType: 'ADD_PRODUCT',
            collectedFields: { name: productName, category },
            missingFields: ['price', 'material'],
            clarifyingQuestion: question
          },
          suggestedNextActions: [
            '₹1,25,000, 18K Yellow Gold & Diamonds',
            '₹85,000, 18K Rose Gold Solitaire',
            '₹2,40,000, Platinum & Diamonds'
          ]
        };
      }

      const finalPrice = extractedPrice || 85000;
      return {
        status: 'ready',
        reply: `✅ [RECORD ADDED] The new Product record "${productName}" (Category: ${category}, Price: ₹${finalPrice.toLocaleString()}, Stock: ${extractedStock} units) has been successfully created and added to the inventory catalog.`,
        summary: `Created Product: ${productName} (₹${finalPrice.toLocaleString()})`,
        action: {
          actionType: 'ADD_PRODUCT',
          mutationType: 'added',
          entityType: 'Product',
          recordName: productName,
          finalState: {
            status: 'Active in Inventory Catalog',
            category,
            price: finalPrice,
            stock: extractedStock,
            material
          },
          name: productName,
          category,
          price: finalPrice,
          stock: extractedStock,
          material,
          description: `Handcrafted ${category.slice(0, -1)} crafted in ${material} with premium atelier finishing.`,
          images: currentImages
        },
        pendingAction: null,
        suggestedNextActions: ['📸 Upload another product with multiple photos', 'View in Catalog', 'Adjust stock']
      };
    }

    // 2. Record Payment
    if (text.includes('payment') || text.includes('received') || text.includes('paid') || text.includes('advance')) {
      const amountMatch = rawText.match(/(?:₹|rs\.?|inr|\$)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/i);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;
      
      const custMatch = rawText.match(/(?:from|by|for|customer|client)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      const foundClient = custMatch ? custMatch[1] : customers.find(c => text.includes(c.name.toLowerCase()))?.name;

      let location = activeLocation;
      if (text.includes('delhi')) location = 'Delhi Atelier';
      else if (text.includes('mumbai')) location = 'Mumbai Flagship';
      else if (text.includes('london')) location = 'London Studio';
      else if (text.includes('dubai')) location = 'Dubai Galleria';

      let paymentMethod: string | null = null;
      if (text.includes('upi') || text.includes('gpay') || text.includes('phonepe')) paymentMethod = 'UPI';
      else if (text.includes('bank') || text.includes('transfer') || text.includes('neft') || text.includes('rtgs')) paymentMethod = 'Bank Transfer';
      else if (text.includes('card') || text.includes('credit')) paymentMethod = 'Credit Card';
      else if (text.includes('cash')) paymentMethod = 'Cash';
      else if (text.includes('cheque') || text.includes('check')) paymentMethod = 'Cheque';
      else if (text.includes('wire') || text.includes('swift')) paymentMethod = 'Wire';

      const missing: string[] = [];
      if (!foundClient) missing.push('customerName');
      if (!amount || amount <= 0) missing.push('amount');
      if (!paymentMethod) missing.push('paymentMethod');

      // If missing mandatory fields, ask clarifying questions
      if (missing.length > 0) {
        let question = '';
        if (missing.includes('amount') && missing.includes('paymentMethod')) {
          question = `I'd be glad to record this payment for ${foundClient || 'the client'}. Could you please specify the payment amount (₹) and payment method (e.g. UPI, Bank Transfer, or Cash)?`;
        } else if (missing.includes('amount')) {
          question = `What is the payment amount (₹) received from ${foundClient || 'the client'}?`;
        } else if (missing.includes('paymentMethod')) {
          question = `Was this payment of ₹${Number(amount || 0).toLocaleString()} received via Bank Transfer, UPI, Card, or Cash?`;
        } else {
          question = `Who is this payment from, and what is the payment method?`;
        }

        return {
          status: 'needs_clarification',
          reply: question,
          summary: 'Awaiting Payment Details',
          action: null,
          pendingAction: {
            actionType: 'RECORD_PAYMENT',
            collectedFields: {
              customerName: foundClient,
              amount: amount,
              paymentMethod: paymentMethod,
              location: location
            },
            missingFields: missing,
            clarifyingQuestion: question
          },
          suggestedNextActions: missing.includes('paymentMethod') ? [
            `${amount ? `₹${Number(amount).toLocaleString()} ` : ''}via Bank Transfer`,
            `${amount ? `₹${Number(amount).toLocaleString()} ` : ''}via UPI`,
            `${amount ? `₹${Number(amount).toLocaleString()} ` : ''}in Cash`
          ] : [
            '₹50,000 via Bank Transfer',
            '₹1,00,000 via UPI',
            '₹25,000 in Cash'
          ]
        };
      }

      const paymentType = text.includes('advance') ? 'customer_advance' : (text.includes('craftsman') ? 'craftsman_payment' : 'customer_final');

      return {
        status: 'ready',
        reply: `✅ [RECORD ADDED] The new Payment Ledger record for "${foundClient}" of ₹${amount.toLocaleString()} via ${paymentMethod} (${location}) has been successfully created and recorded into the atelier ledger.`,
        summary: `Payment Recorded: ₹${amount.toLocaleString()} • ${foundClient}`,
        action: {
          actionType: 'RECORD_PAYMENT',
          mutationType: 'added',
          entityType: 'Payment Ledger',
          recordName: `Payment: ${foundClient} (₹${amount.toLocaleString()})`,
          finalState: {
            status: 'Reconciled in Atelier Ledger (Inflow)',
            amount: amount,
            client: foundClient,
            method: paymentMethod,
            location
          },
          amount: amount,
          customerName: foundClient,
          location,
          paymentType,
          category: 'Inflow',
          paymentMethod,
          description: `Voice/AI Payment received from ${foundClient} (${location}) via ${paymentMethod}`
        },
        pendingAction: null,
        suggestedNextActions: ['View Payments Ledger', 'Record another payment', 'Check gold rates']
      };
    }

    // 3. Add Customer
    if (text.includes('add customer') || text.includes('new customer') || text.includes('new client') || text.includes('add client')) {
      const nameMatch = rawText.match(/(?:customer|client|add)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      const name = nameMatch ? nameMatch[1] : null;
      const phoneMatch = rawText.match(/(?:\+91|91)?[0-9]{10}/);
      const phone = phoneMatch ? phoneMatch[0] : '';
      let location = text.includes('delhi') ? 'Delhi Atelier' : (text.includes('mumbai') ? 'Mumbai Flagship' : (text.includes('london') ? 'London Studio' : ''));

      const missing: string[] = [];
      if (!name) missing.push('name');
      if (!phone) missing.push('phone');
      if (!location) missing.push('location');

      if (missing.length > 0) {
        const question = `To add ${name || 'the new customer'}, could you please provide their contact phone number and location (e.g. Mumbai, Delhi, London)?`;
        return {
          status: 'needs_clarification',
          reply: question,
          summary: 'Awaiting Customer Details',
          action: null,
          pendingAction: {
            actionType: 'ADD_CUSTOMER',
            collectedFields: {
              name: name || undefined,
              phone: phone || undefined,
              location: location || undefined
            },
            missingFields: missing,
            clarifyingQuestion: question
          },
          suggestedNextActions: [
            '+91 9820011223, Mumbai Flagship',
            '+91 9911223344, Delhi Atelier',
            'client@luxuryjewelry.com, London Studio'
          ]
        };
      }

      return {
        status: 'ready',
        reply: `✅ [RECORD ADDED] The new Customer CRM profile for "${name}" (${location}, Phone: ${phone}) has been successfully created and added into CRM.`,
        summary: `New Client Added: ${name}`,
        action: {
          actionType: 'ADD_CUSTOMER',
          mutationType: 'added',
          entityType: 'Customer',
          recordName: name,
          finalState: {
            status: 'Active VIP Client Profile in CRM',
            name,
            location,
            phone,
            leadSource: 'Walk-in'
          },
          name,
          phone,
          location,
          area: location,
          leadSource: 'Walk-in',
          notes: 'Added via LUMORA Voice Concierge'
        },
        pendingAction: null,
        suggestedNextActions: ['View in Customers CRM', 'Create bespoke order for this client', 'Record payment']
      };
    }

    // 4. Update Gold / Metal Rate
    if (text.includes('gold rate') || text.includes('metal rate') || text.includes('silver rate')) {
      const rateMatch = rawText.match(/([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/);
      const rate = rateMatch ? parseFloat(rateMatch[1].replace(/,/g, '')) : 84500;
      const ratePerGram = rate > 10000 ? rate / 10 : rate;

      return {
        status: 'ready',
        reply: `🔄 [RECORD UPDATED] The Metal Spot Rate records for India have been successfully updated to ₹${rate.toLocaleString()}/10g (₹${ratePerGram.toFixed(2)}/g) for 24K Gold. Dynamic jewelry valuations recalculated.`,
        summary: `Gold Rate Updated: ₹${rate.toLocaleString()}/10g`,
        action: {
          actionType: 'UPDATE_METAL_RATES',
          mutationType: 'updated',
          entityType: 'Metal Rates',
          recordName: 'India Metal Spot Rates',
          finalState: {
            status: 'Live Market Spot Rates Synced',
            gold24kPerGram: ratePerGram,
            gold24kPer10g: rate,
            silverPerGram: 95
          },
          market: 'india',
          gold24kPerGram: ratePerGram,
          silverPerGram: 95
        },
        pendingAction: null,
        suggestedNextActions: ['Check custom jewelry pricing', 'View metal inventory', 'Record a payment']
      };
    }

    // 5. Adjust stock
    if (text.includes('stock') || text.includes('inventory') || text.includes('quantity')) {
      const matchedProd = products.find(p => text.includes(p.name.toLowerCase()) || text.includes(p.sku.toLowerCase())) || products[0];
      const countMatch = rawText.match(/([0-9]+)\s*(?:units|pieces|pcs|qty|stock)?/i);
      const newStock = countMatch ? parseInt(countMatch[1]) : (matchedProd?.stock ? matchedProd.stock + 5 : 5);

      return {
        status: 'ready',
        reply: `🔄 [RECORD UPDATED] The Product Inventory record for "${matchedProd?.name || 'Item'}" (${matchedProd?.sku || 'SKU'}) has been successfully updated with a new stock count of ${newStock} units.`,
        summary: `Stock Updated: ${matchedProd?.name || 'Product'} → ${newStock} units`,
        action: {
          actionType: 'ADJUST_STOCK',
          mutationType: 'updated',
          entityType: 'Product',
          recordName: matchedProd?.name || 'Inventory Item',
          recordIdentifier: matchedProd?.sku || 'SKU',
          finalState: {
            status: `Updated Inventory Balance (${newStock} units available)`,
            stock: newStock,
            sku: matchedProd?.sku
          },
          productNameOrSku: matchedProd?.sku || 'SKU',
          newStock
        },
        pendingAction: null,
        suggestedNextActions: ['View in Inventory Hub', 'Upload new product', 'Check low stock items']
      };
    }

    // 6. Navigation
    if (text.includes('go to') || text.includes('open') || text.includes('show') || text.includes('take me to')) {
      let targetTab = 'dashboard';
      if (text.includes('payment') || text.includes('ledger')) targetTab = 'payments';
      else if (text.includes('order')) targetTab = 'orders';
      else if (text.includes('customer') || text.includes('crm')) targetTab = 'customers';
      else if (text.includes('inventory') || text.includes('product') || text.includes('catalog')) targetTab = 'inventory';
      else if (text.includes('bespoke') || text.includes('custom')) targetTab = 'custom';
      else if (text.includes('production') || text.includes('job')) targetTab = 'production';
      else if (text.includes('analytics') || text.includes('report')) targetTab = 'analytics';
      else if (text.includes('calculator')) targetTab = 'calculator';

      return {
        status: 'ready',
        reply: `Navigating to ${targetTab.toUpperCase()} hub.`,
        summary: `Opened ${targetTab}`,
        action: {
          actionType: 'NAVIGATE_TAB',
          mutationType: 'navigated',
          entityType: 'Navigation',
          targetTab
        },
        pendingAction: null
      };
    }

    // Generic response
    return {
      status: 'ready',
      reply: `I have received: "${rawText}". How else may I assist your atelier today?`,
      summary: 'Command Received',
      action: null,
      pendingAction: null
    };
  };

  const handleExecuteCommand = async (
    commandText?: string,
    isVoice = false,
    overrideImages?: string[],
    audioBase64?: string,
    audioMimeType?: string
  ) => {
    const currentImages = overrideImages !== undefined ? overrideImages : [...attachedImages];
    let query = (commandText || inputQuery).trim();

    if (!query && currentImages.length === 0 && !audioBase64) return;

    if (!query && currentImages.length > 0 && !audioBase64) {
      query = `Create new luxury jewelry product catalog entry from the attached ${currentImages.length} photo(s)`;
    }
    if (!query && audioBase64) {
      query = `🎙️ [Voice Audio Command Recorded]`;
    }

    setInputQuery('');
    setSpeechTranscript('');
    setAttachedImages([]);
    setIsProcessing(true);

    const userMessageId = `msg-u-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      text: query,
      images: currentImages.length > 0 ? currentImages : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoiceInput: isVoice
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      let apiResult: any = null;

      // Call server endpoint with Gemini (supports text, images, and audio recording)
      try {
        const response = await fetch('/api/ai-assistant/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query.startsWith('🎙️') ? '' : query,
            images: currentImages,
            audio: audioBase64,
            audioMimeType: audioMimeType || 'audio/webm',
            pendingAction: pendingAction,
            context: {
              customers: customers.map(c => ({ id: c.id, name: c.name, location: c.location, totalSpend: c.totalSpend })),
              products: products.map(p => ({ sku: p.sku, name: p.name, stock: p.stock, price: p.price })),
              goldRate24k: metalRates?.india?.gold?.['24k'] || 7819,
              silverRate: metalRates?.india?.silver?.['99.99'] || 95,
              activeLocation
            },
            conversationHistory: messages.slice(-6).map(m => ({ role: m.sender === 'user' ? 'user' : 'model', content: m.text }))
          })
        });

        if (response.ok) {
          apiResult = await response.json();
        } else {
          console.warn('API returned non-200, invoking fallback NLP parser');
          apiResult = parseLocallyFallback(query, currentImages, pendingAction);
        }
      } catch (networkErr) {
        console.warn('Network call failed, using local NLP parser:', networkErr);
        apiResult = parseLocallyFallback(query, currentImages, pendingAction);
      }

      if (!apiResult) {
        apiResult = parseLocallyFallback(query, currentImages, pendingAction);
      }

      // Execute Action directly against state handlers
      let executedActionRecord: AiVoiceAction | undefined;

      if (apiResult.action) {
        const act = apiResult.action;
        const actionType = act.actionType;

        if (actionType === 'RECORD_PAYMENT') {
          const res = onRecordPayment({
            amount: act.amount,
            customerName: act.customerName || 'Client',
            location: act.location || activeLocation,
            paymentType: act.paymentType || 'customer_advance',
            category: act.category || 'Inflow',
            paymentMethod: act.paymentMethod || 'Bank Transfer',
            relatedOrderId: act.relatedOrderId,
            description: act.description
          });

          const entryId = res.entry?.id || `LED-${Date.now().toString().slice(-6)}`;
          executedActionRecord = {
            id: `act-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'PAYMENT_RECORDED',
            mutationType: 'added',
            entityType: 'Payment Ledger',
            recordIdentifier: entryId,
            recordName: `Payment from ${act.customerName || 'Client'}`,
            summary: apiResult.actionSummary || `Recorded ₹${act.amount?.toLocaleString()} from ${act.customerName}`,
            details: {
              'Ledger ID': entryId,
              'Amount': `₹${(act.amount || 0).toLocaleString()}`,
              'Client': act.customerName || 'Client',
              'Location': act.location || activeLocation,
              'Method': act.paymentMethod || 'Bank Transfer',
              'Category': act.category || 'Inflow',
              'Final State': 'Reconciled in Financial Ledger'
            },
            finalState: {
              status: 'Reconciled in Atelier Financial Ledger (Inflow)',
              details: { amount: act.amount, client: act.customerName, method: act.paymentMethod },
              syncMessage: 'Record persisted and synced to financial database'
            },
            status: res.success ? 'executed' : 'failed',
            linkTab: 'payments',
            linkId: entryId
          };
        } else if (actionType === 'ADD_PRODUCT' && onAddProduct) {
          const res = onAddProduct({
            name: act.name || 'New Masterpiece',
            category: act.category || 'Rings',
            price: act.price || 85000,
            stock: act.stock !== undefined ? act.stock : 1,
            material: act.material || '18K Gold',
            description: act.description || 'Artisanal handcrafted luxury jewelry piece from the atelier.',
            images: act.images || (currentImages.length > 0 ? currentImages : undefined),
            sku: act.sku
          });

          const pSku = res.product?.sku || act.sku || 'SKU-GEN';
          const pName = res.product?.name || act.name || 'Masterpiece';
          executedActionRecord = {
            id: `act-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'PRODUCT_ADDED',
            mutationType: 'added',
            entityType: 'Product',
            recordIdentifier: pSku,
            recordName: pName,
            summary: apiResult.actionSummary || `Created Product: ${pName}`,
            details: {
              'Masterpiece': pName,
              'SKU': pSku,
              'Price': `₹${(res.product?.price || act.price || 85000).toLocaleString()}`,
              'Category': res.product?.category || act.category || 'Rings',
              'Material': res.product?.material || act.material || '18K Gold',
              'Stock': `${res.product?.stock ?? act.stock ?? 1} units`,
              'Photos Attached': `${(res.product?.images?.length || currentImages.length || 1)} photo(s)`,
              'Final State': 'Active in Inventory Catalog'
            },
            finalState: {
              status: `Active in Inventory Catalog (${res.product?.stock ?? act.stock ?? 1} units in stock)`,
              details: { name: pName, sku: pSku, price: res.product?.price || act.price },
              syncMessage: 'Record persisted and synced to product catalog'
            },
            status: res.success ? 'executed' : 'failed',
            linkTab: 'inventory',
            linkId: res.product?.id,
            productImages: res.product?.images || currentImages
          };
        } else if (actionType === 'ADD_CUSTOMER') {
          const res = onAddCustomer({
            name: act.name,
            email: act.email,
            phone: act.phone,
            location: act.location || activeLocation,
            area: act.area || act.location,
            leadSource: act.leadSource || 'Walk-in',
            ageGroup: act.ageGroup || '30-40',
            notes: act.notes
          });

          const cId = res.customer?.id || `CUST-${Date.now().toString().slice(-4)}`;
          executedActionRecord = {
            id: `act-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'CUSTOMER_ADDED',
            mutationType: 'added',
            entityType: 'Customer',
            recordIdentifier: cId,
            recordName: act.name,
            summary: apiResult.actionSummary || `New Client Added: ${act.name}`,
            details: {
              'Customer ID': cId,
              'Client Name': act.name,
              'Location': act.location || activeLocation,
              'Phone': act.phone || 'N/A',
              'Lead Source': act.leadSource || 'Walk-in',
              'Final State': 'Active VIP Profile in CRM'
            },
            finalState: {
              status: 'Active VIP Client Profile in CRM',
              details: { name: act.name, location: act.location, phone: act.phone },
              syncMessage: 'Customer record created and synced to CRM'
            },
            status: res.success ? 'executed' : 'failed',
            linkTab: 'customers',
            linkId: cId
          };
        } else if (actionType === 'ADJUST_STOCK') {
          const res = onAdjustStock({
            productNameOrSku: act.sku || act.productName || query,
            newStock: act.newStock,
            stockDelta: act.stockDelta,
            newPrice: act.newPrice
          });

          const pSku = res.product?.sku || act.sku || 'SKU';
          const pName = res.product?.name || act.productName || 'Inventory Item';
          const finalStock = res.product?.stock ?? act.newStock ?? 'Updated';

          executedActionRecord = {
            id: `act-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'STOCK_ADJUSTED',
            mutationType: 'updated',
            entityType: 'Product',
            recordIdentifier: pSku,
            recordName: pName,
            summary: apiResult.actionSummary || `Stock Updated: ${pName}`,
            details: {
              'Product': pName,
              'SKU': pSku,
              'Updated Stock Count': `${finalStock} units`,
              'Final State': `Active in Catalog (${finalStock} units available)`
            },
            finalState: {
              status: `Inventory Stock Updated to ${finalStock} units`,
              details: { sku: pSku, stock: finalStock },
              syncMessage: 'Stock balance synchronized with atelier inventory'
            },
            status: res.success ? 'executed' : 'failed',
            linkTab: 'inventory'
          };
        } else if (actionType === 'CREATE_BESPOKE_ORDER') {
          const res = onCreateBespokeOrder({
            customerName: act.customerName || 'Client',
            customerPhone: act.customerPhone,
            metalType: act.metalType || 'Yellow Gold',
            metalPurity: act.metalPurity || '18K (75.0%)',
            metalWeight: act.metalWeight || 6.5,
            specifications: act.specifications || 'Bespoke design custom commission',
            totalAmount: act.totalAmount || 120000,
            advancePaid: act.advancePaid || 30000,
            stonesSummary: act.stonesSummary
          });

          const orderId = res.order?.id || `BES-${Date.now().toString().slice(-4)}`;
          executedActionRecord = {
            id: `act-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'BESPOKE_ORDER_CREATED',
            mutationType: 'added',
            entityType: 'Bespoke Order',
            recordIdentifier: orderId,
            recordName: `Bespoke Order (${act.customerName})`,
            summary: apiResult.actionSummary || `Bespoke Order: ${act.customerName}`,
            details: {
              'Order ID': orderId,
              'Client': act.customerName,
              'Metal': `${act.metalPurity || '18K'} ${act.metalType || 'Gold'}`,
              'Total Quote': `₹${(act.totalAmount || 120000).toLocaleString()}`,
              'Advance': `₹${(act.advancePaid || 30000).toLocaleString()}`,
              'Final State': 'In Production Queue (Craftsman Assigned)'
            },
            finalState: {
              status: 'In Production Queue (Craftsman Assigned)',
              details: { orderId, client: act.customerName, total: act.totalAmount },
              syncMessage: 'Bespoke order created and logged in atelier workflow'
            },
            status: res.success ? 'executed' : 'failed',
            linkTab: 'custom',
            linkId: orderId
          };
        } else if (actionType === 'UPDATE_METAL_RATES') {
          const res = onUpdateMetalRates({
            market: act.market || 'india',
            gold24kPerGram: act.gold24kPerGram,
            silverPerGram: act.silverPerGram,
            notes: act.notes
          });

          const g10g = (act.gold24kPerGram || 0) * 10;
          executedActionRecord = {
            id: `act-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'METAL_RATES_UPDATED',
            mutationType: 'updated',
            entityType: 'Metal Rates',
            recordName: `${(act.market || 'India').toUpperCase()} Spot Rates`,
            summary: apiResult.actionSummary || `Metal Rates Updated (Gold: ₹${g10g.toLocaleString()}/10g)`,
            details: {
              '24K Gold / 10g': `₹${g10g.toLocaleString()}`,
              '24K Gold / g': `₹${(act.gold24kPerGram || 0).toFixed(2)}`,
              'Market': act.market || 'India',
              'Final State': 'Live Spot Rates Synced'
            },
            finalState: {
              status: 'Live Market Spot Rates Synced & Active',
              details: { goldRate: g10g, market: act.market || 'India' },
              syncMessage: 'Dynamic gold rates propagated to all product valuations'
            },
            status: res.success ? 'executed' : 'failed',
            linkTab: 'dashboard'
          };
        } else if (actionType === 'LOG_REPAIR') {
          const res = onLogRepair({
            customerName: act.customerName || 'Client',
            customerPhone: act.customerPhone,
            itemDescription: act.itemDescription || 'Jewelry Piece',
            repairDetails: act.repairDetails || 'Servicing & Polish',
            costEstimate: act.costEstimate || 3500
          });

          const repId = res.repair?.id || `REP-${Date.now().toString().slice(-4)}`;
          executedActionRecord = {
            id: `act-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'REPAIR_LOGGED',
            mutationType: 'added',
            entityType: 'Repair Job',
            recordIdentifier: repId,
            recordName: `Repair: ${act.customerName} (${act.itemDescription})`,
            summary: apiResult.actionSummary || `Repair Logged: ${act.customerName} (${act.itemDescription})`,
            details: {
              'Job ID': repId,
              'Client': act.customerName,
              'Item': act.itemDescription,
              'Repair Details': act.repairDetails,
              'Estimate': `₹${(act.costEstimate || 0).toLocaleString()}`,
              'Final State': 'Received for Atelier Servicing'
            },
            finalState: {
              status: 'Received for Quality Servicing & Repair',
              details: { repId, item: act.itemDescription, client: act.customerName },
              syncMessage: 'Repair job created and logged in craftsman queue'
            },
            status: res.success ? 'executed' : 'failed',
            linkTab: 'production',
            linkId: repId
          };
        } else if (actionType === 'DELETE_PRODUCT' && onDeleteProduct) {
          const target = act.sku || act.name || act.productName || query;
          const res = onDeleteProduct(target);
          const pName = res.product?.name || act.name || target;
          const pSku = res.product?.sku || act.sku || target;

          executedActionRecord = {
            id: `act-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'PRODUCT_DELETED',
            mutationType: 'deleted',
            entityType: 'Product',
            recordIdentifier: pSku,
            recordName: pName,
            summary: apiResult.actionSummary || `Deleted Product: ${pName}`,
            details: {
              'Deleted Masterpiece': pName,
              'SKU': pSku,
              'Final State': 'Permanently Removed from Inventory Database'
            },
            finalState: {
              status: 'Permanently Removed from Catalog',
              details: { name: pName, sku: pSku },
              syncMessage: 'Product record deleted from atelier database'
            },
            status: res.success ? 'executed' : 'failed',
            linkTab: 'inventory'
          };
        } else if (actionType === 'DELETE_CUSTOMER' && onDeleteCustomer) {
          const target = act.id || act.name || act.customerName || query;
          const res = onDeleteCustomer(target);
          const cName = res.customer?.name || act.name || target;
          const cId = res.customer?.id || act.id || 'CUST';

          executedActionRecord = {
            id: `act-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'CUSTOMER_DELETED',
            mutationType: 'deleted',
            entityType: 'Customer',
            recordIdentifier: cId,
            recordName: cName,
            summary: apiResult.actionSummary || `Deleted Customer: ${cName}`,
            details: {
              'Removed Customer': cName,
              'Customer ID': cId,
              'Final State': 'Purged from CRM Records'
            },
            finalState: {
              status: 'Purged from Customer CRM Database',
              details: { name: cName, id: cId },
              syncMessage: 'Customer record deleted from database'
            },
            status: res.success ? 'executed' : 'failed',
            linkTab: 'customers'
          };
        } else if (actionType === 'DELETE_ORDER' && onDeleteOrder) {
          const target = act.orderId || act.id || act.customerName || query;
          const res = onDeleteOrder(target);
          const oId = res.order?.id || act.orderId || target;

          executedActionRecord = {
            id: `act-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'ORDER_DELETED',
            mutationType: 'deleted',
            entityType: 'Bespoke Order',
            recordIdentifier: oId,
            recordName: `Order ${oId}`,
            summary: apiResult.actionSummary || `Cancelled Order: ${oId}`,
            details: {
              'Cancelled Order ID': oId,
              'Final State': 'Cancelled & Removed from Production Queue'
            },
            finalState: {
              status: 'Cancelled and Removed from Production Queue',
              details: { orderId: oId },
              syncMessage: 'Order purged from workflow queue'
            },
            status: res.success ? 'executed' : 'failed',
            linkTab: 'custom'
          };
        } else if (actionType === 'UPDATE_PRODUCT' && onUpdateProduct) {
          const target = act.sku || act.id || act.name || query;
          const res = onUpdateProduct({ idOrSku: target, updates: act.updates || act });
          const pName = res.product?.name || act.name || target;

          executedActionRecord = {
            id: `act-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'PRODUCT_UPDATED',
            mutationType: 'updated',
            entityType: 'Product',
            recordIdentifier: res.product?.sku || act.sku,
            recordName: pName,
            summary: apiResult.actionSummary || `Updated Product: ${pName}`,
            details: {
              'Product': pName,
              'SKU': res.product?.sku || 'SKU',
              'Final State': 'Active in Catalog (Details Updated)'
            },
            finalState: {
              status: 'Active in Catalog (Details Updated)',
              details: { name: pName },
              syncMessage: 'Product attributes updated in database'
            },
            status: res.success ? 'executed' : 'failed',
            linkTab: 'inventory'
          };
        } else if (actionType === 'UPDATE_CUSTOMER' && onUpdateCustomer) {
          const target = act.id || act.name || query;
          const res = onUpdateCustomer({ idOrName: target, updates: act.updates || act });
          const cName = res.customer?.name || act.name || target;

          executedActionRecord = {
            id: `act-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'CUSTOMER_UPDATED',
            mutationType: 'updated',
            entityType: 'Customer',
            recordIdentifier: res.customer?.id || act.id,
            recordName: cName,
            summary: apiResult.actionSummary || `Updated Customer: ${cName}`,
            details: {
              'Customer': cName,
              'Final State': 'Profile Details Updated in CRM'
            },
            finalState: {
              status: 'Profile Details Updated in CRM',
              details: { name: cName },
              syncMessage: 'Customer attributes updated in database'
            },
            status: res.success ? 'executed' : 'failed',
            linkTab: 'customers'
          };
        } else if (actionType === 'NAVIGATE_TAB') {
          if (act.targetTab) {
            onNavigateTab(act.targetTab);
          }
        }

        if (executedActionRecord) {
          setRecentActionHistory(prev => [executedActionRecord!, ...prev]);
        }
      }

      // Update pending action state machine
      if (apiResult.status === 'needs_clarification' || apiResult.pendingAction) {
        setPendingAction(apiResult.pendingAction || null);
      } else if (apiResult.status === 'cancelled') {
        setPendingAction(null);
      } else {
        setPendingAction(null);
      }

      // Build explicit final state confirmation in assistant text
      let confirmedReplyText = apiResult.reply || 'Request completed successfully.';
      if (executedActionRecord) {
        const mType = executedActionRecord.mutationType;
        const eType = executedActionRecord.entityType || 'Record';
        const rName = executedActionRecord.recordName || 'Item';
        const rId = executedActionRecord.recordIdentifier ? ` (ID/SKU: ${executedActionRecord.recordIdentifier})` : '';

        const hasTag = confirmedReplyText.includes('[RECORD ADDED]') || 
                       confirmedReplyText.includes('[RECORD UPDATED]') || 
                       confirmedReplyText.includes('[RECORD DELETED]');

        if (!hasTag) {
          if (mType === 'added') {
            confirmedReplyText = `✅ [RECORD ADDED] The new ${eType} record "${rName}"${rId} has been successfully created and saved to the atelier database.

${confirmedReplyText}`;
          } else if (mType === 'updated') {
            confirmedReplyText = `🔄 [RECORD UPDATED] The ${eType} record for "${rName}"${rId} has been successfully updated in the atelier database.

${confirmedReplyText}`;
          } else if (mType === 'deleted') {
            confirmedReplyText = `🗑️ [RECORD DELETED] The ${eType} record "${rName}"${rId} has been permanently deleted from the atelier records.

${confirmedReplyText}`;
          }
        }
      }

      const assistantMsg: ChatMessage = {
        id: `msg-a-${Date.now()}`,
        sender: 'assistant',
        text: confirmedReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: executedActionRecord,
        pendingAction: apiResult.pendingAction || null,
        suggestedPrompts: apiResult.suggestedNextActions || (apiResult.pendingAction ? [] : [
          '📸 Upload another product with multiple photos',
          'View product catalog in Inventory',
          'Record a customer payment',
          'Check current gold rates'
        ])
      };

      setMessages(prev => [...prev, assistantMsg]);
      speakResponse(confirmedReplyText);
    } catch (err: any) {
      console.error('Command execution error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: `Error processing command: ${err.message || 'Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- DIRECT QUICK RECORD SUBMISSION HANDLERS ---
  const submitQuickRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(qpAmount.replace(/,/g, ''));
    if (!amountNum || isNaN(amountNum)) return;
    const clientName = qpClient.trim() || 'Valued Client';
    const loc = qpLocation || activeLocation || 'Mumbai Flagship';

    const res = onRecordPayment({
      amount: amountNum,
      customerName: clientName,
      location: loc,
      paymentType: qpType,
      category: 'Inflow',
      paymentMethod: qpMethod,
      description: qpNotes || `Quick recorded payment from ${clientName} via ${qpMethod}`
    });

    const entryId = res.entry?.id || `LED-${Date.now().toString().slice(-6)}`;
    const actionRecord: AiVoiceAction = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'PAYMENT_RECORDED',
      mutationType: 'added',
      entityType: 'Payment Ledger',
      recordIdentifier: entryId,
      recordName: `Payment: ${clientName} (₹${amountNum.toLocaleString()})`,
      summary: `Payment Recorded: ₹${amountNum.toLocaleString()} from ${clientName}`,
      details: {
        'Ledger Entry ID': entryId,
        'Amount': `₹${amountNum.toLocaleString()}`,
        'Client': clientName,
        'Method': qpMethod,
        'Type': qpType === 'customer_advance' ? 'Customer Advance' : qpType === 'customer_final' ? 'Final Settlement' : 'Direct Sale',
        'Location': loc,
        'Final State': 'Reconciled in Atelier Financial Ledger'
      },
      status: 'executed',
      linkTab: 'payments',
      linkId: entryId
    };

    setRecentActionHistory(prev => [actionRecord, ...prev]);

    const confirmMsg: ChatMessage = {
      id: `msg-r-${Date.now()}`,
      sender: 'assistant',
      text: `✅ [RECORD ADDED] The new Payment Ledger record for "${clientName}" of ₹${amountNum.toLocaleString()} via ${qpMethod} has been successfully created and recorded into the financial ledger.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: actionRecord,
      suggestedPrompts: ['View in Payments Ledger', 'Record another payment', 'Check gold rates']
    };

    setMessages(prev => [...prev, confirmMsg]);
    speakResponse(`Payment of ₹${amountNum.toLocaleString()} from ${clientName} has been recorded into the ledger.`);
    setActiveQuickRecord('none');
    setQpClient('');
    setQpAmount('');
    setQpNotes('');
  };

  const submitQuickAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qcName.trim()) return;
    const clientName = qcName.trim();
    const loc = qcLocation || activeLocation || 'Mumbai Flagship';

    const res = onAddCustomer({
      name: clientName,
      phone: qcPhone.trim() || '+91 9820011223',
      email: qcEmail.trim() || `${clientName.toLowerCase().replace(/\s+/g, '.')}@luxuryclient.com`,
      location: loc,
      area: loc,
      leadSource: qcSource || 'Walk-in',
      notes: 'Recorded via LUMORA Quick Action'
    });

    const custId = res.customer?.id || `CUST-${Date.now().toString().slice(-4)}`;
    const actionRecord: AiVoiceAction = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'CUSTOMER_ADDED',
      mutationType: 'added',
      entityType: 'Customer',
      recordIdentifier: custId,
      recordName: clientName,
      summary: `VIP Client Added: ${clientName}`,
      details: {
        'Customer ID': custId,
        'Name': clientName,
        'Phone': qcPhone.trim() || 'N/A',
        'Email': qcEmail.trim() || 'N/A',
        'Location': loc,
        'Lead Source': qcSource,
        'Final State': 'Active VIP Client Profile in CRM'
      },
      status: 'executed',
      linkTab: 'crm',
      linkId: custId
    };

    setRecentActionHistory(prev => [actionRecord, ...prev]);

    const confirmMsg: ChatMessage = {
      id: `msg-r-${Date.now()}`,
      sender: 'assistant',
      text: `✅ [RECORD ADDED] The new Customer CRM profile for "${clientName}" (${loc}) has been successfully created and saved to the atelier database.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: actionRecord,
      suggestedPrompts: ['View in Customers CRM', 'Create bespoke order for this client', 'Record a payment']
    };

    setMessages(prev => [...prev, confirmMsg]);
    speakResponse(`Customer profile for ${clientName} has been saved.`);
    setActiveQuickRecord('none');
    setQcName('');
    setQcPhone('');
    setQcEmail('');
  };

  const submitQuickCreateBespoke = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qbClient.trim()) return;
    const clientName = qbClient.trim();
    const totalNum = parseFloat(qbTotal.replace(/,/g, '')) || 150000;
    const advNum = parseFloat(qbAdvance.replace(/,/g, '')) || 0;

    const res = onCreateBespokeOrder({
      customerName: clientName,
      metalType: qbMetal,
      metalPurity: qbPurity,
      specifications: qbSpecs.trim() || 'Bespoke hand-crafted jewelry commission',
      totalAmount: totalNum,
      advancePayment: advNum
    });

    const orderId = res.order?.id || `BSK-${Date.now().toString().slice(-4)}`;
    const actionRecord: AiVoiceAction = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'BESPOKE_ORDER_CREATED',
      mutationType: 'added',
      entityType: 'Bespoke Order',
      recordIdentifier: orderId,
      recordName: `Bespoke Commission (${clientName})`,
      summary: `Bespoke Order Created: ${clientName} (₹${totalNum.toLocaleString()})`,
      details: {
        'Order ID': orderId,
        'Client': clientName,
        'Metal & Purity': `${qbMetal} • ${qbPurity}`,
        'Specifications': qbSpecs.trim() || 'High Jewelry Commission',
        'Total Quote': `₹${totalNum.toLocaleString()}`,
        'Advance Paid': `₹${advNum.toLocaleString()}`,
        'Final State': 'Active in Production & Atelier Bespoke Queue'
      },
      status: 'executed',
      linkTab: 'bespoke',
      linkId: orderId
    };

    setRecentActionHistory(prev => [actionRecord, ...prev]);

    const confirmMsg: ChatMessage = {
      id: `msg-r-${Date.now()}`,
      sender: 'assistant',
      text: `✅ [RECORD ADDED] The new Bespoke Order record for "${clientName}" (Order ${orderId}) has been successfully created and queued in production.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: actionRecord,
      suggestedPrompts: ['View in Bespoke Atelier', 'Assign to Master Craftsman', 'Record advance payment']
    };

    setMessages(prev => [...prev, confirmMsg]);
    speakResponse(`Bespoke commission for ${clientName} created with order ID ${orderId}.`);
    setActiveQuickRecord('none');
    setQbClient('');
    setQbSpecs('');
    setQbTotal('');
    setQbAdvance('');
  };

  const submitQuickAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qprName.trim()) return;
    const priceNum = parseFloat(qprPrice.replace(/,/g, '')) || 95000;
    const stockNum = parseInt(qprStock) || 1;
    const skuCode = `SKU-LUM-${Date.now().toString().slice(-4)}`;

    const res = onAddProduct({
      name: qprName.trim(),
      category: qprCategory,
      material: qprMaterial,
      price: priceNum,
      stock: stockNum,
      description: qprDesc.trim() || `${qprName.trim()} crafted in ${qprMaterial} by LUMORA master artisans.`,
      images: attachedImages.length > 0 ? attachedImages : ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800']
    });

    const newProd = res.product;
    const actionRecord: AiVoiceAction = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'PRODUCT_ADDED',
      mutationType: 'added',
      entityType: 'Product',
      recordIdentifier: newProd?.sku || skuCode,
      recordName: qprName.trim(),
      summary: `Masterpiece Added: ${qprName.trim()}`,
      details: {
        'SKU': newProd?.sku || skuCode,
        'Name': qprName.trim(),
        'Category': qprCategory,
        'Material': qprMaterial,
        'Retail Price': `₹${priceNum.toLocaleString()}`,
        'Initial Stock': `${stockNum} units`,
        'Final State': 'Active in Atelier Inventory & Master Catalog'
      },
      status: 'executed',
      linkTab: 'inventory',
      linkId: newProd?.id || skuCode,
      productImages: attachedImages.length > 0 ? attachedImages : undefined
    };

    setRecentActionHistory(prev => [actionRecord, ...prev]);

    const confirmMsg: ChatMessage = {
      id: `msg-r-${Date.now()}`,
      sender: 'assistant',
      text: `✅ [RECORD ADDED] The new Product Catalog record for "${qprName.trim()}" (SKU: ${newProd?.sku || skuCode}) has been successfully created and saved to the atelier inventory.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: actionRecord,
      suggestedPrompts: ['View in Master Inventory', 'Check jewelry pricing', 'Publish to catalog']
    };

    setMessages(prev => [...prev, confirmMsg]);
    speakResponse(`New masterpiece ${qprName.trim()} added to the inventory catalog.`);
    setActiveQuickRecord('none');
    setQprName('');
    setQprPrice('');
    setQprDesc('');
    setAttachedImages([]);
  };

  const submitQuickLogRepair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrClient.trim() || !qrItem.trim()) return;
    const costNum = parseFloat(qrCost.replace(/,/g, '')) || 2500;

    const res = onLogRepair({
      customerName: qrClient.trim(),
      customerPhone: '+91 9820011223',
      itemDescription: qrItem.trim(),
      repairDetails: qrDetails.trim() || 'Servicing and restoration',
      costEstimate: costNum
    });

    const repairId = res.repair?.id || `REP-${Date.now().toString().slice(-4)}`;
    const actionRecord: AiVoiceAction = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'REPAIR_LOGGED',
      mutationType: 'added',
      entityType: 'Repair Job',
      recordIdentifier: repairId,
      recordName: `Repair: ${qrItem.trim()} (${qrClient.trim()})`,
      summary: `Repair Logged: ${qrItem.trim()} • ${qrClient.trim()}`,
      details: {
        'Repair ID': repairId,
        'Client': qrClient.trim(),
        'Item': qrItem.trim(),
        'Work Required': qrDetails.trim() || 'Servicing',
        'Cost Estimate': `₹${costNum.toLocaleString()}`,
        'Final State': 'Logged in Craftsmen Servicing Pipeline'
      },
      status: 'executed',
      linkTab: 'production',
      linkId: repairId
    };

    setRecentActionHistory(prev => [actionRecord, ...prev]);

    const confirmMsg: ChatMessage = {
      id: `msg-r-${Date.now()}`,
      sender: 'assistant',
      text: `✅ [RECORD ADDED] The new Repair Job record for "${qrClient.trim()}" (${qrItem.trim()}) has been successfully created with Job ID ${repairId}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: actionRecord,
      suggestedPrompts: ['View in Craftsmen Pipeline', 'Assign to artisan', 'Record advance payment']
    };

    setMessages(prev => [...prev, confirmMsg]);
    speakResponse(`Repair job for ${qrItem.trim()} logged under Job ID ${repairId}.`);
    setActiveQuickRecord('none');
    setQrClient('');
    setQrItem('');
    setQrDetails('');
    setQrCost('');
  };

  const submitQuickUpdateRates = (e: React.FormEvent) => {
    e.preventDefault();
    const gold10g = parseFloat(qgRate24k.replace(/,/g, '')) || 78190;
    const gold1g = gold10g > 10000 ? gold10g / 10 : gold10g;
    const silver1g = parseFloat(qgSilver.replace(/,/g, '')) || 95;

    onUpdateMetalRates({
      market: 'india',
      gold24kPerGram: gold1g,
      silverPerGram: silver1g
    });

    const actionRecord: AiVoiceAction = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'RATES_UPDATED',
      mutationType: 'updated',
      entityType: 'Metal Rates',
      recordName: 'India Spot Metal Rates',
      summary: `Gold Rate: ₹${(gold1g * 10).toLocaleString()}/10g, Silver: ₹${silver1g}/g`,
      details: {
        '24K Gold Rate / 10g': `₹${(gold1g * 10).toLocaleString()}`,
        '24K Gold Rate / gram': `₹${gold1g.toFixed(2)}`,
        'Silver 99.99 Rate / gram': `₹${silver1g.toFixed(2)}`,
        'Market Zone': 'India Bullion & Jewelry Association',
        'Final State': 'Synchronized in Live Atelier Pricing Engine'
      },
      status: 'executed',
      linkTab: 'calculator'
    };

    setRecentActionHistory(prev => [actionRecord, ...prev]);

    const confirmMsg: ChatMessage = {
      id: `msg-r-${Date.now()}`,
      sender: 'assistant',
      text: `🔄 [RECORD UPDATED] The Metal Spot Rate records for India have been successfully updated to ₹${(gold1g * 10).toLocaleString()}/10g for 24K Gold and ₹${silver1g}/g for Silver.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: actionRecord,
      suggestedPrompts: ['Check custom pricing calculator', 'View inventory valuations', 'Record a payment']
    };

    setMessages(prev => [...prev, confirmMsg]);
    speakResponse(`Metal rates updated. 24 karat gold is now ₹${(gold1g * 10).toLocaleString()} per 10 grams.`);
    setActiveQuickRecord('none');
  };

  const handleClearHistory = () => {
    setPendingAction(null);
    setMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: 'LUMORA Voice Concierge memory cleared. Ready for your next spoken, typed, or photo-upload command.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: [
          '📸 Upload multiple photos to create a product',
          'Record payment of ₹1,20,000 from Priya Sharma (Delhi)',
          'Add VIP customer Rohan Mehra, Mumbai',
          'Adjust stock for Sapphire Royale Ring to 5 units'
        ]
      }
    ]);
  };

  return (
    <div
      className={`flex flex-col h-full bg-[#FAF9F5] text-lumora-charcoal relative ${
        isFloatingView ? 'p-4 rounded-xl border border-lumora-gold/20 shadow-2xl' : 'p-6 lg:p-8 space-y-5'
      }`}
      id="lumora-ai-voice-concierge"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleImageFiles(e.dataTransfer.files);
        }
      }}
    >
      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-lumora-charcoal/85 backdrop-blur-xs flex flex-col items-center justify-center text-white border-2 border-dashed border-lumora-gold rounded-xl p-8 animate-in fade-in duration-200">
          <Upload size={44} className="text-lumora-gold animate-bounce mb-3" />
          <h3 className="text-lg font-serif font-bold text-lumora-gold">Drop Jewelry Photos Here</h3>
          <p className="text-xs text-white/80 mt-1">Upload multiple pictures to automatically create catalog items with AI extraction</p>
        </div>
      )}

      {/* Hidden Multi-file input */}
      <input
        type="file"
        multiple
        accept="image/*"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleImageFiles(e.target.files);
          }
        }}
        className="hidden"
      />

      {/* Simplified, Elegant Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-lumora-gold/15 border border-lumora-gold/30 flex items-center justify-center text-lumora-gold shadow-xs">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-serif font-bold text-lumora-charcoal tracking-tight">
                AI Voice & Multimodal Concierge
              </h2>
              <span className="bg-lumora-gold/15 text-lumora-charcoal border border-lumora-gold/30 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                <Zap size={9} className="text-lumora-gold" /> Active
              </span>
            </div>
            <p className="text-xs text-lumora-taupe">
              Speak naturally, type commands, or drop jewelry photos to instantly create products, record payments, and manage clients.
            </p>
          </div>
        </div>

        {/* Minimal Header Controls */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-white border border-black/10 px-2.5 py-1 rounded-xs shadow-2xs text-xs font-mono">
            <span className="text-[10px] text-lumora-taupe uppercase">Lang:</span>
            <select
              value={speechLang}
              onChange={(e) => setSpeechLang(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-lumora-charcoal outline-none cursor-pointer"
            >
              <option value="en-IN">English (India - ₹)</option>
              <option value="en-US">English (US - $)</option>
              <option value="en-GB">English (UK - £)</option>
              <option value="hi-IN">Hindi / Hinglish</option>
            </select>
          </div>

          {/* TTS Audio toggle */}
          <button
            onClick={() => {
              if (isTtsEnabled) window.speechSynthesis?.cancel();
              setIsTtsEnabled(!isTtsEnabled);
            }}
            title={isTtsEnabled ? 'Mute AI Voice Responses' : 'Enable AI Voice Responses'}
            className={`px-2.5 py-1 rounded-xs border text-xs flex items-center gap-1.5 transition-all shadow-2xs font-mono ${
              isTtsEnabled
                ? 'bg-lumora-gold/15 border-lumora-gold/40 text-lumora-charcoal font-semibold'
                : 'bg-white border-black/10 text-lumora-taupe hover:text-lumora-charcoal'
            }`}
          >
            {isTtsEnabled ? <Volume2 size={13} className="text-lumora-gold" /> : <VolumeX size={13} />}
            <span className="text-[10px] uppercase tracking-wider">{isTtsEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>

          {/* Reset Chat History */}
          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-xs border border-black/10 bg-white text-lumora-taupe hover:text-lumora-charcoal hover:bg-black/[0.02] text-xs transition-all shadow-2xs"
            title="Reset Chat History"
          >
            <RotateCcw size={13} />
          </button>

          {isFloatingView && onCloseFloating && (
            <button
              onClick={onCloseFloating}
              className="px-3 py-1 text-xs bg-lumora-charcoal text-white hover:bg-black font-serif transition-colors rounded-xs"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Main Structured 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Focused Chat & Voice Console (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white border border-black/10 rounded-sm shadow-xs overflow-hidden h-[640px]">
          
          {/* Active Voice Listening Banner */}
          {isListening && (
            <div className="bg-red-50/90 border-b border-red-200 px-4 py-2.5 flex items-center justify-between text-xs text-red-900 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                  <span className="font-bold uppercase tracking-wider font-mono text-[10px]">Listening</span>
                  <span className="bg-red-100 text-red-800 text-[9px] font-mono px-1.5 py-0.5 rounded-2xs font-semibold">
                    {Math.floor(recordingDuration / 60).toString().padStart(2, '0')}:{(recordingDuration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <span className="text-red-700 italic truncate font-sans text-xs">
                  "{speechTranscript || 'Speak your command clearly...'}"
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => stopVoiceRecording(true)}
                  className="px-2.5 py-0.5 bg-red-700 text-white rounded-2xs text-[10px] font-bold uppercase tracking-wider hover:bg-red-800 transition-colors"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={cancelVoiceRecording}
                  className="p-1 text-red-600 hover:text-red-900"
                  title="Cancel"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Messages Timeline */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Sender & Timestamp */}
                <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-lumora-taupe">
                  <span className="uppercase font-semibold">
                    {msg.sender === 'user' ? 'You' : 'Concierge'}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                  {msg.isVoiceInput && (
                    <span className="bg-lumora-gold/20 text-lumora-charcoal px-1.5 py-0.2 rounded-2xs text-[8px] font-bold uppercase">
                      Voice
                    </span>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[88%] rounded-xl p-4 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-lumora-charcoal text-white rounded-tr-none shadow-xs'
                      : 'bg-[#FAF9F5] text-lumora-charcoal border border-black/10 rounded-tl-none shadow-2xs'
                  }`}
                >
                  {/* Uploaded User Images Preview */}
                  {msg.images && msg.images.length > 0 && (
                    <div className="mb-3 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-mono">
                        <LucideImage size={11} className="text-lumora-gold" />
                        <span>Attached {msg.images.length} Photo(s):</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.images.map((imgUrl, imgIdx) => (
                          <div key={imgIdx} className="w-14 h-14 rounded-xs overflow-hidden border border-white/20 relative shadow-xs bg-black/20">
                            <img src={imgUrl} alt={`Upload ${imgIdx + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-[7px] font-mono text-white px-1 rounded-2xs">
                              #{imgIdx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="whitespace-pre-line text-[13px]">{msg.text}</p>

                  {/* Clean Structured Action Receipt Card */}
                  {msg.action && (
                    <div className="mt-3 pt-3 border-t border-black/10 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {msg.action.mutationType === 'added' ? (
                            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-2xs font-mono uppercase">
                              ✓ Record Added
                            </span>
                          ) : msg.action.mutationType === 'updated' ? (
                            <span className="bg-blue-100 text-blue-900 border border-blue-300 text-[9px] font-bold px-2 py-0.5 rounded-2xs font-mono uppercase">
                              ✓ Record Updated
                            </span>
                          ) : msg.action.mutationType === 'deleted' ? (
                            <span className="bg-rose-100 text-rose-900 border border-rose-300 text-[9px] font-bold px-2 py-0.5 rounded-2xs font-mono uppercase">
                              ✓ Record Deleted
                            </span>
                          ) : (
                            <span className="bg-lumora-bone text-lumora-charcoal border border-black/10 text-[9px] font-bold px-2 py-0.5 rounded-2xs font-mono uppercase">
                              ✓ Action Executed
                            </span>
                          )}
                          <span className="font-serif font-bold text-xs text-lumora-charcoal truncate">
                            {msg.action.summary}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-800 font-medium">
                          Synced
                        </span>
                      </div>

                      {/* Product Visual Showcase if images created */}
                      {msg.action.productImages && msg.action.productImages.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto py-1">
                          {msg.action.productImages.map((pImg, pIdx) => (
                            <div key={pIdx} className="w-12 h-12 rounded-xs overflow-hidden border border-black/10 bg-white shrink-0 shadow-2xs">
                              <img src={pImg} alt="Product visual" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Snapshot Key-Value Details */}
                      <div className="grid grid-cols-2 gap-1.5 bg-white p-2.5 rounded-xs border border-black/5 text-[11px] font-mono shadow-2xs">
                        {Object.entries(msg.action.details).slice(0, 6).map(([key, val]) => (
                          <div key={key} className="flex flex-col">
                            <span className="text-[8px] uppercase tracking-wider text-lumora-taupe font-sans font-bold">{key}</span>
                            <span className="text-lumora-charcoal font-semibold truncate" title={String(val)}>{String(val)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Deep Link to Tab */}
                      {msg.action.linkTab && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => onNavigateTab(msg.action?.linkTab)}
                            className="inline-flex items-center gap-1 text-[11px] font-serif font-bold text-lumora-gold hover:text-lumora-charcoal hover:underline transition-colors"
                          >
                            <span>Open in {msg.action.linkTab.toUpperCase()}</span>
                            <ArrowRight size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Clean Interactive Clarification Box */}
                  {msg.pendingAction && (
                    <div className="mt-3 p-3 bg-amber-50/80 border border-amber-300 rounded-xs space-y-2.5 text-amber-950">
                      <div className="flex items-center gap-1.5 font-serif font-bold text-xs text-amber-900">
                        <HelpCircle size={14} className="text-amber-700" />
                        <span>Additional Information Needed</span>
                      </div>
                      
                      <p className="text-xs font-serif leading-relaxed">
                        {msg.pendingAction.clarifyingQuestion}
                      </p>

                      {/* Missing Fields Badges */}
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-[9px] uppercase font-bold text-amber-800 font-mono">Missing:</span>
                        {msg.pendingAction.missingFields.map((field, fIdx) => (
                          <span key={fIdx} className="bg-white text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-2xs font-mono text-[9px] font-bold">
                            {field.replace(/([A-Z])/g, ' $1')}
                          </span>
                        ))}
                      </div>

                      {/* Quick Answer Buttons */}
                      {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.suggestedPrompts.map((prompt, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => handleExecuteCommand(prompt, false)}
                              className="text-[10px] bg-white hover:bg-amber-100 text-amber-950 px-2.5 py-1 rounded-xs border border-amber-300 transition-all font-sans font-medium flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <span>{prompt}</span>
                              <ArrowRight size={9} className="text-amber-600" />
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setPendingAction(null);
                              setMessages(prev => [
                                ...prev,
                                {
                                  id: `msg-cancel-${Date.now()}`,
                                  sender: 'assistant',
                                  text: 'Cancelled the in-progress operation. Ready for your next command.',
                                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                }
                              ]);
                            }}
                            className="text-[10px] bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 rounded-xs border border-red-200 transition-all font-sans flex items-center gap-1 cursor-pointer"
                          >
                            <X size={10} /> Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subtle Suggested Prompts */}
                  {!msg.pendingAction && msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-black/5 flex flex-wrap gap-1.5">
                      {msg.suggestedPrompts.slice(0, 3).map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => {
                            if (prompt.includes('Upload') || prompt.includes('photo')) {
                              fileInputRef.current?.click();
                            } else {
                              handleExecuteCommand(prompt, false);
                            }
                          }}
                          className="text-[10px] bg-white hover:bg-lumora-gold/10 hover:border-lumora-gold/50 text-lumora-charcoal px-2 py-0.5 rounded-2xs border border-black/10 transition-all text-left flex items-center gap-1 font-mono"
                        >
                          <Zap size={9} className="text-lumora-gold" />
                          <span className="truncate max-w-xs">{prompt}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-start">
                <div className="bg-[#FAF9F5] border border-black/5 rounded-xl p-3 flex items-center gap-2.5 text-xs text-lumora-taupe font-serif">
                  <Sparkles size={14} className="text-lumora-gold animate-spin" />
                  <span>Processing natural language & multimodal photo command...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Simple Structured Input Console */}
          <div className="p-4 bg-white border-t border-black/10 space-y-3">
            
            {/* Attached Images Preview Row */}
            {attachedImages.length > 0 && (
              <div className="bg-lumora-bone/40 border border-lumora-gold/30 rounded-xs p-2.5 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-lumora-charcoal flex items-center gap-1.5 font-mono">
                    <Camera size={12} className="text-lumora-gold" />
                    <span>{attachedImages.length} Photo(s) Selected</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[9px] uppercase font-bold tracking-widest text-lumora-gold hover:underline flex items-center gap-0.5"
                    >
                      <Plus size={9} /> Add More
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttachedImages([])}
                      className="text-[9px] uppercase font-bold tracking-widest text-red-600 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {attachedImages.map((img, i) => (
                    <div key={i} className="relative w-14 h-14 shrink-0 rounded-xs overflow-hidden border border-black/10 bg-white group shadow-2xs">
                      <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors"
                        title="Remove"
                      >
                        <X size={9} />
                      </button>
                      <span className="absolute bottom-0.5 left-0.5 bg-black/60 text-white text-[7px] font-mono px-1 rounded-2xs">
                        #{i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Action Prompt Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 text-[10px] bg-lumora-gold/10 hover:bg-lumora-gold hover:text-white text-lumora-charcoal px-2.5 py-1 rounded-xs border border-lumora-gold/30 transition-all font-mono flex items-center gap-1"
              >
                <Camera size={10} /> 📸 Upload Photos
              </button>
              <button
                type="button"
                onClick={() => handleExecuteCommand('Record payment of ₹50,000 from Priya Sharma via UPI')}
                className="shrink-0 text-[10px] bg-[#FAF9F5] hover:bg-lumora-gold/10 text-lumora-charcoal px-2.5 py-1 rounded-xs border border-black/5 transition-all font-mono"
              >
                💳 Payment ₹50k (Priya Sharma)
              </button>
              <button
                type="button"
                onClick={() => handleExecuteCommand('Add VIP client Rhea Kapoor, London, +44 7911 123456')}
                className="shrink-0 text-[10px] bg-[#FAF9F5] hover:bg-lumora-gold/10 text-lumora-charcoal px-2.5 py-1 rounded-xs border border-black/5 transition-all font-mono"
              >
                👤 Add Client (Rhea Kapoor)
              </button>
              <button
                type="button"
                onClick={() => handleExecuteCommand('Create bespoke order for Ananya: 18k gold diamond ring, advance ₹30,000')}
                className="shrink-0 text-[10px] bg-[#FAF9F5] hover:bg-lumora-gold/10 text-lumora-charcoal px-2.5 py-1 rounded-xs border border-black/5 transition-all font-mono"
              >
                💍 Bespoke Commission
              </button>
              <button
                type="button"
                onClick={() => handleExecuteCommand('Update 24k gold rate to ₹84,500 per 10 grams')}
                className="shrink-0 text-[10px] bg-[#FAF9F5] hover:bg-lumora-gold/10 text-lumora-charcoal px-2.5 py-1 rounded-xs border border-black/5 transition-all font-mono"
              >
                ⚖️ Gold Rate (₹84.5k)
              </button>
            </div>

            {/* Input Bar with Prominent Voice Mic & Attachment Button */}
            <div className="flex items-center gap-2">
              {/* Voice Mic Button */}
              <button
                type="button"
                onClick={toggleVoiceListening}
                className={`p-3 rounded-full transition-all flex items-center justify-center shrink-0 shadow-xs relative ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-200'
                    : 'bg-lumora-gold hover:bg-lumora-gold/90 text-white hover:scale-105'
                }`}
                title={isListening ? 'Click to stop listening' : 'Click to speak voice command'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                {isListening && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping" />
                )}
              </button>

              {/* Photo Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2.5 rounded-full border transition-all flex items-center justify-center shrink-0 relative ${
                  attachedImages.length > 0
                    ? 'bg-lumora-gold/15 border-lumora-gold text-lumora-gold font-bold ring-2 ring-lumora-gold/20'
                    : 'bg-[#FAF9F5] border-black/10 text-lumora-charcoal hover:bg-lumora-gold/10 hover:border-lumora-gold'
                }`}
                title="Attach Jewelry Photos"
              >
                <Camera size={16} />
                {attachedImages.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-lumora-charcoal text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {attachedImages.length}
                  </span>
                )}
              </button>

              {/* Text Input Field */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExecuteCommand();
                }}
                className="flex-1 flex items-center gap-2 bg-[#FAF9F5] border border-black/10 focus-within:border-lumora-gold rounded-xs px-3.5 py-2 transition-colors shadow-2xs"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onPaste={handlePaste}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={
                    isListening
                      ? 'Listening to your speech...'
                      : attachedImages.length > 0
                      ? 'Type details (e.g. "Diamond Solitaire Ring, 18k Rose Gold, ₹1.2L") or press Send...'
                      : 'Speak or type any command (e.g. "Record payment ₹50k", "Add VIP client")...'
                  }
                  className="flex-1 bg-transparent text-xs text-lumora-charcoal placeholder:text-lumora-taupe/60 outline-none"
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  disabled={isProcessing || (!inputQuery.trim() && attachedImages.length === 0)}
                  className={`p-1.5 rounded-2xs transition-all ${
                    inputQuery.trim() || attachedImages.length > 0
                      ? 'bg-lumora-charcoal text-white hover:bg-black'
                      : 'text-lumora-taupe opacity-30 cursor-not-allowed'
                  }`}
                  title="Send Command"
                >
                  <Send size={13} />
                </button>
              </form>
            </div>

            <div className="flex items-center justify-between text-[9px] text-lumora-taupe font-mono px-0.5">
              <span className="flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-600" />
                Automatic database execution & state persistence
              </span>
              <span>Drag & drop photos or paste clipboard images</span>
            </div>
          </div>
        </div>

        {/* Right Column: Structured Operational Activity & Command Guide (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col bg-white border border-black/10 rounded-sm shadow-xs overflow-hidden h-[640px]">
          
          {/* Segmented Tab Switch */}
          <div className="p-3 border-b border-black/5 bg-[#FAF9F5]/70 flex items-center justify-between">
            <div className="flex items-center gap-1 bg-white border border-black/10 p-0.5 rounded-xs shadow-2xs w-full">
              <button
                type="button"
                onClick={() => setSidebarTab('activity')}
                className={`flex-1 py-1.5 text-center text-[10px] font-mono font-bold uppercase tracking-wider rounded-2xs transition-all flex items-center justify-center gap-1.5 ${
                  sidebarTab === 'activity'
                    ? 'bg-lumora-charcoal text-white shadow-xs'
                    : 'text-lumora-taupe hover:text-lumora-charcoal'
                }`}
              >
                <Clock size={11} />
                <span>Activity ({recentActionHistory.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab('guide')}
                className={`flex-1 py-1.5 text-center text-[10px] font-mono font-bold uppercase tracking-wider rounded-2xs transition-all flex items-center justify-center gap-1.5 ${
                  sidebarTab === 'guide'
                    ? 'bg-lumora-charcoal text-white shadow-xs'
                    : 'text-lumora-taupe hover:text-lumora-charcoal'
                }`}
              >
                <Sparkles size={11} className="text-lumora-gold" />
                <span>Command Guide</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Activity Stream */}
          {sidebarTab === 'activity' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {recentActionHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-lumora-taupe space-y-2">
                  <Zap size={20} className="opacity-30 text-lumora-gold" />
                  <p className="text-xs font-serif font-medium">No actions executed yet.</p>
                  <p className="text-[10px] font-mono text-lumora-taupe/80 max-w-xs">
                    Actions performed via voice, text, or photos will be logged here with live deep links.
                  </p>
                </div>
              ) : (
                recentActionHistory.map((act) => (
                  <div
                    key={act.id}
                    className="border border-black/5 bg-[#FAF9F5] hover:border-lumora-gold/40 p-3 rounded-xs space-y-2 transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5 font-bold font-serif truncate">
                        {act.mutationType === 'added' ? (
                          <span className="text-[7px] bg-emerald-600 text-white font-mono px-1 py-0.5 rounded-2xs font-bold uppercase">
                            Added
                          </span>
                        ) : act.mutationType === 'updated' ? (
                          <span className="text-[7px] bg-blue-600 text-white font-mono px-1 py-0.5 rounded-2xs font-bold uppercase">
                            Updated
                          </span>
                        ) : act.mutationType === 'deleted' ? (
                          <span className="text-[7px] bg-rose-600 text-white font-mono px-1 py-0.5 rounded-2xs font-bold uppercase">
                            Deleted
                          </span>
                        ) : (
                          <span className="text-[7px] bg-lumora-charcoal text-white font-mono px-1 py-0.5 rounded-2xs font-bold uppercase">
                            Done
                          </span>
                        )}
                        <span className="text-lumora-charcoal truncate">{act.summary}</span>
                      </div>
                      <span className="text-lumora-taupe font-mono text-[9px] shrink-0">{act.timestamp}</span>
                    </div>

                    {/* Snapshot Attributes */}
                    <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-lumora-taupe bg-white p-2 rounded-2xs border border-black/5">
                      {Object.entries(act.details).slice(0, 4).map(([k, v]) => (
                        <div key={k} className="truncate">
                          <span className="font-sans font-bold text-black/60">{k}:</span> {String(v)}
                        </div>
                      ))}
                    </div>

                    {/* Deep link button */}
                    {act.linkTab && (
                      <div className="flex justify-end pt-0.5">
                        <button
                          onClick={() => onNavigateTab(act.linkTab)}
                          className="text-[10px] font-serif font-bold text-lumora-gold hover:text-lumora-charcoal flex items-center gap-1"
                        >
                          <span>Open in {act.linkTab.toUpperCase()}</span>
                          <ExternalLink size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: Clean Structured Command Guide */}
          {sidebarTab === 'guide' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="space-y-1 pb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-lumora-taupe font-mono">
                  💡 Natural Voice & Multimodal Commands
                </span>
                <p className="text-[11px] text-lumora-taupe font-serif">
                  Click any example below to immediately test the concierge:
                </p>
              </div>

              {/* Guide Card 1: Photos & Products */}
              <div
                onClick={() => handleExecuteCommand('Add Celestial Diamond Solitaire Ring in 18k Rose Gold, price ₹1,45,000, 2 units in stock')}
                className="p-3 bg-[#FAF9F5] hover:bg-lumora-gold/5 border border-black/5 hover:border-lumora-gold/40 rounded-xs space-y-1 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs font-serif font-bold text-lumora-charcoal">
                  <span className="flex items-center gap-1.5 text-lumora-gold group-hover:text-lumora-charcoal">
                    <Camera size={13} /> Multi-Photo Product Catalog
                  </span>
                  <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-lumora-gold" />
                </div>
                <p className="text-[10px] font-mono text-lumora-taupe">
                  "Upload 2 photos + price ₹1.45L to auto-create inventory item"
                </p>
              </div>

              {/* Guide Card 2: Payments */}
              <div
                onClick={() => handleExecuteCommand('Record payment of ₹1,50,000 from Priya Sharma at Delhi Atelier via Bank Transfer for Solitaire advance')}
                className="p-3 bg-[#FAF9F5] hover:bg-lumora-gold/5 border border-black/5 hover:border-lumora-gold/40 rounded-xs space-y-1 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs font-serif font-bold text-lumora-charcoal">
                  <span className="flex items-center gap-1.5 text-lumora-gold group-hover:text-lumora-charcoal">
                    <CreditCard size={13} /> Payments & Financial Ledger
                  </span>
                  <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-lumora-gold" />
                </div>
                <p className="text-[10px] font-mono text-lumora-taupe">
                  "Record payment of ₹1,50,000 from Priya Sharma via Bank Transfer"
                </p>
              </div>

              {/* Guide Card 3: Client CRM */}
              <div
                onClick={() => handleExecuteCommand('Add new VIP client Rhea Kapoor, London, phone +44 7911 123456, lead source Instagram')}
                className="p-3 bg-[#FAF9F5] hover:bg-lumora-gold/5 border border-black/5 hover:border-lumora-gold/40 rounded-xs space-y-1 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs font-serif font-bold text-lumora-charcoal">
                  <span className="flex items-center gap-1.5 text-lumora-gold group-hover:text-lumora-charcoal">
                    <UserPlus size={13} /> Clientele & VIP CRM
                  </span>
                  <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-lumora-gold" />
                </div>
                <p className="text-[10px] font-mono text-lumora-taupe">
                  "Add VIP client Rhea Kapoor, London, +44 7911 123456"
                </p>
              </div>

              {/* Guide Card 4: Bespoke Orders */}
              <div
                onClick={() => handleExecuteCommand('Create bespoke order for Kavita Patel: 18k Yellow Gold Emerald Ring, quote ₹2,20,000, advance ₹60,000')}
                className="p-3 bg-[#FAF9F5] hover:bg-lumora-gold/5 border border-black/5 hover:border-lumora-gold/40 rounded-xs space-y-1 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs font-serif font-bold text-lumora-charcoal">
                  <span className="flex items-center gap-1.5 text-lumora-gold group-hover:text-lumora-charcoal">
                    <Sparkles size={13} /> Bespoke Commissions
                  </span>
                  <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-lumora-gold" />
                </div>
                <p className="text-[10px] font-mono text-lumora-taupe">
                  "New bespoke 18k emerald ring for Kavita, quote ₹2.2L, advance ₹60k"
                </p>
              </div>

              {/* Guide Card 5: Live Rates */}
              <div
                onClick={() => handleExecuteCommand('Update 24k gold rate to ₹84,500 per 10 grams')}
                className="p-3 bg-[#FAF9F5] hover:bg-lumora-gold/5 border border-black/5 hover:border-lumora-gold/40 rounded-xs space-y-1 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs font-serif font-bold text-lumora-charcoal">
                  <span className="flex items-center gap-1.5 text-lumora-gold group-hover:text-lumora-charcoal">
                    <TrendingUp size={13} /> Market Spot Rates
                  </span>
                  <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-lumora-gold" />
                </div>
                <p className="text-[10px] font-mono text-lumora-taupe">
                  "Update 24k gold rate to ₹84,500 per 10 grams"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
