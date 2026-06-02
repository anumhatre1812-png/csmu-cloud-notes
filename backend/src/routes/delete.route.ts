import { Router } from 'express';
import { deleteFile } from '../controllers/delete.controller.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { checkAdminRole } from '../middleware/checkAdminRole.js';

const router = Router();

router.delete('/:id', verifyFirebaseToken, checkAdminRole, deleteFile);

export default router;
