import { Router } from 'express';
import { getStats } from '../controllers/stats.controller.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { checkAdminRole } from '../middleware/checkAdminRole.js';

const router = Router();

router.get('/stats', verifyFirebaseToken, checkAdminRole, getStats);

export default router;
