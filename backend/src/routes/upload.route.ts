import { Router } from 'express';
import multer from 'multer';
import { uploadFile } from '../controllers/upload.controller.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { checkAdminRole } from '../middleware/checkAdminRole.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/upload', verifyFirebaseToken, checkAdminRole, upload.single('file'), uploadFile);

export default router;
