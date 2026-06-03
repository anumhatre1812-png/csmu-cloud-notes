import { Router } from 'express';
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/announcements.controller.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { checkAdminRole } from '../middleware/checkAdminRole.js';

const router = Router();

router.get('/', verifyFirebaseToken, listAnnouncements);
router.post('/', verifyFirebaseToken, checkAdminRole, createAnnouncement);
router.patch('/:id', verifyFirebaseToken, checkAdminRole, updateAnnouncement);
router.delete('/:id', verifyFirebaseToken, checkAdminRole, deleteAnnouncement);

export default router;
