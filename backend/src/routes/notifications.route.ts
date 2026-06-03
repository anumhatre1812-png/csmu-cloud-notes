import { Router } from 'express';
import { registerToken, unregisterToken, sendNotification } from '../controllers/notifications.controller.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { checkAdminRole } from '../middleware/checkAdminRole.js';

const router = Router();

router.post('/register-token', verifyFirebaseToken, registerToken);
router.post('/unregister-token', verifyFirebaseToken, unregisterToken);
router.post('/send', verifyFirebaseToken, checkAdminRole, sendNotification);

export default router;
