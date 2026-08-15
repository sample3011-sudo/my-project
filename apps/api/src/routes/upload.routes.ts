import { Router } from 'express';
import multer from 'multer';
import { uploadController } from '../controllers/upload.controller';
import { protect } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { ColumnMappingSchema, MalformedRowsPatchSchema } from '@repo/shared';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const router = Router();

router.use(protect);

router.post('/', upload.single('file'), uploadController.uploadFile);
router.get('/:id/preview', uploadController.getPreview);
router.patch('/:id/mapping', validateBody(ColumnMappingSchema), uploadController.saveMapping);
router.post('/:id/parse', uploadController.parseSession);
router.patch('/:id/malformed', validateBody(MalformedRowsPatchSchema), uploadController.updateMalformed);
router.post('/:id/commit', uploadController.commitSession);

export default router;
