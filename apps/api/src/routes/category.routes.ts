import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', categoryController.getRules);
router.post('/', categoryController.saveRule);

export default router;
