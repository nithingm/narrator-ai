// backend/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors, JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env', override: true });

// Ensure we have a JWT secret
const jwtSecret =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === 'development' ? 'your_jwt_secret' : undefined);

if (!jwtSecret) {
  throw new Error('JWT_SECRET is not set in the environment');
}

/**
 * Middleware to authenticate and attach user info to req.user
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // For demo, we create a "guest" user if no token is provided.
    (req as any).user = { id: 'guest', username: 'guest' };
    return next();
  }

  jwt.verify(token, jwtSecret, (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
    if (err) {
      console.error('Error verifying token:', err);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // decoded can be a string or object depending on how the JWT was signed
    (req as any).user = decoded;
    next();
  });
};
