import { Router } from 'express';
import { listDownloadHistory, logDownload } from '../controllers/downloads.controller.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

const router = Router();

router.get('/', verifyFirebaseToken, listDownloadHistory);
router.post('/', verifyFirebaseToken, logDownload);

export default router;
