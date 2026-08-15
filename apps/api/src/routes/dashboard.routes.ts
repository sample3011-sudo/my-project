import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/months', dashboardController.getMonths);
router.get('/summary', dashboardController.getSummary);
router.get('/categories', dashboardController.getCategories);
router.get('/merchants', dashboardController.getMerchants);

export default router;
