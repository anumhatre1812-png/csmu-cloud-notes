import { Router } from 'express';
import { deleteFile } from '../controllers/delete.controller';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken';
import { checkAdminRole } from '../middleware/checkAdminRole';

const router = Router();

router.delete('/:id', verifyFirebaseToken, checkAdminRole, deleteFile);

export default router;
