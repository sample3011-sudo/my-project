import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { protect } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { BankPresetWriteSchema } from '@repo/shared';

const router = Router();

router.use(protect);

router.get('/', uploadController.getBankPresets);
router.post('/', validateBody(BankPresetWriteSchema), uploadController.saveBankPreset);

export default router;
