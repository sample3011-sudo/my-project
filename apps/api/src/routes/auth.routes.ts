import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { LoginRequestSchema } from '@repo/shared';

const router = Router();

router.post('/login', validateBody(LoginRequestSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.me);

export default router;
