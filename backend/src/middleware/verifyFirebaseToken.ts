import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../config/firebase.js';

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyFirebaseToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token || token === 'undefined' || token === 'null') {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
