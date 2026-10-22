export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number; // in lowest denomination (e.g. paise for INR, cents for USD)
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
  handler?: (response: RazorpayResponse) => void;
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay Checkout script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const initializeRazorpayPayment = async (
  options: RazorpayOptions
): Promise<{ success: boolean; response?: RazorpayResponse; error?: string }> => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    return {
      success: false,
      error: 'Unable to load Razorpay Checkout SDK. Please check your network connection.',
    };
  }

  return new Promise((resolve) => {
    try {
      const razorpayInstance = new (window as any).Razorpay({
        ...options,
        handler: (response: RazorpayResponse) => {
          resolve({ success: true, response });
        },
        modal: {
          ondismiss: () => {
            if (options.modal?.ondismiss) {
              options.modal.ondismiss();
            }
            resolve({ success: false, error: 'Payment dismissed by customer.' });
          },
        },
      });

      razorpayInstance.on('payment.failed', function (resp: any) {
        console.error('Razorpay payment failed:', resp.error);
        resolve({
          success: false,
          error: resp.error?.description || 'Payment transaction failed.',
        });
      });

      razorpayInstance.open();
    } catch (err: any) {
      console.error('Razorpay open error:', err);
      resolve({
        success: false,
        error: err.message || 'Failed to initialize Razorpay checkout.',
      });
    }
  });
};
