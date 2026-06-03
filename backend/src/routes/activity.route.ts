import { Router } from 'express';
import { listActivity } from '../controllers/activity.controller.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { checkAdminRole } from '../middleware/checkAdminRole.js';

const router = Router();

router.get('/activity', verifyFirebaseToken, checkAdminRole, listActivity);

export default router;
