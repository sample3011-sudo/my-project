import { Router } from 'express';
import authRouter from './auth.routes';
import uploadRouter from './upload.routes';
import mappingRouter from './mapping.routes';
import importRouter from './import.routes';
import categoryRouter from './category.routes';
import dashboardRouter from './dashboard.routes';
import transactionRouter from './transaction.routes';
import paymentRouter from './payment.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/uploads', uploadRouter);
apiRouter.use('/mappings', mappingRouter);
apiRouter.use('/imports', importRouter);
apiRouter.use('/category-rules', categoryRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/transactions', transactionRouter);
apiRouter.use('/payments', paymentRouter);

export default apiRouter;
