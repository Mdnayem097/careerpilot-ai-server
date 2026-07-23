import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Missing or invalid authorization token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'careerpilot_secret_key_agentic_ai_2026_super_secure';
    const decoded = jwt.verify(token, secret) as { userId: string; email: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
  }
};
