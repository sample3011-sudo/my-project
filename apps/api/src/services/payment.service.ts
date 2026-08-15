import { CreateOrderRequest as CfCreateOrderRequest } from 'cashfree-pg';
import { cashfree } from '../config/cashfree.config';
import { prisma } from '../config/prisma.config';
import { NotFoundError, PaymentError } from '../errors';
import {
  PLANS,
  type PlanId,
  type CreateOrderResponse,
  type PaymentStatusResponse,
  type PaymentRecord,
} from '@repo/shared';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Maps a Cashfree order_status string to our internal PaymentStatus enum.
 * Cashfree statuses: ACTIVE, PAID, EXPIRED, CANCELLED, TERMINATION_REQUESTED.
 */
const mapCashfreeStatus = (
  cfStatus: string | undefined
): 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' => {
  switch (cfStatus?.toUpperCase()) {
    case 'PAID':
      return 'SUCCESS';
    case 'ACTIVE':
      return 'PENDING';
    case 'EXPIRED':
    case 'CANCELLED':
    case 'TERMINATION_REQUESTED':
      return 'FAILED';
    default:
      return 'PENDING';
  }
};

// ── Service Functions ─────────────────────────────────────────────────────────

/**
 * Creates a Cashfree order for the given plan and persists a Payment row.
 * Returns the order details the frontend needs to open the checkout.
 */
export const createOrder = async (
  userId: string,
  userEmail: string,
  planId: PlanId
): Promise<CreateOrderResponse> => {
  const plan = PLANS[planId];

  // Build a unique order ID: cf_<userId_prefix>_<timestamp>
  const cashfreeOrderId = `cf_${userId.slice(0, 8)}_${Date.now()}`;

  const orderRequest: CfCreateOrderRequest = {
    order_id: cashfreeOrderId,
    order_amount: plan.amount,
    order_currency: plan.currency,
    customer_details: {
      customer_id: userId,
      customer_email: userEmail,
      // Phone is required by Cashfree; placeholder until the profile stores a phone number
      customer_phone: '9999999999',
    },
    order_meta: {
      return_url: `${process.env['VITE_RETURN_URL'] ?? 'http://localhost:5173'}/payment/result?order_id={order_id}`,
    },
  };

  let cfOrderId: string;
  let cfPaymentSessionId: string;
  let cfOrderAmount: number;
  let cfOrderCurrency: string;

  try {
    const res = await cashfree.PGCreateOrder(orderRequest);
    const data = res.data;

    cfOrderId = data.order_id ?? cashfreeOrderId;
    cfPaymentSessionId = data.payment_session_id ?? '';
    cfOrderAmount = data.order_amount ?? plan.amount;
    cfOrderCurrency = data.order_currency ?? plan.currency;
  } catch (err: unknown) {
    const cfErr = err as { response?: { data?: { message?: string } } };
    throw new PaymentError(
      cfErr.response?.data?.message ?? 'Failed to create payment order with Cashfree',
      'PAYMENT_CREATE_ORDER_FAILED',
      cfErr.response?.data
    );
  }

  // Persist the order in our DB with PENDING status
  await prisma.payment.create({
    data: {
      userId,
      cashfreeOrderId: cfOrderId,
      paymentSessionId: cfPaymentSessionId,
      amount: cfOrderAmount,
      currency: cfOrderCurrency,
      status: 'PENDING',
      plan: planId,
    },
  });

  return {
    orderId: cfOrderId,
    paymentSessionId: cfPaymentSessionId,
    amount: cfOrderAmount,
    currency: cfOrderCurrency,
    planId,
  };
};

/**
 * Fetches the latest status for an order from Cashfree and updates our DB.
 * Called from the payment result page.
 */
export const verifyAndRecordPayment = async (
  userId: string,
  cashfreeOrderId: string
): Promise<PaymentStatusResponse> => {
  const payment = await prisma.payment.findFirst({
    where: { cashfreeOrderId, userId },
  });

  if (!payment) {
    throw new NotFoundError(
      `Payment order not found: ${cashfreeOrderId}`,
      'PAYMENT_NOT_FOUND'
    );
  }

  let cfStatus: string | undefined;
  try {
    const res = await cashfree.PGFetchOrder(cashfreeOrderId);
    cfStatus = res.data.order_status;
  } catch (err: unknown) {
    const cfErr = err as { response?: { data?: { message?: string } } };
    throw new PaymentError(
      cfErr.response?.data?.message ?? 'Failed to fetch order status from Cashfree',
      'PAYMENT_FETCH_FAILED',
      cfErr.response?.data
    );
  }

  const newStatus = mapCashfreeStatus(cfStatus);

  // Only write to DB if the status actually changed
  const updated =
    payment.status !== newStatus
      ? await prisma.payment.update({
          where: { id: payment.id },
          data: { status: newStatus },
        })
      : payment;

  return {
    orderId: updated.cashfreeOrderId,
    status: updated.status as 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED',
    amount: Number(updated.amount),
    currency: updated.currency,
    plan: updated.plan,
    updatedAt: updated.updatedAt.toISOString(),
  };
};

/**
 * Handles incoming Cashfree webhook: verifies the signature, parses the payload,
 * and updates the matching Payment row in our DB.
 *
 * IMPORTANT: rawBody must be the raw request body string BEFORE JSON.parse —
 * signature verification fails on re-serialized JSON.
 */
export const handleWebhook = async (
  signature: string,
  timestamp: string,
  rawBody: string
): Promise<void> => {
  // Verify signature — throws if invalid
  try {
    cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
  } catch {
    throw new PaymentError('Invalid webhook signature', 'PAYMENT_WEBHOOK_INVALID');
  }

  // Parse the body to get order details
  const payload = JSON.parse(rawBody) as {
    data?: {
      order?: { order_id?: string; order_status?: string };
    };
  };

  const orderId = payload.data?.order?.order_id;
  const orderStatus = payload.data?.order?.order_status;

  if (!orderId || !orderStatus) {
    // Not a payment-status event — silently acknowledge
    return;
  }

  const newStatus = mapCashfreeStatus(orderStatus);

  await prisma.payment.updateMany({
    where: { cashfreeOrderId: orderId },
    data: { status: newStatus },
  });
};

/**
 * Returns all payment records for a user, newest first.
 */
export const getUserPayments = async (userId: string): Promise<PaymentRecord[]> => {
  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return payments.map((p) => ({
    id: p.id,
    cashfreeOrderId: p.cashfreeOrderId,
    amount: Number(p.amount),
    currency: p.currency,
    status: p.status as 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED',
    plan: p.plan,
    createdAt: p.createdAt.toISOString(),
  }));
};
