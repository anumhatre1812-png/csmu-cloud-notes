import { Response, NextFunction } from 'express';
import { AuthRequest } from './verifyFirebaseToken.js';
import { isAdmin } from '../config/admins.js';

export const checkAdminRole = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.email || !isAdmin(req.user.email)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
