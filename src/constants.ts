import { JewelryItem, BespokeItem } from "./types";

export const BESPOKE_ITEMS: BespokeItem[] = [
  {
    id: "b1",
    name: "The Heirloom Transformation",
    description: "A client's vintage brooch reimagined as a modern statement necklace.",
    beforeImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
    afterImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
    story: "This piece was created using diamonds from a family heirloom that had been sitting in a vault for decades. We carefully extracted the stones and set them into a contemporary 18k white gold choker, giving new life to a cherished memory.",
    date: "October 2025"
  },
  {
    id: "b2",
    name: "Celestial Engagement Ring",
    description: "A completely custom design featuring a rare blue diamond and astronomical motifs.",
    afterImage: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
    story: "The client wanted a ring that captured the essence of the night sky where they first met. We sourced a unique 2ct blue diamond and surrounded it with a constellation of smaller white diamonds, all set in a custom-engraved platinum band.",
    date: "December 2025"
  },
  {
    id: "b3",
    name: "Art Deco Revival",
    description: "Restoration and enhancement of a 1920s emerald ring.",
    beforeImage: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=800",
    afterImage: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
    story: "A classic Art Deco ring that had lost its luster. We replaced the worn side stones with high-clarity baguettes and reinforced the platinum setting, while preserving the original intricate filigree work.",
    date: "January 2026"
  }
];

export const JEWELRY_ITEMS: JewelryItem[] = [
  // 1. PEARLS COLLECTION (Dedicated Navbar Pillar)
  {
    id: "sov-1",
    name: "The Emerald Sovereign Pearl Collar",
    collection: "Sovereign",
    category: "Pearls",
    subCategory: "South-Sea",
    gender: "Women",
    price: "$18,400",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "An imperial double-strand of lustrous Akoya pearls crowned with an archival floral medallion. Centered around a luminous natural cabochon emerald encased in rose-cut diamond lotus petals, culminating in three suspended South Sea teardrop pearls.",
    materials: "18k White Gold, Natural Cabochon Emerald (4.8ct), Akoya & South Sea Pearls, 2.15ct Rose-Cut Diamonds",
    shippingCost: "$120",
    details: [
      "Hand-matched double-strand Akoya cultured pearls with mirror luster",
      "Rare Colombian cabochon emerald center stone with deep verdant glow",
      "Artisan openwork floral halo set with rose-cut and brilliant diamonds",
      "Trio of detachable South Sea teardrop pearl drops with diamond articulated caps"
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "1",
    name: "Ethereal Pearl Drops",
    collection: "L'Aurore",
    category: "Pearls",
    subCategory: "South-Sea",
    gender: "Women",
    price: "$4,200",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "Hand-selected South Sea pearls suspended from 18k white gold and pavé diamonds.",
    materials: "18k White Gold, South Sea Pearls, 0.45ct Pavé Diamonds",
    shippingCost: "$50",
    details: [
      "Hand-selected 12mm South Sea pearls",
      "G-H color, VS clarity diamonds",
      "Signature ANOVI hallmark",
      "Handcrafted in our London atelier"
    ],
    reviews: [
      {
        id: "r1",
        reviewerName: "Sophia L.",
        rating: 5,
        comment: "Absolutely stunning! The pearls are even more beautiful in person. The craftsmanship is top-notch.",
        date: "2024-02-15"
      },
      {
        id: "r2",
        reviewerName: "Isabella M.",
        rating: 4,
        comment: "Beautiful design, though they were slightly heavier than I expected. Still, they look very elegant.",
        date: "2024-01-20"
      }
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "9",
    name: "Akoya Moonlight Studs",
    collection: "L'Aurore",
    category: "Pearls",
    subCategory: "Japanese-Akoya",
    gender: "Women",
    price: "$1,800",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "Classic 8mm Akoya pearls with exceptional luster, set in 18k white gold.",
    materials: "8mm Akoya Pearls, 18k White Gold",
    shippingCost: "$30",
    details: [
      "AAA quality Akoya pearls",
      "Mirror-like luster",
      "18k white gold posts",
      "Elegant minimalist design"
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "10",
    name: "Tahitian Night Pendant",
    collection: "Nocturne",
    category: "Pearls",
    subCategory: "Tahitian",
    gender: "Women",
    price: "$3,500",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "A single, dark Tahitian pearl with peacock overtones, suspended from a diamond-set bail.",
    materials: "11mm Tahitian Pearl, 18k White Gold, 0.15ct Diamonds",
    shippingCost: "$45",
    details: [
      "Naturally dark Tahitian pearl",
      "Peacock green overtones",
      "Brilliant-cut diamond bail",
      "18-inch white gold chain"
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "11",
    name: "Fresh Water Blossom Necklace",
    collection: "Heritage",
    category: "Pearls",
    subCategory: "Fresh Water Pearls",
    gender: "Women",
    price: "$1,200",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "A delicate strand of hand-knotted fresh water pearls with a floral gold clasp.",
    materials: "Fresh Water Pearls, 14k Yellow Gold",
    shippingCost: "$25",
    details: [
      "Hand-knotted silk thread",
      "Lustrous fresh water pearls",
      "Floral motif 14k gold clasp",
      "Timeless bridal accessory"
    ],
    inStock: true,
    isArchived: false
  },

  // 2. DIAMONDS COLLECTION (Inside Collections Dropdown)
  {
    id: "snw-3",
    name: "Étoile Polaire Diamond Snowflakes",
    collection: "Lumière",
    category: "Diamonds",
    subCategory: "Natural",
    gender: "Women",
    price: "$9,800",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "A pair of sculptural floral snowflake stud earrings radiating celestial brilliance. Each piece features a central brilliant-cut solitaire diamond surrounded by eight delicate petals of prong-set round diamonds in two-tone white and yellow gold.",
    materials: "18k Two-Tone Gold, 3.60ct F/VVS Brilliant-Cut Diamonds",
    shippingCost: "$60",
    details: [
      "Handcrafted eight-point celestial snowflake motif with scalloped depth",
      "Precision-matched F color, VVS clarity round brilliant diamonds",
      "Two-tone 18k gold setting optimizing diamond fire and warm golden undertones",
      "Secure screw-back atelier posts for high jewelry comfort"
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "byz-5",
    name: "Aurelia Byzantine Filigree Cuff",
    collection: "Heritage",
    category: "Diamonds",
    subCategory: "Natural",
    gender: "Women",
    price: "$16,800",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "A masterwork of historical goldsmithing, this wide 22k yellow gold hinged bangle features dual milgrain beaded borders, twisted cord filigree, and a continuous openwork floral vine set with diamond-encrusted flower clusters and square station centerpieces.",
    materials: "22k Yellow Gold, Black Rhodium Accents, 2.85ct Brilliant-Cut Diamonds",
    shippingCost: "$100",
    details: [
      "Hand-chiseled 22k gold with granular beaded milgrain rims",
      "Botanical vine motif with black rhodium-dipped diamond settings for antique contrast",
      "Concealed pressure clasp with dual safety catches",
      "Over 120 hours of individual goldsmith artisan engraving"
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "5",
    name: "Lumière Diamond Choker",
    collection: "Lumière",
    category: "Diamonds",
    subCategory: "Natural",
    gender: "Women",
    price: "$24,000",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "A breathtaking arrangement of pear-shaped diamonds totaling 12 carats.",
    materials: "Platinum, 12ct Pear-Shaped Diamonds",
    shippingCost: "$150",
    details: [
      "GIA certified pear-shaped diamonds",
      "Platinum setting for maximum brilliance",
      "Adjustable length for perfect fit",
      "Comes with a certificate of authenticity"
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "3",
    name: "Solstice Diamond Solitaire",
    collection: "Lumière",
    category: "Diamonds",
    subCategory: "Natural",
    gender: "Women",
    price: "$12,000",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "Two-carat total weight GIA certified diamonds in our signature minimalist setting.",
    materials: "18k White Gold, 2.0ct GIA Diamond",
    shippingCost: "$80",
    details: [
      "GIA certified center diamond",
      "Excellent cut, symmetry, and polish",
      "Minimalist four-prong setting",
      "Complimentary resizing included"
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "8",
    name: "Infinity Diamond Cuff",
    collection: "Nocturne",
    category: "Diamonds",
    subCategory: "Natural",
    gender: "Women",
    price: "$18,000",
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "A sculptural masterpiece featuring interlaced bands of white gold and diamonds.",
    materials: "18k White Gold, 5.0ct Diamonds",
    shippingCost: "$120",
    details: [
      "Interlaced infinity design",
      "5 carats of brilliant-cut diamonds",
      "Secure double-lock clasp",
      "Statement piece for any occasion"
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "15",
    name: "Silver Link Chain",
    collection: "Heritage",
    category: "Diamonds",
    subCategory: "Natural",
    gender: "Men",
    price: "$580",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "A substantial sterling silver link chain with subtle diamond-set clasp accents.",
    materials: "925 Sterling Silver, Natural Diamond Accent",
    shippingCost: "$15",
    details: [
      "925 Sterling Silver hallmark",
      "High-polish finish with diamond-accented toggle",
      "Toggle clasp",
      "Handcrafted in our London atelier"
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "12",
    name: "Sterling Silver Ribbed Bangle",
    collection: "Heritage",
    category: "Diamonds",
    subCategory: "Natural",
    gender: "Men",
    price: "$850",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "A bold, sculptural bangle in high-polish sterling silver with an inset flush-set diamond.",
    materials: "925 Sterling Silver, Natural Brilliant Diamond",
    shippingCost: "$20",
    details: [
      "925 Sterling Silver hallmark",
      "Hand-finished ribbed architectural texture",
      "Flush-mounted diamond signature hallmark",
      "Modern architectural masculine style"
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "ovl-4",
    name: "Lumière Oval Diamond Solitaires",
    collection: "Lumière",
    category: "Diamonds",
    subCategory: "Labgrown",
    gender: "Women",
    price: "$14,200",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "Timeless oval-cut diamond solitaire stud earrings of breathtaking clarity and proportions. Set in minimalist four-prong platinum baskets designed to capture and amplify maximum natural light from every perspective.",
    materials: "950 Platinum, 4.02ct Total Weight Oval-Cut Labgrown Diamonds (D-E / VS1)",
    shippingCost: "$90",
    details: [
      "Matched pair of 2.01ct certified oval brilliant labgrown diamonds",
      "Minimalist low-profile four-prong platinum settings",
      "Hand-finished in Mayfair atelier with signature ANOVI hallmark",
      "Exceptional symmetry with brilliant fire and ice dispersion"
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "19",
    name: "Glimmering Tennis Bracelet",
    collection: "Lumière",
    category: "Diamonds",
    subCategory: "Labgrown",
    gender: "Women",
    price: "$3,800",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "A continuous line of brilliant labgrown stones, creating a never-ending shimmer on the wrist.",
    materials: "18k White Gold, Brilliant-Cut Labgrown Diamonds",
    shippingCost: "$40",
    details: [
      "Secure box clasp with safety latch",
      "18k white gold setting",
      "Modern classic",
      "Handcrafted in our London atelier"
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "16",
    name: "Starlight Brilliance Studs",
    collection: "Lumière",
    category: "Diamonds",
    subCategory: "Zircon",
    gender: "Women",
    price: "$1,200",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "Brilliant-cut zircon stones set in 18k white gold, radiating a celestial celestial fire.",
    materials: "18k White Gold, Brilliant-Cut High-Refractive Zircon",
    shippingCost: "$25",
    details: [
      "High-dispersion optical brilliance",
      "18k white gold posts",
      "Elegant minimalist design",
      "Handcrafted in our London atelier"
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "18",
    name: "Radiant Halo Necklace",
    collection: "Lumière",
    category: "Diamonds",
    subCategory: "Zircon",
    gender: "Women",
    price: "$2,500",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "A stunning halo pendant with a central brilliant zircon stone surrounded by a circle of light.",
    materials: "18k White Gold, Brilliant-Cut Zircon Gems",
    shippingCost: "$30",
    details: [
      "Halo setting for maximum sparkle",
      "18k white gold chain",
      "Timeless elegance",
      "Handcrafted in our London atelier"
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "13",
    name: "Lunar Silver Drops",
    collection: "Heritage",
    category: "Diamonds",
    subCategory: "Zircon",
    gender: "Women",
    price: "$450",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "Cascading sterling silver discs adorned with sparkling zircon stars reflecting the moon.",
    materials: "925 Sterling Silver, Natural White Zircons",
    shippingCost: "$15",
    details: [
      "925 Sterling Silver",
      "High-polish finish",
      "Lightweight design",
      "Handcrafted in our London atelier"
    ],
    inStock: true,
    isArchived: false
  },

  // 3. STONES COLLECTION (Inside Collections Dropdown)
  {
    id: "6",
    name: "Seraphina Emerald Pendant",
    collection: "L'Aurore",
    category: "Stones",
    subCategory: "Gemstones",
    gender: "Women",
    price: "$15,500",
    image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "A deep green Zambian emerald surrounded by a halo of micro-pavé diamonds.",
    materials: "18k Yellow Gold, 4.5ct Zambian Emerald, 0.8ct Diamonds",
    shippingCost: "$100",
    details: [
      "Vivid green Zambian emerald",
      "Classic halo design",
      "18-inch 18k yellow gold chain",
      "Signature emerald cut"
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "7",
    name: "Eternal Ruby Band",
    collection: "Heritage",
    category: "Stones",
    subCategory: "Gemstones",
    gender: "Women",
    price: "$6,200",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "A continuous line of pigeon-blood rubies set in 18k rose gold.",
    materials: "18k Rose Gold, 2.5ct Pigeon-Blood Rubies",
    shippingCost: "$60",
    details: [
      "Natural pigeon-blood rubies",
      "Eternity band style",
      "Hand-engraved side details",
      "Symbol of eternal love"
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "2",
    name: "Celestial Sapphire Hoops",
    collection: "Nocturne",
    category: "Stones",
    subCategory: "Gemstones",
    gender: "Women",
    price: "$8,500",
    image: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "Deep blue Ceylon sapphires set in a continuous circle of brilliant-cut diamonds.",
    materials: "18k White Gold, 3.2ct Ceylon Sapphires, 1.1ct Diamonds",
    shippingCost: "$75",
    details: [
      "Ethically sourced Ceylon sapphires",
      "Continuous pavé setting",
      "Internal hinge for seamless look",
      "Available in limited quantities"
    ],
    reviews: [
      {
        id: "r3",
        reviewerName: "James W.",
        rating: 5,
        comment: "Bought these for my wife's birthday. She was speechless. The sapphires have an incredible depth of color.",
        date: "2024-03-01"
      }
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "17",
    name: "The Azure Singularity",
    collection: "One-of-a-Kind",
    category: "Stones",
    subCategory: "Gemstones",
    gender: "Women",
    price: "$45,000",
    image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "A rare, deep blue sapphire of exceptional size and clarity, set in a unique platinum mounting.",
    materials: "Platinum, 8.5ct Deep Blue Sapphire, 1.2ct Diamonds",
    shippingCost: "$250",
    details: [
      "One-of-a-kind piece",
      "GIA certified sapphire",
      "Platinum setting",
      "Handcrafted in our London atelier"
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "lab-1",
    name: "L'Aurore Labgrown Paraiba Ring",
    collection: "L'Aurore",
    category: "Stones",
    subCategory: "Labgrown",
    gender: "Women",
    price: "$7,800",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "An extraordinary neon-electric labgrown Paraiba tourmaline encased in pavé lab-cultivated diamonds and 18k white gold.",
    materials: "18k White Gold, 3.8ct Labgrown Paraiba Tourmaline, 1.2ct Labgrown Diamonds",
    shippingCost: "$60",
    details: [
      "Ethically synthesized neon cyan-blue tourmaline crystal",
      "Precision-faceted cushion cut with electric fire",
      "Signature ANOVI hallmark",
      "Eco-conscious certified haute joaillerie"
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "fnd-2",
    name: "Foundation Crimson Radiance Demi-Parure",
    collection: "Heritage",
    category: "Stones",
    subCategory: "Semi precious",
    gender: "Women",
    price: "$21,500",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "A multi-strand woven seed pearl collar anchoring a radiant cushion-cut vivid red tourmaline pendant. Encircled by a halo of brilliant pavé and geometric triangle baguettes with an Akoya baroque pearl drop, accompanied by matching floral ruby ear studs.",
    materials: "18k Rose Gold, Vivid Cushion-Cut Rubellite / Tourmaline (5.2ct), Natural Seed Pearls, 3.4ct Diamonds",
    shippingCost: "$150",
    details: [
      "Multi-strand hand-strung natural seed pearl choker necklace",
      "Pendant centered with a vivid cushion-cut gemstone with fiery crimson depth",
      "Geometric starburst diamond halo with tapered baguette facets",
      "Includes matching pair of floral halo ear clips for an opulent suite"
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "4",
    name: "Aurelia Gold Cascades",
    collection: "Heritage",
    category: "Stones",
    subCategory: "Semi precious",
    gender: "Women",
    price: "$3,800",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "Fluid 22k yellow gold links accented with carved smoky quartz drops that catch the light with every movement.",
    materials: "22k Yellow Gold, Natural Smoky Quartz",
    shippingCost: "$40",
    details: [
      "High-polish 22k gold finish",
      "Hand-faceted smoky quartz drops",
      "Lightweight for all-day comfort",
      "Inspired by ancient Roman metalwork"
    ],
    inStock: true,
    isArchived: false
  },
  {
    id: "14",
    name: "Silver Serpent Ring",
    collection: "Nocturne",
    category: "Stones",
    subCategory: "Semi precious",
    gender: "Men",
    price: "$320",
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=1200"
    ],
    description: "A coiled serpent ring in oxidized sterling silver with semi-precious tsavorite garnet eyes.",
    materials: "Oxidized Sterling Silver, Semi-Precious Tsavorite Garnets",
    shippingCost: "$10",
    details: [
      "Oxidized finish for vintage look",
      "Hand-carved scale details",
      "Adjustable masculine fit",
      "Signature Nocturne collection piece"
    ],
    inStock: true,
    isArchived: false
  }
];

export const ARCHIVE_ITEMS: JewelryItem[] = [
  {
    id: "a1",
    name: "Vintage Rose Quartz Amulet",
    collection: "Heritage Archive",
    category: "Stones",
    subCategory: "Semi precious",
    gender: "Women",
    price: "$2,800 (Original Price)",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
    description: "A rare rose quartz cabochon set in hand-engraved 18k rose gold. Circa 2018.",
    inStock: false,
    isArchived: true,
    archiveStory: "Commissioned in our Mayfair atelier, this piece celebrated the golden dawn of modern romanticism."
  },
  {
    id: "a2",
    name: "Midnight Onyx Signet",
    collection: "Nocturne Archive",
    category: "Stones",
    subCategory: "Semi precious",
    gender: "Men",
    price: "$3,500 (Original Price)",
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=800",
    description: "A bold onyx statement ring with hidden diamond details. Circa 2019.",
    inStock: false,
    isArchived: true,
    archiveStory: "Carved from deep Black Sea onyx, this signet embodied masculine quiet luxury."
  },
  {
    id: "a3",
    name: "Starlight Silver Bangle",
    collection: "Lumière Archive",
    category: "Diamonds",
    subCategory: "Zircon",
    gender: "Women",
    price: "$1,200 (Original Price)",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
    description: "Hammered sterling silver with embedded moissanite stars. Circa 2017.",
    inStock: false,
    isArchived: true,
    archiveStory: "An early experiment in celestial texture, handcrafted with raw lunar silver."
  },
  {
    id: "a4",
    name: "Gilded Leaf Ear-Climbers",
    collection: "Heritage Archive",
    category: "Stones",
    subCategory: "Semi precious",
    gender: "Women",
    price: "$2,100 (Original Price)",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
    description: "Intricate 22k gold leaf patterns that gracefully follow the ear's curve. Circa 2020.",
    inStock: false,
    isArchived: true,
    archiveStory: "Inspired by the botanical courtyards of Place Vendôme during autumn."
  }
];
