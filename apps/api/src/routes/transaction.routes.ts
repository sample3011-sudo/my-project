import { Router } from 'express';
import { ledgerController } from '../controllers/ledger.controller';
import { protect } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { TransactionUpdateSchema } from '@repo/shared';

const router = Router();

router.use(protect);

router.get('/', ledgerController.getTransactions);
router.get('/:id', ledgerController.getTransaction);
router.patch('/:id', validateBody(TransactionUpdateSchema), ledgerController.updateTransaction);

export default router;
