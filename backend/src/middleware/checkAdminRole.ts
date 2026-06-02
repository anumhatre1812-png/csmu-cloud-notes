import { Response, NextFunction } from 'express';
import { AuthRequest } from './verifyFirebaseToken';
import { isAdmin } from '../config/admins';

export const checkAdminRole = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.email || !isAdmin(req.user.email)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
