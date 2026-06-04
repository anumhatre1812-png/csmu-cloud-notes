import { Router } from 'express';
import { createDownloadUrl, listFiles, previewFile, updateFileMetadata } from '../controllers/files.controller.js';
import { checkAdminRole } from '../middleware/checkAdminRole.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

const router = Router();

router.get('/', verifyFirebaseToken, listFiles);
router.get('/:id/download-url', verifyFirebaseToken, createDownloadUrl);
router.get('/:id/preview', verifyFirebaseToken, previewFile);
router.patch('/:id', verifyFirebaseToken, checkAdminRole, updateFileMetadata);

export default router;
