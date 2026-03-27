import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export async function authenticate(req: any, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('? Auth: No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('? Auth: Invalid token format');
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const secret = process.env.JWT_SECRET || 'default-secret-change-me';
    console.log('?? Auth using secret:', secret);

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, secret) as JwtPayload;
      console.log('? Auth: Token verified, decoded:', decoded);
    } catch (err: any) {
      console.log('? Auth: JWT verification failed:', err.message);
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Use 'id' field from token (matches login route)
    const user = await (prisma as any).users.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      console.log('? Auth: User not found for id:', decoded.id);
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    console.log('? Auth: User authenticated:', user.email);
    next();
  } catch (error) {
    console.error('? Auth: Unexpected error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}






