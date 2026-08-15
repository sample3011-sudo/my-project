import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(cookieParser());

  // Capture raw body for Cashfree webhook signature verification.
  // Must come before express.json() so the body is not yet parsed.
  app.use(
    '/api/payments/webhook',
    express.raw({ type: 'application/json' }),
    (req: express.Request & { rawBody?: Buffer }, _res: express.Response, next: express.NextFunction) => {
      if (Buffer.isBuffer(req.body)) {
        req.rawBody = req.body;
        req.body = JSON.parse(req.body.toString()) as unknown;
      }
      next();
    }
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Mount API router
  app.use('/api', apiRouter);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();
export default app;
