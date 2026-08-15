import { useState, useCallback, useEffect } from 'react';
import * as paymentService from '../services/payment.service';
import type { PaymentStatusResponse } from '@repo/shared';

// ── Cashfree JS SDK Type declarations ────────────────────────────────────────

declare global {
  interface Window {
    Cashfree?: {
      (config: { mode: 'sandbox' | 'production' }): {
        checkout: (options: {
          paymentSessionId: string;
          returnUrl: string;
        }) => Promise<{ error?: { message?: string } }>;
      };
    };
  }
}

// ── usePayment: drives the pricing page checkout flow ────────────────────────

export type PaymentState = 'idle' | 'creating' | 'redirecting' | 'error';

interface UsePaymentReturn {
  paymentState: PaymentState;
  error: string | null;
  initiatePayment: (planId: string) => Promise<void>;
}

/**
 * Loads the Cashfree JS SDK from CDN (once) and exposes an initiatePayment handler
 * that creates an order and opens the hosted checkout.
 */
export const usePayment = (): UsePaymentReturn => {
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [error, setError] = useState<string | null>(null);

  // Dynamically load the Cashfree JS SDK once on mount
  useEffect(() => {
    if (document.getElementById('cashfree-sdk')) return;
    const script = document.createElement('script');
    script.id = 'cashfree-sdk';
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const initiatePayment = useCallback(async (planId: string): Promise<void> => {
    setPaymentState('creating');
    setError(null);

    try {
      const order = await paymentService.createOrder(planId);

      setPaymentState('redirecting');

      // Wait for the SDK to be available (it loads async)
      let attempts = 0;
      while (!window.Cashfree && attempts < 20) {
        await new Promise((r) => setTimeout(r, 300));
        attempts++;
      }

      if (!window.Cashfree) {
        throw new Error('Cashfree SDK failed to load. Please refresh and try again.');
      }

      const cfEnv = (import.meta.env.VITE_CASHFREE_ENV ?? 'sandbox') as 'sandbox' | 'production';
      const cashfree = window.Cashfree({ mode: cfEnv });

      const returnUrl = `${window.location.origin}/payment/result?order_id=${order.orderId}`;

      const result = await cashfree.checkout({
        paymentSessionId: order.paymentSessionId,
        returnUrl,
      });

      if (result?.error) {
        throw new Error(result.error.message ?? 'Checkout was cancelled or failed.');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error
          ?.message ??
        (err instanceof Error ? err.message : 'Payment failed. Please try again.');
      setError(msg);
      setPaymentState('error');
    }
  }, []);

  return { paymentState, error, initiatePayment };
};

// ── usePaymentResult: verifies payment on the result page ───────────────────

interface UsePaymentResultReturn {
  status: PaymentStatusResponse | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Verifies the payment status for a given orderId.
 * Called once on mount from PaymentResultPage.
 */
export const usePaymentResult = (orderId: string | null): UsePaymentResultReturn => {
  const [status, setStatus] = useState<PaymentStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('No order ID found in URL.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const verify = async (): Promise<void> => {
      try {
        const result = await paymentService.verifyPayment(orderId);
        if (!cancelled) {
          setStatus(result);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg =
            (err as { response?: { data?: { error?: { message?: string } } } }).response?.data
              ?.error?.message ?? 'Failed to verify payment. Please contact support.';
          setError(msg);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void verify();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return { status, isLoading, error };
};
