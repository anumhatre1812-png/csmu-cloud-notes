import { Router } from 'express';
import { createDownloadUrl, listFiles } from '../controllers/files.controller.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

const router = Router();

router.get('/', verifyFirebaseToken, listFiles);
router.get('/:id/download-url', verifyFirebaseToken, createDownloadUrl);

export default router;
