import { Router } from 'express';
import { listBookmarks, addBookmark, removeBookmark } from '../controllers/bookmarks.controller.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

const router = Router();

router.get('/', verifyFirebaseToken, listBookmarks);
router.post('/', verifyFirebaseToken, addBookmark);
router.delete('/:id', verifyFirebaseToken, removeBookmark);

export default router;
