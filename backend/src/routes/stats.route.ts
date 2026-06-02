import { Router } from 'express';
import { getStats } from '../controllers/stats.controller';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken';
import { checkAdminRole } from '../middleware/checkAdminRole';

const router = Router();

router.get('/stats', verifyFirebaseToken, checkAdminRole, getStats);

export default router;
