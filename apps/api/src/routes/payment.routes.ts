import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  createOrder,
  getPaymentStatus,
  getPaymentHistory,
  handleWebhook,
} from '../controllers/payment.controller';

const paymentRouter = Router();

// Public — Cashfree posts webhook events here (raw body handled in app.ts)
paymentRouter.post('/webhook', handleWebhook);

// Protected routes
paymentRouter.post('/create-order', protect, createOrder);
paymentRouter.get('/status/:orderId', protect, getPaymentStatus);
paymentRouter.get('/history', protect, getPaymentHistory);

export default paymentRouter;
