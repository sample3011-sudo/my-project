import apiClient from './api.client';
import type { CreateOrderResponse, PaymentStatusResponse, PaymentRecord } from '@repo/shared';

interface ApiSuccess<T> {
  success: true;
  data: T;
}

/**
 * Creates a Cashfree payment order for the given plan.
 * Returns the order ID and paymentSessionId needed to open checkout.
 */
export const createOrder = async (planId: string): Promise<CreateOrderResponse> => {
  const res = await apiClient.post<ApiSuccess<CreateOrderResponse>>('/payments/create-order', {
    planId,
  });
  return res.data.data;
};

/**
 * Verifies/fetches the live status of a Cashfree order from our backend.
 */
export const verifyPayment = async (orderId: string): Promise<PaymentStatusResponse> => {
  const res = await apiClient.get<ApiSuccess<PaymentStatusResponse>>(
    `/payments/status/${encodeURIComponent(orderId)}`
  );
  return res.data.data;
};

/**
 * Returns the full payment history for the authenticated user.
 */
export const getPaymentHistory = async (): Promise<PaymentRecord[]> => {
  const res = await apiClient.get<ApiSuccess<PaymentRecord[]>>('/payments/history');
  return res.data.data;
};
