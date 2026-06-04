import { Router } from 'express';
import { createDownloadUrl, listFiles, previewFile, updateFileMetadata, downloadFile } from '../controllers/files.controller.js';
import { checkAdminRole } from '../middleware/checkAdminRole.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

const router = Router();

router.get('/', verifyFirebaseToken, listFiles);
router.get('/:id/download-url', verifyFirebaseToken, createDownloadUrl);
router.get('/:id/preview', previewFile);
router.get('/:id/download', downloadFile);
router.patch('/:id', verifyFirebaseToken, checkAdminRole, updateFileMetadata);

export default router;
