import { ProspectOrder } from './types';

export const MOCK_PROSPECT_ORDERS: ProspectOrder[] = [
  // --- CUSTOMER 1: Maharani Gayatri Singhania (CUS-005) --- Multiple Enquiries
  {
    id: 'PROSP-2026-001',
    title: 'Emerald Cut Royal Colombian Choker',
    customerId: 'CUS-005',
    customerName: 'Maharani Gayatri Singhania',
    customerPhone: '+91 98200 44881',
    customerEmail: 'gayatri.singhania@heritagecorp.in',
    customerCity: 'Udaipur / Mumbai',
    leadSource: 'Private Atelier VIP Consultation',
    priority: 'Urgent',
    category: 'Necklaces',
    status: 'pending_confirmation',
    targetBudget: 1250000,
    estimatedQuote: 1380000,
    advanceRequired: 400000,
    advanceReceived: 0,
    advancePaymentMethod: 'Pending',
    targetDeliveryDate: '2026-10-15',
    occasion: 'Royal Winter Palace Wedding',
    metalPreference: {
      type: 'Gold',
      purity: '18K Yellow Gold',
      color: 'Yellow',
      estWeightGrams: 85.5,
      isConfirmed: false,
      notes: 'Client debating between 18K Yellow Gold and 22K Traditional Kundan Gold Setting.'
    },
    gemstoneDetails: {
      primaryStone: 'Certified Muzo Colombian Emerald (Hexagonal Step Cut)',
      stoneType: 'natural',
      caratWeight: 8.45,
      cutShape: 'Emerald Step Cut',
      accentStones: '14.2 ct Total Weight VVS1-F Round & Pear Diamonds in Foliate Setting',
      isConfirmed: true,
      notes: 'Lot #M-402 inspected in person and signed off by client at Mumbai salon.'
    },
    sizingDetails: {
      length: '14.5 inches with 2-inch extension chain',
      isConfirmed: false,
      notes: 'Waiting for client blouse neckline collar measurements from Sabyasachi fitting.'
    },
    designDetails: {
      sketchApproved: true,
      cadRenderApproved: false,
      engravingText: 'G & V • MCMXXVI',
      specifications: 'High jewelry foliate cascade choker featuring an 8.45ct certified Colombian emerald surrounded by pear and brilliant cut diamonds. Double safety clasp with concealed hinge.',
      samplePhotos: [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800'
      ],
      notes: 'CAD team preparing 3D resin prototype for neck contour trial.'
    },
    confirmations: [
      { key: 'gemstone_selection', label: 'Gemstone Selection & Certification', isConfirmed: true, details: '8.45ct Colombian Emerald selected & GIA certified.', confirmedAt: '2026-08-25', confirmedBy: 'Master Gemologist' },
      { key: 'sketch_cad_approval', label: 'Design Concept & CAD Sign-off', isConfirmed: false, details: 'Physical sketch approved. 3D CAD render awaiting client approval.' },
      { key: 'metal_purity', label: 'Metal Purity & Alloy Choice', isConfirmed: false, details: 'Pending decision between 18K vs 22K Kundan gold.' },
      { key: 'sizing_measurements', label: 'Neck Contour & Collar Sizing', isConfirmed: false, details: 'Awaiting couture fitting collar measurements on Sep 5.' },
      { key: 'budget_quote_approval', label: 'Final Quotation Sign-off', isConfirmed: true, details: 'Quotation of ₹13,80,000 formally accepted.', confirmedAt: '2026-08-28', confirmedBy: 'Director of Sales' },
      { key: 'advance_deposit', label: 'Advance Deposit Received', isConfirmed: false, details: 'Awaiting ₹4,00,000 token advance payment.' },
      { key: 'delivery_timeline', label: 'Artisan Workshop Feasibility', isConfirmed: true, details: 'Master Hiroshi confirmed 6-week bench production slot.', confirmedAt: '2026-08-27', confirmedBy: 'Workshop Manager' }
    ],
    nextFollowUpDate: '2026-09-05',
    assignedCraftsmanId: 'CRF-01',
    assignedCraftsmanName: 'Master Hiroshi',
    activityLog: [
      { id: 'act-1', date: '2026-08-24', type: 'meeting', text: 'Private Salon Consultation at Taj Mahal Palace Mumbai.', author: 'Creative Director' },
      { id: 'act-2', date: '2026-08-25', type: 'confirmation_toggle', text: 'Confirmed Colombian Emerald lot inspection (8.45ct).', author: 'Gemology Desk' },
      { id: 'act-3', date: '2026-08-28', type: 'quote_sent', text: 'Sent formalized proforma estimate ₹13,80,000 via WhatsApp and email.', author: 'Studio Manager' }
    ],
    createdAt: '2026-08-24',
    updatedAt: '2026-08-28'
  },
  {
    id: 'PROSP-2026-005',
    title: 'South Sea Pearl & Rose-Cut Diamond Chandbali Jhumkas',
    customerId: 'CUS-005',
    customerName: 'Maharani Gayatri Singhania',
    customerPhone: '+91 98200 44881',
    customerEmail: 'gayatri.singhania@heritagecorp.in',
    customerCity: 'Udaipur / Mumbai',
    leadSource: 'Private Atelier VIP Consultation',
    priority: 'High',
    category: 'Earrings',
    status: 'gathering_info',
    targetBudget: 550000,
    estimatedQuote: 525000,
    advanceRequired: 150000,
    advanceReceived: 0,
    advancePaymentMethod: 'Pending',
    targetDeliveryDate: '2026-10-20',
    occasion: 'Matching Ear Suite for Winter Palace Wedding',
    metalPreference: {
      type: 'Gold',
      purity: '18K Yellow Gold',
      color: 'Yellow',
      estWeightGrams: 32.0,
      isConfirmed: true,
      notes: 'Must match the 18K alloy tone of the Royal Colombian Choker.'
    },
    gemstoneDetails: {
      primaryStone: 'Natural Golden South Sea Pearls (13.5mm drop pair)',
      stoneType: 'natural',
      caratWeight: 18.0,
      cutShape: 'Drop Baroque / Round',
      accentStones: '6.2ct Uncut Polki Diamonds with emerald beads',
      isConfirmed: false,
      notes: 'Awaiting pearl lot arrival from Kobe auction.'
    },
    sizingDetails: {
      length: '3.2 inches drop',
      isConfirmed: false,
      notes: 'Weight balancing clip mechanism required for comfort.'
    },
    designDetails: {
      sketchApproved: false,
      cadRenderApproved: false,
      engravingText: '',
      specifications: 'Double crescent moon motif set with polki diamonds, suspending golden South Sea pearl drops fringed with small seed emeralds.',
      samplePhotos: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800'
      ],
      notes: 'Complementary design to accompany Royal Colombian Choker.'
    },
    confirmations: [
      { key: 'gemstone_selection', label: 'Gemstone & Pearl Selection', isConfirmed: false, details: 'Matching pair of 13.5mm Golden South Sea pearls currently in transit.' },
      { key: 'sketch_cad_approval', label: 'Design Concept & CAD Sign-off', isConfirmed: false, details: 'Pencil design sketches undergoing client review.' },
      { key: 'metal_purity', label: 'Metal Purity & Alloy Choice', isConfirmed: true, details: '18K Yellow Gold confirmed to match Choker suite.', confirmedAt: '2026-08-27', confirmedBy: 'Creative Director' },
      { key: 'sizing_measurements', label: 'Earring Weight & Clip Ergonomics', isConfirmed: false, details: 'Clip-post hybrid fitting requested.' },
      { key: 'budget_quote_approval', label: 'Final Quotation Sign-off', isConfirmed: false, details: 'Preliminary budget ₹5,25,000 pending final pearl pricing.' },
      { key: 'advance_deposit', label: 'Advance Deposit Received', isConfirmed: false, details: 'Pending final sign-off.' },
      { key: 'delivery_timeline', label: 'Artisan Workshop Feasibility', isConfirmed: true, details: 'Can be crafted concurrently with Choker.', confirmedAt: '2026-08-28', confirmedBy: 'Master Hiroshi' }
    ],
    nextFollowUpDate: '2026-09-08',
    assignedCraftsmanId: 'CRF-01',
    assignedCraftsmanName: 'Master Hiroshi',
    activityLog: [
      { id: 'act-51', date: '2026-08-27', type: 'note', text: 'Client requested matching earrings for the Royal Colombian Choker suite.', author: 'Creative Director' }
    ],
    createdAt: '2026-08-27',
    updatedAt: '2026-08-28'
  },

  // --- CUSTOMER 2: Aarav Mehta (CUS-006) --- Multiple Enquiries
  {
    id: 'PROSP-2026-002',
    title: 'Oval Solitaire Diamond Ring with Hidden Halo',
    customerId: 'CUS-006',
    customerName: 'Aarav Mehta',
    customerPhone: '+91 98331 92840',
    customerEmail: 'aarav.mehta@solventures.com',
    customerCity: 'Bandra, Mumbai',
    leadSource: 'Instagram DM Inquiry',
    priority: 'High',
    category: 'Rings',
    status: 'ready_to_order',
    targetBudget: 550000,
    estimatedQuote: 525000,
    advanceRequired: 200000,
    advanceReceived: 200000,
    advancePaymentMethod: 'Bank Transfer',
    targetDeliveryDate: '2026-09-22',
    occasion: 'Secret Proposal in Lake Como',
    metalPreference: {
      type: 'Platinum',
      purity: '950 Platinum',
      color: 'White',
      estWeightGrams: 5.8,
      isConfirmed: true,
      notes: 'PT950 mirror high polish with comfort fit rounded inner shank.'
    },
    gemstoneDetails: {
      primaryStone: '2.14ct Oval Brilliant Diamond (IGI Certified, D Color, VVS2)',
      stoneType: 'natural',
      caratWeight: 2.14,
      cutShape: 'Oval Brilliant',
      accentStones: '0.22ct Micro-Pavé Diamonds on Basket and Hidden Halo',
      isConfirmed: true,
      notes: 'IGI Certificate #598210342 reserved in vault.'
    },
    sizingDetails: {
      ringSize: 'US 5.5 / Indian 11 (50.6mm circumference)',
      isConfirmed: true,
      notes: 'Size secretly measured from client\'s existing Cartier Trinity band.'
    },
    designDetails: {
      sketchApproved: true,
      cadRenderApproved: true,
      engravingText: 'Forever & Always • 24.09.26',
      specifications: 'Petite 4-prong claw basket with secret hidden diamond halo under center stone. Platinum whisper thin 1.6mm band with comfort fit curve.',
      samplePhotos: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800'
      ],
      notes: 'Ready for bench casting and laser stone setting.'
    },
    confirmations: [
      { key: 'gemstone_selection', label: 'Gemstone Selection & Certification', isConfirmed: true, details: '2.14ct D-VVS2 Oval inspected and approved.', confirmedAt: '2026-08-26', confirmedBy: 'Aarav Mehta' },
      { key: 'sketch_cad_approval', label: 'Design Concept & CAD Sign-off', isConfirmed: true, details: '3D CAD render signed off by Aarav.', confirmedAt: '2026-08-27', confirmedBy: 'Aarav Mehta' },
      { key: 'metal_purity', label: 'Metal Purity & Alloy Choice', isConfirmed: true, details: 'Confirmed 950 Platinum.', confirmedAt: '2026-08-26', confirmedBy: 'Elena Rossi' },
      { key: 'sizing_measurements', label: 'Ring Sizing & Fit Confirmation', isConfirmed: true, details: 'US 5.5 confirmed via partner ring.', confirmedAt: '2026-08-28', confirmedBy: 'Aarav Mehta' },
      { key: 'budget_quote_approval', label: 'Final Quotation Sign-off', isConfirmed: true, details: 'Quotation ₹5,25,000 accepted.', confirmedAt: '2026-08-28', confirmedBy: 'Aarav Mehta' },
      { key: 'advance_deposit', label: 'Advance Deposit Received', isConfirmed: true, details: '₹2,00,000 received via NEFT (Ref: HDFC99214).', confirmedAt: '2026-08-29', confirmedBy: 'Finance Desk' },
      { key: 'delivery_timeline', label: 'Artisan Workshop Feasibility', isConfirmed: true, details: 'Target delivery Sep 22 confirmed with Elena Rossi.', confirmedAt: '2026-08-28', confirmedBy: 'Elena Rossi' }
    ],
    nextFollowUpDate: '2026-09-01',
    assignedCraftsmanId: 'CRF-02',
    assignedCraftsmanName: 'Elena Rossi',
    activityLog: [
      { id: 'act-4', date: '2026-08-26', type: 'meeting', text: 'Client visited atelier; inspected 3 oval stones.', author: 'Atelier Lead' },
      { id: 'act-5', date: '2026-08-27', type: 'sketch_sent', text: 'Sent CAD render with hidden halo views.', author: 'CAD Designer' },
      { id: 'act-6', date: '2026-08-29', type: 'confirmation_toggle', text: 'Received ₹2,00,000 advance payment into HDFC account.', author: 'Finance Desk' }
    ],
    createdAt: '2026-08-25',
    updatedAt: '2026-08-29'
  },
  {
    id: 'PROSP-2026-006',
    title: 'Platinum & Black Diamond Men\'s Wedding Band',
    customerId: 'CUS-006',
    customerName: 'Aarav Mehta',
    customerPhone: '+91 98331 92840',
    customerEmail: 'aarav.mehta@solventures.com',
    customerCity: 'Bandra, Mumbai',
    leadSource: 'Existing Client Referral',
    priority: 'Standard',
    category: 'Rings',
    status: 'quote_sent',
    targetBudget: 180000,
    estimatedQuote: 165000,
    advanceRequired: 50000,
    advanceReceived: 0,
    advancePaymentMethod: 'Pending',
    targetDeliveryDate: '2026-10-05',
    occasion: 'Matching Groom Band',
    metalPreference: {
      type: 'Platinum',
      purity: '950 Platinum',
      color: 'White',
      estWeightGrams: 8.2,
      isConfirmed: true,
      notes: 'Brushed matte platinum finish with polished beveled edges.'
    },
    gemstoneDetails: {
      primaryStone: 'Channel-set Flush Black Diamonds',
      stoneType: 'natural',
      caratWeight: 0.45,
      cutShape: 'Princess Cut',
      accentStones: 'None',
      isConfirmed: true,
      notes: '7 princess cut black diamonds flush set into center groove.'
    },
    sizingDetails: {
      ringSize: 'US 9.5 / Indian 21',
      isConfirmed: false,
      notes: 'Comfort-fit sizing mandrel test scheduled for next appointment.'
    },
    designDetails: {
      sketchApproved: true,
      cadRenderApproved: true,
      engravingText: 'A & T • 2026',
      specifications: '6mm heavy weight comfort-fit band in 950 Platinum, matte satin center band with high polish step edges and 7 flush-set black diamonds.',
      samplePhotos: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800'
      ],
      notes: 'Will be ordered as companion band.'
    },
    confirmations: [
      { key: 'gemstone_selection', label: 'Gemstone & Diamond Selection', isConfirmed: true, details: '7 calibrated black princess cut diamonds confirmed.', confirmedAt: '2026-08-28', confirmedBy: 'Aarav Mehta' },
      { key: 'sketch_cad_approval', label: 'Design Concept & CAD Sign-off', isConfirmed: true, details: 'CAD render approved.', confirmedAt: '2026-08-29', confirmedBy: 'Aarav Mehta' },
      { key: 'metal_purity', label: 'Metal Purity & Alloy Choice', isConfirmed: true, details: '950 Platinum confirmed.', confirmedAt: '2026-08-28', confirmedBy: 'Aarav Mehta' },
      { key: 'sizing_measurements', label: 'Ring Sizing & Finger Fit', isConfirmed: false, details: 'Mandrel check scheduled for Sep 3.' },
      { key: 'budget_quote_approval', label: 'Final Quotation Sign-off', isConfirmed: false, details: 'Quote of ₹1,65,000 sent for review.' },
      { key: 'advance_deposit', label: 'Advance Deposit Received', isConfirmed: false, details: 'Pending finger sizing.' },
      { key: 'delivery_timeline', label: 'Workshop Delivery Feasibility', isConfirmed: true, details: 'Can be produced in 2 weeks once confirmed.', confirmedAt: '2026-08-29', confirmedBy: 'Elena Rossi' }
    ],
    nextFollowUpDate: '2026-09-03',
    assignedCraftsmanId: 'CRF-02',
    assignedCraftsmanName: 'Elena Rossi',
    activityLog: [
      { id: 'act-61', date: '2026-08-28', type: 'whatsapp', text: 'Aarav inquired about adding a matching groom band to his order.', author: 'Sales Desk' },
      { id: 'act-62', date: '2026-08-29', type: 'quote_sent', text: 'Shared CAD renders and quotation of ₹1,65,000.', author: 'Elena Rossi' }
    ],
    createdAt: '2026-08-28',
    updatedAt: '2026-08-29'
  },

  // --- CUSTOMER 3: Eleanor Rigby (CUS-001) --- Multiple Enquiries
  {
    id: 'PROSP-2026-004',
    title: 'Marquise Diamond Foliate Vine Bangle',
    customerId: 'CUS-001',
    customerName: 'Eleanor Rigby',
    customerPhone: '+44 7700 900122',
    customerEmail: 'eleanor@abbeyroad.com',
    customerCity: 'South Mumbai / London',
    leadSource: 'Instagram',
    priority: 'High',
    category: 'Bracelets',
    status: 'pending_confirmation',
    targetBudget: 420000,
    estimatedQuote: 445000,
    advanceRequired: 120000,
    advanceReceived: 0,
    advancePaymentMethod: 'Pending',
    targetDeliveryDate: '2026-10-10',
    occasion: 'Anniversary Gift',
    metalPreference: {
      type: 'Gold',
      purity: '18K Rose Gold',
      color: 'Rose',
      estWeightGrams: 24.5,
      isConfirmed: true,
      notes: '18K Warm Pink Rose Gold alloy with high polish finish.'
    },
    gemstoneDetails: {
      primaryStone: 'Marquise & Round Brilliant Diamonds (3.65ct TW)',
      stoneType: 'natural',
      caratWeight: 3.65,
      cutShape: 'Marquise & Round',
      accentStones: 'F-G color VS1 clarity diamonds',
      isConfirmed: false,
      notes: 'Client selecting between full marquise vs mixed round/marquise clusters.'
    },
    sizingDetails: {
      wristSize: '6.5 inches oval wrist fit',
      isConfirmed: true,
      notes: 'Hinged bangle with concealed double-button clasp.'
    },
    designDetails: {
      sketchApproved: true,
      cadRenderApproved: false,
      engravingText: 'With Love, Always',
      specifications: 'Organic asymmetrical botanical branch bangle set with leaf-shaped marquise diamonds branching along a dual-wire 18K rose gold frame.',
      samplePhotos: [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800'
      ],
      notes: 'Inspiration from Art Nouveau floral jewels.'
    },
    confirmations: [
      { key: 'gemstone_selection', label: 'Gemstone & Diamond Selection', isConfirmed: false, details: 'Client reviewing diamond layout rendering.' },
      { key: 'sketch_cad_approval', label: 'Design Concept & CAD Sign-off', isConfirmed: true, details: 'Initial vine sketch approved.', confirmedAt: '2026-08-26', confirmedBy: 'Eleanor Rigby' },
      { key: 'metal_purity', label: 'Metal Purity & Alloy Choice', isConfirmed: true, details: '18K Rose Gold confirmed.', confirmedAt: '2026-08-26', confirmedBy: 'Eleanor Rigby' },
      { key: 'sizing_measurements', label: 'Wrist Contour & Bangle Fit', isConfirmed: true, details: '6.5 inch oval fit confirmed.', confirmedAt: '2026-08-27', confirmedBy: 'Eleanor Rigby' },
      { key: 'budget_quote_approval', label: 'Final Quotation Sign-off', isConfirmed: false, details: 'Quotation of ₹4,45,000 under review.' },
      { key: 'advance_deposit', label: 'Advance Deposit Received', isConfirmed: false, details: 'Awaiting deposit upon stone layout finalization.' },
      { key: 'delivery_timeline', label: 'Workshop Delivery Feasibility', isConfirmed: true, details: 'Master Hiroshi scheduled 3-week bench time.', confirmedAt: '2026-08-27', confirmedBy: 'Master Hiroshi' }
    ],
    nextFollowUpDate: '2026-09-04',
    assignedCraftsmanId: 'CRF-01',
    assignedCraftsmanName: 'Master Hiroshi',
    activityLog: [
      { id: 'act-14', date: '2026-08-25', type: 'whatsapp', text: 'Eleanor requested a custom rose gold bangle inspired by vintage botanical motifs.', author: 'Concierge' },
      { id: 'act-15', date: '2026-08-26', type: 'sketch_sent', text: 'Sent concept sketch #BR-102.', author: 'Design Team' }
    ],
    createdAt: '2026-08-25',
    updatedAt: '2026-08-27'
  },
  {
    id: 'PROSP-2026-007',
    title: 'Cornflower Blue Sapphire & Diamond Halo Pendant',
    customerId: 'CUS-001',
    customerName: 'Eleanor Rigby',
    customerPhone: '+44 7700 900122',
    customerEmail: 'eleanor@abbeyroad.com',
    customerCity: 'South Mumbai / London',
    leadSource: 'Instagram',
    priority: 'Standard',
    category: 'Pendants',
    status: 'converted_to_order',
    targetBudget: 280000,
    estimatedQuote: 295000,
    advanceRequired: 100000,
    advanceReceived: 100000,
    advancePaymentMethod: 'Credit Card',
    targetDeliveryDate: '2026-09-18',
    occasion: 'Personal Milestones',
    metalPreference: {
      type: 'Gold',
      purity: '18K White Gold',
      color: 'White',
      estWeightGrams: 7.2,
      isConfirmed: true,
      notes: '18K White Gold with platinum prongs on center stone.'
    },
    gemstoneDetails: {
      primaryStone: '1.85ct Royal Ceylon Sapphire',
      stoneType: 'natural',
      caratWeight: 1.85,
      cutShape: 'Cushion Cut',
      accentStones: '0.65ct Brilliant Cut Diamonds',
      isConfirmed: true,
      notes: 'GRS Certified Ceylon Blue Sapphire.'
    },
    sizingDetails: {
      length: '18-inch adjustable diamond-cut cable chain',
      isConfirmed: true,
      notes: 'Jump rings at 16, 17, and 18 inches.'
    },
    designDetails: {
      sketchApproved: true,
      cadRenderApproved: true,
      engravingText: '',
      specifications: 'Classic royal cushion sapphire pendant framed by seamless micro-pavé diamond halo and articulated diamond-set bail.',
      samplePhotos: [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800'
      ],
      notes: 'Converted to active workshop order.'
    },
    confirmations: [
      { key: 'gemstone_selection', label: 'Gemstone & Diamond Selection', isConfirmed: true, details: '1.85ct Ceylon sapphire certified and approved.', confirmedAt: '2026-08-20', confirmedBy: 'Eleanor Rigby' },
      { key: 'sketch_cad_approval', label: 'Design Concept & CAD Sign-off', isConfirmed: true, details: 'CAD design approved.', confirmedAt: '2026-08-21', confirmedBy: 'Eleanor Rigby' },
      { key: 'metal_purity', label: 'Metal Purity & Alloy Choice', isConfirmed: true, details: '18K White Gold confirmed.', confirmedAt: '2026-08-20', confirmedBy: 'Eleanor Rigby' },
      { key: 'sizing_measurements', label: 'Chain Length & Bail Sizing', isConfirmed: true, details: '18-inch chain confirmed.', confirmedAt: '2026-08-21', confirmedBy: 'Eleanor Rigby' },
      { key: 'budget_quote_approval', label: 'Final Quotation Sign-off', isConfirmed: true, details: '₹2,95,000 accepted.', confirmedAt: '2026-08-22', confirmedBy: 'Eleanor Rigby' },
      { key: 'advance_deposit', label: 'Advance Deposit Received', isConfirmed: true, details: '₹1,00,000 charged via Amex.', confirmedAt: '2026-08-22', confirmedBy: 'Finance Desk' },
      { key: 'delivery_timeline', label: 'Workshop Delivery Feasibility', isConfirmed: true, details: 'Production slotted with Master Hiroshi.', confirmedAt: '2026-08-22', confirmedBy: 'Master Hiroshi' }
    ],
    nextFollowUpDate: '2026-09-15',
    assignedCraftsmanId: 'CRF-01',
    assignedCraftsmanName: 'Master Hiroshi',
    convertedOrderId: 'BSK-8812',
    convertedOrderType: 'bespoke',
    convertedAt: '2026-08-22',
    activityLog: [
      { id: 'act-21', date: '2026-08-20', type: 'meeting', text: 'Eleanor selected the 1.85ct Ceylon sapphire.', author: 'Gemology Desk' },
      { id: 'act-22', date: '2026-08-22', type: 'confirmation_toggle', text: 'Converted to Bespoke Workshop Order #BSK-8812 with ₹1,00,000 advance.', author: 'Studio Manager' }
    ],
    createdAt: '2026-08-18',
    updatedAt: '2026-08-22'
  },

  // --- CUSTOMER 4: Priya Narang (CUS-007) ---
  {
    id: 'PROSP-2026-003',
    title: 'Art Deco Sapphire & Diamond Chandelier Earrings',
    customerId: 'CUS-007',
    customerName: 'Priya Narang',
    customerPhone: '+91 99870 11233',
    customerEmail: 'priya.narang@narangestate.com',
    customerCity: 'New Delhi / London',
    leadSource: 'Referral by Mrs. Singhania',
    priority: 'Standard',
    category: 'Earrings',
    status: 'gathering_info',
    targetBudget: 750000,
    estimatedQuote: 820000,
    advanceRequired: 250000,
    advanceReceived: 0,
    advancePaymentMethod: 'Pending',
    targetDeliveryDate: '2026-11-20',
    occasion: 'Gala Fundraiser & Sangeet',
    metalPreference: {
      type: 'Gold',
      purity: '18K White Gold',
      color: 'White',
      estWeightGrams: 28.0,
      isConfirmed: true,
      notes: '18K White Gold with black rhodium accents on vintage milgrain borders.'
    },
    gemstoneDetails: {
      primaryStone: 'Matched Pair Royal Blue Ceylon Sapphires (approx 3.2ct total)',
      stoneType: 'natural',
      caratWeight: 3.2,
      cutShape: 'Cushion Cut',
      accentStones: '4.8ct Baguette & Trapeze Cut VS Diamonds',
      isConfirmed: false,
      notes: 'Sourcing matching pairs of unheated Ceylon blue sapphires from Sri Lanka broker.'
    },
    sizingDetails: {
      length: '2.4 inches total drop length',
      isConfirmed: false,
      notes: 'Client requested weight test to ensure comfort for 6-hour continuous wear.'
    },
    designDetails: {
      sketchApproved: false,
      cadRenderApproved: false,
      engravingText: '',
      specifications: 'Art Deco geometric stepped chandelier earrings with articulated drop mechanisms. Cushion sapphire centers with graduating baguette diamond rays and milgrain filigree.',
      samplePhotos: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800'
      ],
      notes: 'Initial pencil sketch in progress by Senior Designer.'
    },
    confirmations: [
      { key: 'gemstone_selection', label: 'Gemstone Selection & Certification', isConfirmed: false, details: '3 gemstone lots being evaluated for matched pair color saturation.' },
      { key: 'sketch_cad_approval', label: 'Design Concept & CAD Sign-off', isConfirmed: false, details: 'Awaiting 2 concept sketches to present to client on Sep 8.' },
      { key: 'metal_purity', label: 'Metal Purity & Alloy Choice', isConfirmed: true, details: '18K White Gold with black rhodium confirmed.', confirmedAt: '2026-08-29', confirmedBy: 'Marcus Thorne' },
      { key: 'sizing_measurements', label: 'Drop Length & Ear Weight Balance', isConfirmed: false, details: 'Pending hollow-core weight calculation for comfort.' },
      { key: 'budget_quote_approval', label: 'Final Quotation Sign-off', isConfirmed: false, details: 'Estimate given ₹8,20,000; awaiting final stone selection.' },
      { key: 'advance_deposit', label: 'Advance Deposit Received', isConfirmed: false, details: 'Pending design approval.' },
      { key: 'delivery_timeline', label: 'Artisan Workshop Feasibility', isConfirmed: false, details: 'Earliest workshop slot Nov 1.' }
    ],
    nextFollowUpDate: '2026-09-08',
    assignedCraftsmanId: 'CRF-03',
    assignedCraftsmanName: 'Marcus Thorne',
    activityLog: [
      { id: 'act-7', date: '2026-08-28', type: 'call', text: 'Initial 30-min discovery call over WhatsApp video.', author: 'Senior Concierge' },
      { id: 'act-8', date: '2026-08-29', type: 'whatsapp', text: 'Client sent 3 moodboard inspiration images from vintage Christie\'s catalog.', author: 'Creative Team' }
    ],
    createdAt: '2026-08-28',
    updatedAt: '2026-08-29'
  }
];
