import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';   
import logger from '../lib/logger';
const JWT_SECRET = process.env.JWT_SECRET!;

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  logger.info(`Authenticating...`);
  if (!authHeader?.startsWith('Bearer ')) {
    logger.error(`Missing token`);
    return res.status(401).json({ error: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: 'ADMIN' | 'USER' };
    console.log(decoded);
    (req as AuthenticatedRequest).user = decoded;
    logger.info(`Authentication successful!`);
    next();
  } catch (err) {
    logger.error(`Invalid or expired token`);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export default authenticateJWT;