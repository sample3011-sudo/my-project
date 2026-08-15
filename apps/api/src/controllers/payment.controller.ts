import { Request, Response, NextFunction } from 'express';
import * as paymentService from '../services/payment.service';
import { CreateOrderRequestSchema } from '@repo/shared';
import { ValidationError } from '../errors';

// ── POST /api/payments/create-order ─────────────────────────────────────────
// Protected: requires JWT. Creates a Cashfree order and returns session ID.

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = CreateOrderRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid request body', 'VALIDATION_ERROR', parsed.error.flatten());
    }

    const userId = req.user!.userId;
    const userEmail = req.user!.email;
    const { planId } = parsed.data;

    const result = await paymentService.createOrder(userId, userEmail, planId);

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/payments/status/:orderId ────────────────────────────────────────
// Protected: verifies payment status with Cashfree and updates DB.

export const getPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params as { orderId: string };
    const userId = req.user!.userId;

    const result = await paymentService.verifyAndRecordPayment(userId, orderId);

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/payments/history ────────────────────────────────────────────────
// Protected: returns all payment records for the authenticated user.

export const getPaymentHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const payments = await paymentService.getUserPayments(userId);

    res.status(200).json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/payments/webhook ───────────────────────────────────────────────
// PUBLIC (no JWT): Cashfree posts payment events here.
// Uses raw body for signature verification — see app.ts for middleware setup.

export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const signature = req.headers['x-webhook-signature'] as string;
    const timestamp = req.headers['x-webhook-timestamp'] as string;

    if (!signature || !timestamp) {
      res.status(400).json({ success: false, error: 'Missing webhook headers' });
      return;
    }

    // rawBody is attached by the express.raw() middleware in app.ts
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody?.toString() ?? '';

    await paymentService.handleWebhook(signature, timestamp, rawBody);

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
