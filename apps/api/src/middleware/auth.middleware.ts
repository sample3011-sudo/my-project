import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { UnauthorizedError, ForbiddenError } from '../errors';
import { AuthenticatedUser } from '../types/express';

interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
}

export const protect = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication required', 'AUTH_UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('Authentication token missing', 'AUTH_UNAUTHORIZED');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || 'ADMIN',
    };
    next();
  } catch (_error) {
    throw new UnauthorizedError('Invalid or expired access token', 'AUTH_UNAUTHORIZED');
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required', 'AUTH_UNAUTHORIZED');
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      throw new ForbiddenError('Access forbidden: insufficient permissions', 'AUTH_FORBIDDEN');
    }

    next();
  };
};
