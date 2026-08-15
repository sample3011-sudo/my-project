import { z } from 'zod';

// ── Payment Status ──────────────────────────────────────────────────────────

export const PaymentStatusSchema = z.enum(['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED']);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

// ── Plan definitions ────────────────────────────────────────────────────────

export const PLANS = {
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    description: 'Unlimited imports, AI categorization, advanced analytics',
    amount: 199,
    currency: 'INR',
  },
  pro_annual: {
    id: 'pro_annual',
    name: 'Pro Annual',
    description: 'Everything in Pro Monthly — save 2 months',
    amount: 1990,
    currency: 'INR',
  },
} as const;

export type PlanId = keyof typeof PLANS;

export const PlanIdSchema = z.enum(['pro_monthly', 'pro_annual']);

// ── Create Order ────────────────────────────────────────────────────────────

export const CreateOrderRequestSchema = z.object({
  planId: PlanIdSchema,
});

export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;

export const CreateOrderResponseSchema = z.object({
  orderId: z.string(),
  paymentSessionId: z.string(),
  amount: z.number(),
  currency: z.string(),
  planId: z.string(),
});

export type CreateOrderResponse = z.infer<typeof CreateOrderResponseSchema>;

// ── Payment Record ──────────────────────────────────────────────────────────

export const PaymentRecordSchema = z.object({
  id: z.string(),
  cashfreeOrderId: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: PaymentStatusSchema,
  plan: z.string(),
  createdAt: z.string(),
});

export type PaymentRecord = z.infer<typeof PaymentRecordSchema>;

// ── Verify Payment ──────────────────────────────────────────────────────────

export const VerifyPaymentQuerySchema = z.object({
  order_id: z.string().min(1, 'order_id is required'),
});

export type VerifyPaymentQuery = z.infer<typeof VerifyPaymentQuerySchema>;

export const PaymentStatusResponseSchema = z.object({
  orderId: z.string(),
  status: PaymentStatusSchema,
  amount: z.number(),
  currency: z.string(),
  plan: z.string(),
  updatedAt: z.string(),
});

export type PaymentStatusResponse = z.infer<typeof PaymentStatusResponseSchema>;
