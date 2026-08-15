import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', uploadController.getImports);
router.get('/:id', uploadController.getImportDetail);
router.delete('/:id', uploadController.rollbackImport);

export default router;
