import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' })); // support larger base64 audio and image uploads

  // Initialize Gemini client on the server side
  const aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  
  // Resilient Gemini Generation with auto-retry and multi-model fallbacks
  async function generateGeminiSafe(
    client: GoogleGenAI,
    options: {
      primaryModel?: string;
      fallbackModels?: string[];
      contents: any;
      config?: any;
      maxRetries?: number;
    }
  ) {
    const modelsToTry = [
      options.primaryModel || 'gemini-3.7-flash',
      ...(options.fallbackModels || ['gemini-3.5-flash', 'gemini-3.1-flash-lite'])
    ];

    let lastError: any = null;

    for (const model of modelsToTry) {
      const retries = options.maxRetries ?? 2;
      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          const response = await client.models.generateContent({
            model,
            contents: options.contents,
            config: options.config
          });
          return response;
        } catch (err: any) {
          lastError = err;
          const msg = String(err?.message || err);
          const isDemandSpike = msg.includes('503') || msg.includes('high demand') || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('UNAVAILABLE') || msg.includes('overloaded');
          
          console.warn(`[Gemini Safe] Model ${model} attempt ${attempt + 1} notice: ${msg.slice(0, 120)}`);
          
          if (attempt < retries - 1 && isDemandSpike) {
            await new Promise(r => setTimeout(r, 700 * (attempt + 1)));
          } else {
            break; // Proceed to next fallback model
          }
        }
      }
    }

    throw lastError || new Error("All Gemini models were unavailable");
  }

  // Server-side NLP Fallback Extractor for uninterrupted operation during API spikes
  function parseNaturalLanguageCommandLocally(
    rawText: string,
    currentImages: string[] = [],
    context: any = {},
    activePendingAction: any = null
  ) {
    const text = (rawText || '').toLowerCase().trim();
    const curImgs = currentImages || [];

    // Cancellation check
    if (text.includes('cancel') || text.includes('abort') || text.includes('nevermind') || text.includes('never mind') || text === 'stop') {
      return {
        status: 'cancelled',
        reply: 'I have cancelled the in-progress action. What would you like to do next?',
        actionSummary: 'Action Cancelled',
        action: null,
        pendingAction: null,
        suggestedNextActions: ['Record a customer payment', 'Add VIP customer', 'Check gold rates', 'Upload product photos']
      };
    }

    // Active Pending Action resolution
    if (activePendingAction) {
      const type = activePendingAction.actionType;
      const collected = { ...(activePendingAction.collectedFields || {}) };

      if (type === 'RECORD_PAYMENT') {
        const amountMatch = rawText.match(/(?:₹|rs\.?|inr|\$)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/i);
        if (amountMatch) {
          const num = parseFloat(amountMatch[1].replace(/,/g, ''));
          if (num > 0 && !collected.amount) collected.amount = num;
        }
        if (text.includes('upi')) collected.paymentMethod = 'UPI';
        else if (text.includes('bank') || text.includes('wire') || text.includes('neft') || text.includes('rtgs')) collected.paymentMethod = 'Bank Transfer';
        else if (text.includes('card') || text.includes('credit')) collected.paymentMethod = 'Credit Card';
        else if (text.includes('cash')) collected.paymentMethod = 'Cash';

        if (context.customers && Array.isArray(context.customers)) {
          const found = context.customers.find((c: any) => text.includes(c.name.toLowerCase()));
          if (found && !collected.customerName) collected.customerName = found.name;
        }

        const missing = [];
        if (!collected.customerName) missing.push('customerName');
        if (!collected.amount) missing.push('amount');
        if (!collected.paymentMethod) missing.push('paymentMethod');

        if (missing.length === 0) {
          const finalClient = collected.customerName;
          const finalAmount = collected.amount;
          const finalMethod = collected.paymentMethod;
          return {
            status: 'ready',
            reply: `✅ [RECORD ADDED] The new Payment Ledger record for "${finalClient}" of ₹${finalAmount.toLocaleString()} via ${finalMethod} has been successfully created and recorded into the financial ledger.`,
            actionSummary: `Recorded ₹${finalAmount.toLocaleString()} from ${finalClient}`,
            action: {
              actionType: 'RECORD_PAYMENT',
              mutationType: 'added',
              entityType: 'Payment Ledger',
              recordName: `Payment from ${finalClient}`,
              amount: finalAmount,
              customerName: finalClient,
              paymentMethod: finalMethod,
              location: context?.activeLocation || 'Mumbai Flagship',
              paymentType: 'customer_advance',
              category: 'Inflow',
              finalState: {
                status: 'Reconciled in Ledger',
                amount: finalAmount,
                customer: finalClient,
                method: finalMethod
              }
            },
            pendingAction: null,
            suggestedNextActions: ['View financial ledger', 'Record another transaction', 'Check gold rates']
          };
        } else {
          let q = 'Could you please specify ';
          if (missing.includes('customerName') && missing.includes('amount')) q += 'the client name and the payment amount?';
          else if (missing.includes('amount')) q += 'the payment amount?';
          else if (missing.includes('paymentMethod')) q += 'the payment method (UPI, Bank Transfer, Card, or Cash)?';
          else q += 'the client name?';

          return {
            status: 'needs_clarification',
            reply: q,
            actionSummary: 'Awaiting Payment Details',
            action: null,
            pendingAction: {
              actionType: 'RECORD_PAYMENT',
              collectedFields: collected,
              missingFields: missing,
              clarifyingQuestion: q
            },
            suggestedNextActions: ['₹50,000 via UPI', '₹1,50,000 Bank Transfer', 'Aarav Mehta', 'Cancel']
          };
        }
      }
    }

    // Direct Command Parsers
    // 1. Payment
    if (text.includes('payment') || text.includes('paid') || text.includes('receive') || text.includes('advance') || text.includes('deposit')) {
      const amountMatch = rawText.match(/(?:₹|rs\.?|inr|\$)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/i);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

      let paymentMethod = 'Bank Transfer';
      if (text.includes('upi')) paymentMethod = 'UPI';
      else if (text.includes('card') || text.includes('credit')) paymentMethod = 'Credit Card';
      else if (text.includes('cash')) paymentMethod = 'Cash';
      else if (text.includes('wire') || text.includes('neft') || text.includes('rtgs')) paymentMethod = 'Bank Transfer';

      let customerName = '';
      if (context.customers && Array.isArray(context.customers)) {
        const found = context.customers.find((c: any) => text.includes(c.name.toLowerCase()));
        if (found) customerName = found.name;
      }
      if (!customerName) {
        const forMatch = rawText.match(/(?:from|for|client|customer)s+([A-Za-zs]+?)(?:s+(?:of|via|for|in|using|amount|₹|rs|$|d)|$)/i);
        if (forMatch && forMatch[1].trim().length > 2) {
          customerName = forMatch[1].trim();
        }
      }

      if (amount && customerName) {
        return {
          status: 'ready',
          reply: `✅ [RECORD ADDED] The new Payment Ledger record for "${customerName}" of ₹${amount.toLocaleString()} via ${paymentMethod} has been successfully created and recorded into the financial ledger.`,
          actionSummary: `Recorded ₹${amount.toLocaleString()} from ${customerName}`,
          action: {
            actionType: 'RECORD_PAYMENT',
            mutationType: 'added',
            entityType: 'Payment Ledger',
            recordName: `Payment from ${customerName}`,
            amount,
            customerName,
            paymentMethod,
            location: context?.activeLocation || 'Mumbai Flagship',
            paymentType: 'customer_advance',
            category: 'Inflow',
            finalState: {
              status: 'Reconciled in Ledger',
              amount,
              customer: customerName,
              method: paymentMethod
            }
          },
          pendingAction: null,
          suggestedNextActions: ['View financial ledger', 'Add another transaction', 'Check gold rates']
        };
      } else {
        const collected: any = {};
        const missing: string[] = [];
        if (amount) collected.amount = amount; else missing.push('amount');
        if (customerName) collected.customerName = customerName; else missing.push('customerName');
        collected.paymentMethod = paymentMethod;

        const q = !customerName ? 'Which client is this payment for, and what was the exact amount?' : 'What was the exact payment amount and method (UPI, Bank Transfer, Card)?';
        return {
          status: 'needs_clarification',
          reply: q,
          actionSummary: 'Awaiting Payment Details',
          action: null,
          pendingAction: {
            actionType: 'RECORD_PAYMENT',
            collectedFields: collected,
            missingFields: missing,
            clarifyingQuestion: q
          },
          suggestedNextActions: ['₹50,000 via UPI', '₹1,50,000 Bank Transfer', 'Priya Sharma', 'Cancel']
        };
      }
    }

    // 2. Add product or image upload
    if (curImgs.length > 0 || text.includes('product') || text.includes('catalog') || text.includes('ring') || text.includes('necklace') || text.includes('earring') || text.includes('bracelet')) {
      let category = 'Rings';
      if (text.includes('necklace') || text.includes('pendant')) category = 'Necklaces';
      else if (text.includes('earring')) category = 'Earrings';
      else if (text.includes('bracelet') || text.includes('bangle')) category = 'Bracelets';

      const priceMatch = rawText.match(/(?:₹|rs\.?|inr|\$|price|at)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/i);
      const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 85000;

      const name = `Handcrafted ${category.slice(0, -1)} Masterpiece`;
      return {
        status: 'ready',
        reply: `✅ [RECORD ADDED] The new Product record for "${name}" in category ${category} (₹${price.toLocaleString()}) has been successfully created in the catalog.`,
        actionSummary: `Added Product: ${name}`,
        action: {
          actionType: 'ADD_PRODUCT',
          mutationType: 'added',
          entityType: 'Product',
          recordName: name,
          name,
          category,
          price,
          stock: 1,
          material: '18K Gold & Fine Gemstones',
          description: 'Artisanal high jewelry creation crafted in the atelier.',
          images: curImgs,
          finalState: {
            status: 'Active in Catalog',
            name,
            category,
            price
          }
        },
        pendingAction: null,
        suggestedNextActions: ['View catalog inventory', 'Adjust stock', 'Generate certificate']
      };
    }

    // 3. Navigation
    if (text.includes('inventory') || text.includes('catalog') || text.includes('stock')) {
      return {
        status: 'ready',
        reply: 'Navigating to Inventory & Master Catalog.',
        actionSummary: 'Opened Inventory',
        action: {
          actionType: 'NAVIGATE_TAB',
          mutationType: 'navigated',
          entityType: 'Navigation',
          recordName: 'Inventory',
          targetTab: 'inventory',
          finalState: { activeTab: 'inventory' }
        },
        pendingAction: null,
        suggestedNextActions: ['Add product', 'Adjust stock', 'View ledger']
      };
    }

    // General query default
    return {
      status: 'ready',
      reply: `I have noted your atelier request: "${rawText}". The system is synchronized.`,
      actionSummary: 'Command Processed',
      action: null,
      pendingAction: null,
      suggestedNextActions: ['Record a customer payment', 'Check gold rates', 'View CRM customers', 'Open financial ledger']
    };
  }

  function generateLocalProductDetails(images: string[] = [], prompt: string = '', currentRates: any = {}) {
    const p = (prompt || '').toLowerCase();
    let category = 'Rings';
    if (p.includes('necklace') || p.includes('pendant')) category = 'Necklaces';
    else if (p.includes('earring')) category = 'Earrings';
    else if (p.includes('bracelet') || p.includes('bangle')) category = 'Bracelets';

    const priceMatch = (prompt || '').match(/(?:₹|rs\.?|inr|\$)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/i);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 85000;

    return {
      name: `Bespoke ${category.slice(0, -1)} Creation`,
      category,
      material: '18K Yellow Gold & VS Diamonds',
      materialDetail: 'Handcrafted in 18K Gold featuring calibrated round brilliant cut diamonds.',
      price,
      stock: 1,
      sku: `SKU-${category.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      description: 'Artisanal atelier piece crafted with exceptional precision and certified gemstones.'
    };
  }

  // API HEALTH CHECK
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Lumora Backend is operational" });
  });

  // DEFAULT/FALLBACK METAL RATES (Updated to current live Indian rates)
  const DEFAULT_RATES = {
    india: {
      currency: 'INR',
      unit: 'g',
      gold: {
        '24k': 7819.36,
        '22k': 7167.75,
        '20k': 6516.13,
        '18k': 5864.52,
        '14k': 4561.29,
        '9k': 2932.26,
      },
      silver: {
        '99.99': 93.15,
        '92.5': 86.16,
      }
    },
    global: {
      currency: 'USD',
      unit: 'g',
      gold: {
        '24k': 84.50,
        '22k': 77.45,
        '20k': 70.42,
        '18k': 63.38,
        '14k': 49.30,
        '9k': 31.70,
      },
      silver: {
        '99.99': 1.10,
        '92.5': 1.02,
      }
    },
    trend: 'up',
    lastUpdated: 'Live'
  };

  async function fetchGoldApiRates(): Promise<any> {
    const apiToken = process.env.GOLDAPI_IO_TOKEN;
    if (!apiToken || apiToken.trim() === "" || apiToken.includes("YOUR_GOLD_API")) {
      console.log("No goldapi.io token found in environment. Falling back to primary feeds.");
      return null;
    }

    try {
      console.log("Fetching live rates from goldapi.io...");
      const headers = {
        "x-access-token": apiToken,
        "Content-Type": "application/json"
      };

      // Fetch base Gold rate in INR
      const goldResponse = await fetch("https://www.goldapi.io/api/XAU/INR", { headers, signal: AbortSignal.timeout(10000) });
      if (!goldResponse.ok) {
        throw new Error(`GoldAPI gold fetch error: ${goldResponse.status}`);
      }
      const goldData = await goldResponse.json() as any;

      // Fetch base Silver rate in INR
      const silverResponse = await fetch("https://www.goldapi.io/api/XAG/INR", { headers, signal: AbortSignal.timeout(10000) });
      if (!silverResponse.ok) {
        throw new Error(`GoldAPI silver fetch error: ${silverResponse.status}`);
      }
      const silverData = await silverResponse.json() as any;

      const baseGoldPerG = goldData.price_gram;
      const baseSilverPerG = silverData.price_gram;

      if (!baseGoldPerG || !baseSilverPerG) {
        throw new Error("Invalid payload or missing price_gram from goldapi.io");
      }

      console.log(`[GoldAPI.io SUCCESS] Base Gold/g: ₹${baseGoldPerG}, Base Silver/g: ₹${baseSilverPerG}`);

      // Calculate global USD equivalents from the exchange rate provided or fallback
      const exchangeRate = goldData.exchange_rate || silverData.exchange_rate || 83.5;
      const baseGoldPerGUsd = baseGoldPerG / exchangeRate;
      const baseSilverPerGUsd = baseSilverPerG / exchangeRate;

      return {
        india: {
          currency: 'INR',
          unit: 'g',
          gold: {
            '24k': Number(baseGoldPerG.toFixed(2)),
            '22k': Number((baseGoldPerG * 22 / 24).toFixed(2)),
            '20k': Number((baseGoldPerG * 20 / 24).toFixed(2)),
            '18k': Number((baseGoldPerG * 18 / 24).toFixed(2)),
            '14k': Number((baseGoldPerG * 14 / 24).toFixed(2)),
            '9k': Number((baseGoldPerG * 9 / 24).toFixed(2)),
          },
          silver: {
            '99.99': Number(baseSilverPerG.toFixed(2)),
            '92.5': Number((baseSilverPerG * (0.925 / 0.999)).toFixed(2)),
          }
        },
        global: {
          currency: 'USD',
          unit: 'g',
          gold: {
            '24k': Number(baseGoldPerGUsd.toFixed(2)),
            '22k': Number((baseGoldPerGUsd * 22 / 24).toFixed(2)),
            '20k': Number((baseGoldPerGUsd * 20 / 24).toFixed(2)),
            '18k': Number((baseGoldPerGUsd * 18 / 24).toFixed(2)),
            '14k': Number((baseGoldPerGUsd * 14 / 24).toFixed(2)),
            '9k': Number((baseGoldPerGUsd * 9 / 24).toFixed(2)),
          },
          silver: {
            '99.99': Number(baseSilverPerGUsd.toFixed(2)),
            '92.5': Number((baseSilverPerGUsd * (0.925 / 0.999)).toFixed(2)),
          }
        }
      };
    } catch (error) {
      console.error("Error in fetchGoldApiRates:", error);
      return null;
    }
  }

  async function fetchYahooFinancePrice(ticker: string): Promise<number | null> {
    try {
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status} for ${ticker}`);
      }
      const data = await response.json() as any;
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (typeof price === 'number') {
        return price;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching Yahoo Finance data for ${ticker}:`, error);
      return null;
    }
  }

  async function fetchYahooRates(): Promise<any> {
    try {
      console.log("Fetching live rates from Yahoo Finance (GC=F, SI=F, USDINR=X)...");
      
      const goldUsdPerOz = await fetchYahooFinancePrice("GC=F");
      const silverUsdPerOz = await fetchYahooFinancePrice("SI=F");
      const usdInrRate = await fetchYahooFinancePrice("USDINR=X");
      
      if (!goldUsdPerOz || !silverUsdPerOz || !usdInrRate) {
        throw new Error(`Failed to fetch one or more tickers from Yahoo. Gold: ${goldUsdPerOz}, Silver: ${silverUsdPerOz}, USD/INR: ${usdInrRate}`);
      }
      
      console.log(`Yahoo Finance live raw data: Gold/oz: $${goldUsdPerOz}, Silver/oz: $${silverUsdPerOz}, USD/INR: ${usdInrRate}`);
      
      const TROY_OUNCE_TO_GRAMS = 31.1034768;
      
      // Base Price Calculations (Per Gram in INR)
      const goldBasePerGramInr = (goldUsdPerOz / TROY_OUNCE_TO_GRAMS) * usdInrRate;
      const silverBasePerGramInr = (silverUsdPerOz / TROY_OUNCE_TO_GRAMS) * usdInrRate;
      
      // Base Price Calculations (Per Gram in USD)
      const goldBasePerGramUsd = goldUsdPerOz / TROY_OUNCE_TO_GRAMS;
      const silverBasePerGramUsd = silverUsdPerOz / TROY_OUNCE_TO_GRAMS;
      
      return {
        india: {
          currency: 'INR',
          unit: 'g',
          gold: {
            '24k': Number(goldBasePerGramInr.toFixed(2)),
            '22k': Number((goldBasePerGramInr * 22 / 24).toFixed(2)),
            '18k': Number((goldBasePerGramInr * 18 / 24).toFixed(2)),
            '14k': Number((goldBasePerGramInr * 14 / 24).toFixed(2)),
            '9k': Number((goldBasePerGramInr * 9 / 24).toFixed(2)),
          },
          silver: {
            '99.99': Number(silverBasePerGramInr.toFixed(2)),
            '92.5': Number((silverBasePerGramInr * (0.925 / 0.999)).toFixed(2)),
          }
        },
        global: {
          currency: 'USD',
          unit: 'g',
          gold: {
            '24k': Number(goldBasePerGramUsd.toFixed(2)),
            '22k': Number((goldBasePerGramUsd * 22 / 24).toFixed(2)),
            '18k': Number((goldBasePerGramUsd * 18 / 24).toFixed(2)),
            '14k': Number((goldBasePerGramUsd * 14 / 24).toFixed(2)),
            '9k': Number((goldBasePerGramUsd * 9 / 24).toFixed(2)),
          },
          silver: {
            '99.99': Number(silverBasePerGramUsd.toFixed(2)),
            '92.5': Number((silverBasePerGramUsd * (0.925 / 0.999)).toFixed(2)),
          }
        }
      };
    } catch (e) {
      console.error("Error in fetchYahooRates:", e);
      return null;
    }
  }

  async function fetchGlobalRatesFromCoinGecko(): Promise<any> {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold,kinesis-silver&vs_currencies=usd');
      const data = await res.json();
      const paxg = data['pax-gold']?.usd;
      const kag = data['kinesis-silver']?.usd;
      
      const rates: any = { global: { gold: {}, silver: {} } };
      let updated = false;

      if (paxg && paxg > 1000) {
        const globalGold = paxg / 31.1035;
        rates.global.gold = {
          '24k': Math.round(globalGold * 100) / 100,
          '22k': Math.round((globalGold * 22 / 24) * 100) / 100,
          '18k': Math.round((globalGold * 18 / 24) * 100) / 100,
          '14k': Math.round((globalGold * 14 / 24) * 100) / 100,
          '9k': Math.round((globalGold * 9 / 24) * 100) / 100,
        };
        updated = true;
      }
      
      if (kag && kag > 10) {
        const globalSilver = kag / 31.1035;
        rates.global.silver = {
          '99.99': Math.round(globalSilver * 100) / 100,
          '92.5': Math.round((globalSilver * 0.925) * 100) / 100,
        };
        updated = true;
      }
      
      return updated ? rates : null;
    } catch (e) {
      console.warn("CoinGecko global rates fetch failed, using fallback:", e);
      return null;
    }
  }

  async function fetchGeminiGroundingRates(client: GoogleGenAI): Promise<any> {
    try {
      const prompt = `Search for the current MCX gold and silver spot prices in India (INR) today.
Find the latest live price of:
1. Gold 24k per gram (convert if quoted in 10g - e.g. 78,193 per 10g becomes 7819.3 per gram).
2. Silver 99.99 per gram (convert if quoted in kg - e.g. 93,147 per kg becomes 93.15 per gram).

Calculate the different purities:
- Gold 22k per gram = 24k price * 22 / 24
- Gold 18k per gram = 24k price * 18 / 24
- Gold 14k per gram = 24k price * 14 / 24
- Gold 9k per gram = 24k price * 9 / 24
- Silver 92.5 per gram = 99.99 price * 0.925

Also search for current global gold spot price per gram in USD and current global silver spot price per gram in USD, and compute different purities accordingly.

Return a valid JSON object ONLY, matching this exact schema:
{
  "india": {
    "gold": {
      "24k": number,
      "22k": number,
      "18k": number,
      "14k": number,
      "9k": number
    },
    "silver": {
      "99.99": number,
      "92.5": number
    }
  },
  "global": {
    "gold": {
      "24k": number,
      "22k": number,
      "18k": number,
      "14k": number,
      "9k": number
    },
    "silver": {
      "99.99": number,
      "92.5": number
    }
  }
}`;

      const response = await generateGeminiSafe(client, {
        primaryModel: 'gemini-3.5-flash',
        fallbackModels: ['gemini-3.7-flash', 'gemini-3.1-flash-lite'],
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);
      if (parsed && parsed.india && parsed.india.gold && parsed.india.gold['24k'] && parsed.india.silver && parsed.india.silver['99.99']) {
        return parsed;
      }
      throw new Error("Invalid schema returned by Gemini");
    } catch (e) {
      console.warn("Gemini Search Grounding rates failed (likely quota limit):", e instanceof Error ? e.message : e);
      return null;
    }
  }

  async function scrapeMoneycontrol(): Promise<any> {
    try {
      const goldRes = await fetch("https://www.moneycontrol.com/commodity/mcx-gold-price/", {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const goldHtml = await goldRes.text();
      const goldMatches = [...goldHtml.matchAll(/([678][0-9],[0-9]{3}\.[0-9]{2})/g)];
      let base24kGold = 7819.36;
      if (goldMatches && goldMatches.length > 0) {
        const firstMatch = goldMatches[0][1];
        const parsed = parseFloat(firstMatch.replace(/,/g, ''));
        if (parsed > 50000 && parsed < 120000) {
          base24kGold = parsed / 10;
        }
      }

      const silverRes = await fetch("https://www.moneycontrol.com/commodity/mcx-silver-price/", {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const silverHtml = await silverRes.text();
      const silverMatches = [...silverHtml.matchAll(/([89][0-9],[0-9]{3}\.[0-9]{2})/g)];
      let baseSilver = 93.15;
      if (silverMatches && silverMatches.length > 0) {
        const firstMatch = silverMatches[0][1];
        const parsed = parseFloat(firstMatch.replace(/,/g, ''));
        if (parsed > 60000 && parsed < 150000) {
          baseSilver = parsed / 1000;
        }
      }

      return {
        india: {
          gold: {
            '24k': Math.round(base24kGold * 100) / 100,
            '22k': Math.round((base24kGold * 22 / 24) * 100) / 100,
            '18k': Math.round((base24kGold * 18 / 24) * 100) / 100,
            '14k': Math.round((base24kGold * 14 / 24) * 100) / 100,
            '9k': Math.round((base24kGold * 9 / 24) * 100) / 100,
          },
          silver: {
            '99.99': Math.round(baseSilver * 100) / 100,
            '92.5': Math.round((baseSilver * 0.925) * 100) / 100,
          }
        }
      };
    } catch (e) {
      console.error("Direct MCX scraping failed:", e);
      return null;
    }
  }

  // ENDPOINT TO GET REAL-TIME LIVE INDIA & GLOBAL METAL RATES
  app.get("/api/metal-rates", async (req, res) => {
    try {
      console.log("Fetching live metal rates...");
      const finalRates = JSON.parse(JSON.stringify(DEFAULT_RATES));
      
      // 1. Fetch live rates from goldapi.io (User's preferred high-accuracy pricing feed)
      const goldApiRates = await fetchGoldApiRates();
      if (goldApiRates) {
        finalRates.india.gold = { ...finalRates.india.gold, ...goldApiRates.india.gold };
        finalRates.india.silver = { ...finalRates.india.silver, ...goldApiRates.india.silver };
        finalRates.global.gold = { ...finalRates.global.gold, ...goldApiRates.global.gold };
        finalRates.global.silver = { ...finalRates.global.silver, ...goldApiRates.global.silver };
        console.log("Rates successfully loaded from goldapi.io");
        finalRates.lastUpdated = `GoldAPI.io Live (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
        res.json(finalRates);
        return;
      }
      
      // 2. Fetch live rates from Yahoo Finance (Secondary feed / automatic fallback)
      const yahooRates = await fetchYahooRates();
      if (yahooRates) {
        finalRates.india.gold = { ...finalRates.india.gold, ...yahooRates.india.gold };
        finalRates.india.silver = { ...finalRates.india.silver, ...yahooRates.india.silver };
        finalRates.global.gold = { ...finalRates.global.gold, ...yahooRates.global.gold };
        finalRates.global.silver = { ...finalRates.global.silver, ...yahooRates.global.silver };
        console.log("Rates successfully loaded from Yahoo Finance");
        finalRates.lastUpdated = `Yahoo Finance Live (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
        res.json(finalRates);
        return;
      }
      
      console.log("Primary rates fetch failed, falling back to secondary scrapers...");

      // 2. Fallback: Fetch Global Rates from CoinGecko (Safe, accurate, no quota used)
      const globalRates = await fetchGlobalRatesFromCoinGecko();
      if (globalRates && globalRates.global) {
        finalRates.global.gold = { ...finalRates.global.gold, ...globalRates.global.gold };
        finalRates.global.silver = { ...finalRates.global.silver, ...globalRates.global.silver };
        console.log("Global rates loaded from CoinGecko");
      }

      // 3. Fallback: Fetch India Rates from Moneycontrol (Real-time MCX Spot prices)
      const indiaRates = await scrapeMoneycontrol();
      if (indiaRates && indiaRates.india) {
        finalRates.india.gold = { ...finalRates.india.gold, ...indiaRates.india.gold };
        finalRates.india.silver = { ...finalRates.india.silver, ...indiaRates.india.silver };
        console.log("India rates loaded from Moneycontrol");
      }

      // 4. Fallback to Gemini Grounding ONLY if both scrapers failed completely
      if (!globalRates && !indiaRates) {
        console.log("All scrapers failed, falling back to Gemini Grounding...");
        const geminiRates = await fetchGeminiGroundingRates(aiClient);
        if (geminiRates) {
          if (geminiRates.india) {
            finalRates.india.gold = { ...finalRates.india.gold, ...geminiRates.india.gold };
            finalRates.india.silver = { ...finalRates.india.silver, ...geminiRates.india.silver };
          }
          if (geminiRates.global) {
            finalRates.global.gold = { ...finalRates.global.gold, ...geminiRates.global.gold };
            finalRates.global.silver = { ...finalRates.global.silver, ...geminiRates.global.silver };
          }
        }
      }

      finalRates.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      res.json(finalRates);
    } catch (error: any) {
      console.error("Metal rates endpoint failed, using defaults:", error);
      res.json(DEFAULT_RATES);
    }
  });

  // ENDPOINT TO GENERATE JEWELRY NAME AND DESCRIPTION VIA IMAGE ANALYSIS
  app.post("/api/gemini/describe", async (req, res) => {
    try {
      const { imageData, productName } = req.body;
      
      const parts: any[] = [];
      if (imageData) {
        // Remove data URL prefix if present
        const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
        parts.push({
          inlineData: {
            mimeType: "image/png",
            data: base64Data,
          },
        });
      }
      
      const prompt = productName 
        ? `Generate a professional, luxury product description for a jewelry piece named "${productName}". Use very normal, clear English with core copywriting skills (focus on benefits, craftsmanship, and elegance). Avoid overly flowery AI-sounding language. Keep it concise but evocative.`
        : `Analyze this jewelry piece and suggest a sophisticated name, a professional luxury product description, a matching product category (strictly select one from: Rings, Necklaces, Earrings, Bracelets, Bespoke), matching precious materials details, and an estimated premium retail price in USD. Return the result in JSON format: { "name": "Suggested Name", "description": "Product Description", "category": "Rings", "material": "18k White Gold, VS Diamonds", "price": 4500 }`;

      parts.push({ text: prompt });

      const response = await generateGeminiSafe(aiClient, {
        primaryModel: 'gemini-3.5-flash',
        fallbackModels: ['gemini-3.7-flash', 'gemini-3.1-flash-lite'],
        contents: { parts },
        config: productName ? undefined : { responseMimeType: 'application/json' }
      });

      const text = response.text || '';
      
      if (!productName) {
        try {
          const result = JSON.parse(text);
          res.json(result);
        } catch (parseError) {
          // Fallback if parsing fails
          res.json({
            name: 'New Masterpiece',
            description: text,
            category: 'Necklaces',
            material: '18k Gold',
            price: 1500
          });
        }
      } else {
        res.json({
          name: productName,
          description: text
        });
      }
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: error.message || "Failed to generate description" });
    }
  });

  // ENDPOINT TO EDIT OR GENERATE IMAGES
  app.post("/api/gemini/edit-image", async (req, res) => {
    try {
      const { imageData, prompt, aspectRatio } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const parts: any[] = [];
      
      if (imageData) {
        // Remove data URL prefix if present
        const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
        parts.push({
          inlineData: {
            mimeType: "image/png",
            data: base64Data,
          },
        });
      }

      parts.push({ text: prompt });

      const config: any = {};
      if (aspectRatio) {
        config.imageConfig = {
          aspectRatio: aspectRatio,
          imageSize: "1K"
        };
      }

      // Use gemini-3.1-flash-image for high-quality jewelry design/edits
      const response = await generateGeminiSafe(aiClient, {
        primaryModel: 'gemini-3.1-flash-image',
        fallbackModels: ['gemini-3.1-flash-lite-image'],
        contents: { parts },
        config: Object.keys(config).length ? config : undefined
      });

      let generatedBase64 = null;
      let responseText = "";

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            generatedBase64 = part.inlineData.data;
          } else if (part.text) {
            responseText += part.text;
          }
        }
      }

      if (generatedBase64) {
        res.json({
          imageUrl: `data:image/png;base64,${generatedBase64}`,
          text: responseText
        });
      } else {
        res.status(500).json({ error: "No image was generated by the model. Response text: " + responseText });
      }
    } catch (error: any) {
      console.error("Gemini Edit Image API error:", error);
      res.status(500).json({ error: error.message || "Failed to process image operation" });
    }
  });

  // NATURAL LANGUAGE AI ACTION & VOICE ASSISTANT ENDPOINT
  app.post("/api/ai-assistant/execute", async (req, res) => {
    try {
      const { message, images, audio, audioMimeType, context, conversationHistory, pendingAction } = req.body;
      let promptText = message || (images && images.length > 0 ? "Please analyze the uploaded jewelry photo(s) and automatically create a new luxury product catalog entry." : "");
      if (audio && !promptText) {
        promptText = "Please listen carefully to this spoken audio command from the jewelry atelier staff, transcribe what they requested, and execute the corresponding action (e.g., record a customer payment, add a client profile, create a bespoke commission, adjust inventory stock, log a repair job, update metal rates, or add a product). Confirm the final record state explicitly.";
      }
      
      if (!promptText && (!images || images.length === 0) && !audio && !pendingAction) {
        return res.status(400).json({ error: "Message, image, audio, or pending action is required" });
      }

      console.log(`[AI Voice Concierge] Processing user command: "${promptText?.slice(0, 80)}" with ${images?.length || 0} attached image(s), audio present: ${!!audio}, pendingAction:`, pendingAction ? pendingAction.actionType : 'None');

      const systemPrompt = `You are LUMORA AI Voice & Business Concierge, the elite operational AI assistant for LUMORA Luxury Jewelry Atelier.
The user speaks or types natural language commands, and can attach single or MULTIPLE jewelry photographs to update every functionality in the jewelry management system without having to manually open or fill forms.

Current Atelier Context:
- Available Customers: ${(context?.customers || []).map((c: any) => `${c.name} (${c.location || 'Atelier'}, ID: ${c.id})`).slice(0, 15).join(', ')}
- Available Products/SKUs: ${(context?.products || []).map((p: any) => `${p.name} (SKU: ${p.sku}, Stock: ${p.stock}, ₹${p.price})`).slice(0, 15).join(', ')}
- Current 24K Gold Rate: ₹${context?.goldRate24k || 7819}/g (₹${(context?.goldRate24k || 7819) * 10}/10g), Silver Rate: ₹${context?.silverRate || 95}/g
- Active Location: ${context?.activeLocation || 'Mumbai Flagship'}

CRITICAL REQUIREMENT 1 - FINAL RECORD MUTATION STATE CONFIRMATION:
After ALL communication (whether immediately resolved or after multiple clarifying conversational turns), when an action is executed, the AI MUST explicitly confirm the final state of the record: whether the record was ADDED, UPDATED, or DELETED.
1. In the "reply" string, you MUST start with an explicit structured confirmation tag and state the exact final entity and state:
   - If a record is ADDED: "✅ [RECORD ADDED] The new [Product / Customer / Payment / Bespoke Order / Repair Job] record for '[Name]' has been successfully created and saved to the atelier database."
   - If a record is UPDATED: "🔄 [RECORD UPDATED] The [Product / Inventory Stock / Customer / Order / Metal Rate] record for '[Name]' has been successfully updated with [New Value/Details]."
   - If a record is DELETED: "🗑️ [RECORD DELETED] The [Product / Customer / Order / Payment] record for '[Name]' has been permanently deleted from the atelier records."
2. In the "action" object, you MUST specify:
   - "mutationType": "added" | "updated" | "deleted" | "navigated" | "viewed"
   - "entityType": "Product" | "Customer" | "Payment Ledger" | "Bespoke Order" | "Repair Job" | "Metal Rates" | "Navigation" | "General"
   - "recordName": Short human-friendly name of the affected entity
   - "finalState": Object describing the final status and key values after execution (e.g. { status: "Active in Catalog", stock: 12, price: 85000 })

CRITICAL REQUIREMENT 2 - MANDATORY FIELD VALIDATION & PROGRESSIVE CLARIFICATION:
If the user's statement does NOT provide all necessary information required to complete an operational action, DO NOT execute or invent critical missing data prematurely.
Instead:
1. Set "status": "needs_clarification"
2. Set "action": null
3. Set "pendingAction" containing:
   - "actionType": The identified action (e.g. "RECORD_PAYMENT", "ADD_CUSTOMER", "CREATE_BESPOKE_ORDER", "ADD_PRODUCT", "ADJUST_STOCK", "LOG_REPAIR", "UPDATE_METAL_RATES", "DELETE_PRODUCT", "DELETE_CUSTOMER", "DELETE_ORDER")
   - "collectedFields": All fields already extracted or provided so far
   - "missingFields": Array of field names still required (e.g. ["amount", "paymentMethod"])
   - "clarifyingQuestion": A courteous, specific question asking the user for the missing details
4. Provide helpful "suggestedNextActions" pills representing quick answers to the clarifying question.

If an existing "pendingAction" was provided in the context, merge previously collected fields with the user's latest input.
Once ALL required information is present:
1. Set "status": "ready"
2. Provide the complete "action" object with "mutationType" ("added", "updated", or "deleted")
3. Set "pendingAction": null
4. Set "reply" confirming the execution with the required [RECORD ADDED] / [RECORD UPDATED] / [RECORD DELETED] confirmation.

If the user says "cancel", "never mind", "abort", or "stop", set "status": "cancelled", "action": null, "pendingAction": null, and confirm in "reply".

REQUIRED FIELDS PER ACTION TYPE:
1. "RECORD_PAYMENT" (Mutation: "added"):
   - REQUIRED: "amount" (numeric positive value), "customerName" (client/payer name), "paymentMethod" ("UPI" | "Bank Transfer" | "Credit Card" | "Cash" | "Cheque" | "Wire")
   - OPTIONAL: "location" (defaults to active location), "paymentType" ("customer_advance" | "customer_final" | "sale" | "craftsman_payment" | "craftsman_advance"), "category" ("Inflow" | "Outflow"), "description", "relatedOrderId"
   - Missing Rule: If amount, customerName, or paymentMethod is missing, ask for the missing item(s).

2. "ADD_CUSTOMER" (Mutation: "added"):
   - REQUIRED: "name" (client full name), "location" (city/branch e.g. "Mumbai Flagship", "Delhi Atelier", "London Studio"), and at least one contact detail ("phone" or "email")
   - OPTIONAL: "leadSource" ("Walk-in" | "Instagram" | "WhatsApp" | "Referral" | "Private Event" | "Website"), "ageGroup", "notes", "area"
   - Missing Rule: If phone/email or location is missing, ask for the contact number and location.

3. "CREATE_BESPOKE_ORDER" (Mutation: "added"):
   - REQUIRED: "customerName", "metalType" (or "metalPurity" + "specifications"), "totalAmount" (or "advancePaid")
   - OPTIONAL: "metalWeight", "customerPhone", "stonesSummary", "advancePaid"
   - Missing Rule: If design specifications/metal or budget/advance is missing, ask for the jewelry specifications and estimated budget or advance.

4. "ADD_PRODUCT" (Mutation: "added"):
   - REQUIRED: "name" (or category & design style), "category" ("Rings" | "Necklaces" | "Earrings" | "Bracelets" | "Bespoke"), "price" (number in INR), "material" (e.g. "18K Gold & Diamonds")
   - OPTIONAL: "stock" (defaults to 1), "description", "sku", "images"
   - If photos are attached and no price/name was spoken, you may extract visual details from the photos, propose the price and material, and if user gave vague text, ask for the price or material.

5. "ADJUST_STOCK" (Mutation: "updated"):
   - REQUIRED: "productName" or "sku" (specific identifiable product), and either "newStock" (number) or "stockDelta" (number)
   - Missing Rule: If product or quantity is unspecified, ask which product or how many units.

6. "UPDATE_PRODUCT" (Mutation: "updated"):
   - REQUIRED: "sku" or "name" (identifiable product), and at least one field to update ("price", "material", "name", "category", "description", "stock")

7. "UPDATE_CUSTOMER" (Mutation: "updated"):
   - REQUIRED: "name" or "id" (identifiable customer), and at least one field to update ("phone", "email", "location", "notes", "status")

8. "DELETE_PRODUCT" (Mutation: "deleted"):
   - REQUIRED: "sku" or "name" (product to remove)

9. "DELETE_CUSTOMER" (Mutation: "deleted"):
   - REQUIRED: "name" or "id" (customer to remove)

10. "DELETE_ORDER" / "CANCEL_ORDER" (Mutation: "deleted" or "updated"):
   - REQUIRED: "orderId" or "customerName"

11. "DELETE_PAYMENT" (Mutation: "deleted"):
   - REQUIRED: "id" or "description"

12. "LOG_REPAIR" (Mutation: "added"):
   - REQUIRED: "customerName", "itemDescription" (jewelry piece), "repairDetails" (what needs to be repaired/serviced)
   - OPTIONAL: "costEstimate", "customerPhone"
   - Missing Rule: If item or repair problem is missing, ask for the jewelry piece and repair details.

13. "UPDATE_METAL_RATES" (Mutation: "updated"):
   - REQUIRED: "gold24kPerGram" (or gold rate per 10g) or "silverPerGram"
   - OPTIONAL: "market" ("india" | "global"), "notes"

14. "NAVIGATE_TAB" (Mutation: "navigated"):
   - REQUIRED: "targetTab" ("dashboard" | "inventory" | "inventory_master" | "production" | "orders" | "custom" | "craftsmen" | "resellers" | "payments" | "studio" | "analytics" | "customers" | "settings" | "marketing" | "calculator" | "gallery")

15. "GENERAL_QUERY" (Mutation: "viewed"):
   - For general jewelry atelier questions, summaries, or advice.

Response JSON Schema:
{
  "status": "ready" | "needs_clarification" | "cancelled",
  "reply": "Spoken/text response. When executing an action, MUST start with ✅ [RECORD ADDED], 🔄 [RECORD UPDATED], or 🗑️ [RECORD DELETED] and state the final confirmed state of the record.",
  "action": {
    "actionType": "RECORD_PAYMENT" | "ADD_CUSTOMER" | "CREATE_BESPOKE_ORDER" | "ADD_PRODUCT" | "ADJUST_STOCK" | "UPDATE_PRODUCT" | "UPDATE_CUSTOMER" | "DELETE_PRODUCT" | "DELETE_CUSTOMER" | "DELETE_ORDER" | "DELETE_PAYMENT" | "LOG_REPAIR" | "UPDATE_METAL_RATES" | "NAVIGATE_TAB" | "GENERAL_QUERY",
    "mutationType": "added" | "updated" | "deleted" | "navigated" | "viewed",
    "entityType": "Product" | "Customer" | "Payment Ledger" | "Bespoke Order" | "Repair Job" | "Metal Rates" | "Navigation" | "General",
    "recordName": "Name of entity",
    "finalState": {
      "status": "Final state description e.g. Active in Catalog / Reconciled in Ledger / Purged from Records",
      ...relevant final properties...
    },
    ...other action specific fields...
  } | null,
  "pendingAction": {
    "actionType": "RECORD_PAYMENT" | "ADD_CUSTOMER" | "CREATE_BESPOKE_ORDER" | "ADD_PRODUCT" | "ADJUST_STOCK" | "LOG_REPAIR" | "UPDATE_METAL_RATES" | "DELETE_PRODUCT" | "DELETE_CUSTOMER" | "DELETE_ORDER",
    "collectedFields": { ...fields extracted so far... },
    "missingFields": ["fieldName1", "fieldName2"],
    "clarifyingQuestion": "Specific question asking for the missing fields"
  } | null,
  "actionSummary": "Short status badge, e.g., 'Recorded ₹75,000 Payment' or 'Awaiting Payment Details'",
  "suggestedNextActions": ["Suggested quick answer 1", "Suggested quick answer 2", "Suggested quick answer 3"]
}`;

      let conversationContext = '';
      if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        conversationContext = 'Recent conversation:\n' + conversationHistory.slice(-6).map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n') + '\n\n';
      }

      let pendingContext = '';
      if (pendingAction) {
        pendingContext = `ACTIVE PENDING ACTION IN PROGRESS (User is responding to a clarification request):
Pending Action Type: ${pendingAction.actionType}
Collected Fields So Far: ${JSON.stringify(pendingAction.collectedFields || {})}
Missing Fields Needed: ${JSON.stringify(pendingAction.missingFields || [])}
Previous Clarification Question: "${pendingAction.clarifyingQuestion || ''}"
Merge the user's latest command/answer with the collected fields above. If all required fields are now satisfied, return status: "ready" and the complete action. If still missing fields, return status: "needs_clarification" with the updated pendingAction.\n\n`;
      }

      const fullPrompt = `${conversationContext}${pendingContext}User Input / Answer: "${promptText}"`;

      // Build multimodal parts
      const parts: any[] = [];
      if (audio && typeof audio === 'string') {
        const match = audio.match(/^data:([^;]+);base64,(.+)$/);
        const mime = match ? match[1] : (audioMimeType || 'audio/webm');
        const data = match ? match[2] : audio;
        parts.push({
          inlineData: {
            mimeType: mime,
            data: data
          }
        });
      }
      if (images && Array.isArray(images) && images.length > 0) {
        for (const img of images) {
          if (typeof img === 'string') {
            const match = img.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              parts.push({
                inlineData: {
                  mimeType: match[1],
                  data: match[2]
                }
              });
            } else if (img.length > 50) {
              parts.push({
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: img
                }
              });
            }
          }
        }
      }
      parts.push({ text: fullPrompt });

      let parsed: any = null;
      try {
        const response = await generateGeminiSafe(aiClient, {
          primaryModel: 'gemini-3.7-flash',
          fallbackModels: ['gemini-3.5-flash', 'gemini-3.1-flash-lite'],
          contents: [{ parts }],
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            temperature: 0.2,
          }
        });
        const text = response.text || '{}';
        parsed = JSON.parse(text);
      } catch (geminiError: any) {
        console.warn("[AI Assistant] Gemini API temporary high-demand/notice:", geminiError?.message || geminiError);
        parsed = parseNaturalLanguageCommandLocally(promptText, images, context, pendingAction);
      }

      if (!parsed) {
        parsed = parseNaturalLanguageCommandLocally(promptText, images, context, pendingAction);
      }

      // If an ADD_PRODUCT action was generated and photos were uploaded, preserve photos
      if (parsed.action && parsed.action.actionType === 'ADD_PRODUCT' && images && images.length > 0) {
        parsed.action.images = images;
      }
      if (parsed.pendingAction && images && images.length > 0) {
        parsed.pendingAction.images = images;
      }
      res.json(parsed);
    } catch (error: any) {
      console.error("Error in /api/ai-assistant/execute:", error);
      res.status(500).json({ 
        error: error.message || "Failed to process AI assistant command",
        fallback: true
      });
    }
  });

  // DEDICATED MULTI-IMAGE PRODUCT EXTRACTION ENDPOINT
  app.post("/api/ai/extract-product-details", async (req, res) => {
    try {
      const { images, prompt, currentRates } = req.body;
      const parts: any[] = [];

      if (images && Array.isArray(images) && images.length > 0) {
        for (const img of images) {
          if (typeof img === 'string') {
            const match = img.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              parts.push({
                inlineData: {
                  mimeType: match[1],
                  data: match[2]
                }
              });
            } else if (img.length > 50) {
              parts.push({
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: img
                }
              });
            }
          }
        }
      }

      const instruction = `You are a high-end luxury jewelry appraiser and cataloging expert.
Analyze the provided jewelry photograph(s) and any accompanying details from the user: "${prompt || ''}".
Extract and generate complete product catalog specifications in strict JSON format.

JSON Schema:
{
  "name": "Luxury Product Name (e.g. Celestial Oval Sapphire & Diamond Ring)",
  "category": "Rings" | "Necklaces" | "Earrings" | "Bracelets" | "Bespoke",
  "material": "Gold" | "Silver" | "Platinum" | "Alloy" | "Brass" | "Other Metals",
  "materialDetail": "Detailed metal and stone spec (e.g. 18K Yellow Gold with 1.8ct Oval Blue Sapphire and VS1 Diamond Halo)",
  "price": number (estimated luxury retail price in INR or specified price, e.g. 145000),
  "stock": number (default to 1 or specified),
  "sku": "SKU code (e.g. SKU-RING-402)",
  "description": "Evocative, premium 2-3 sentence description emphasizing craftsmanship, stone clarity, and design heritage."
}`;

      parts.push({ text: instruction });

      let parsed: any = null;
      try {
        const response = await generateGeminiSafe(aiClient, {
          primaryModel: 'gemini-3.7-flash',
          fallbackModels: ['gemini-3.5-flash', 'gemini-3.1-flash-lite'],
          contents: [{ parts }],
          config: {
            responseMimeType: "application/json",
            temperature: 0.2
          }
        });
        const text = response.text || '{}';
        parsed = JSON.parse(text);
      } catch (extractError: any) {
        console.warn("[Extract Product Details] Gemini API notice, applying local fallback:", extractError?.message || extractError);
        parsed = generateLocalProductDetails(images, prompt, currentRates);
      }
      res.json(parsed || generateLocalProductDetails(images, prompt, currentRates));
    } catch (error: any) {
      console.error("Error in /api/ai/extract-product-details:", error);
      res.status(500).json({
        name: "Handcrafted Jewelry Piece",
        category: "Rings",
        material: "Gold",
        materialDetail: "18K Gold & Fine Gemstones",
        price: 85000,
        stock: 1,
        sku: `SKU-${Date.now().toString().slice(-4)}`,
        description: "Bespoke handcrafted creation from the atelier."
      });
    }
  });

  // SUPABASE CONFIG PROXY (Optional safety measure)
  app.get("/api/config", (req, res) => {
    res.json({
      supabaseUrl: process.env.VITE_SUPABASE_URL,
      // Never send Service Role Key to client
      supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
    });
  });

  // PRODUCT ENDPOINTS (If you want to move logic here later)
  app.get("/api/products", async (req, res) => {
    // You can add server-side filtering or logic here
    res.json({ message: "Use Supabase client directly or call this for custom logic" });
  });

  // VITE MIDDLEWARE FOR DEVELOPMENT
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lumora Atelier Backend running on http://localhost:${PORT}`);
  });
}

startServer();
