import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import logger from '../lib/logger';
export const authorizeRole = (requiredRole: 'ADMIN' | 'USER') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      logger.info(`Authorizing user with role: ${req.user?.role} and required role: ${requiredRole}`);
      if (req.user?.role !== requiredRole) {
        logger.error(`Forbidden: insufficient role`);
        return res.status(403).json({ error: 'Forbidden: insufficient role' });
      }
      next();
    } catch (err: any) {
      logger.error(`Internal server error: ${err.message || err}`);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};