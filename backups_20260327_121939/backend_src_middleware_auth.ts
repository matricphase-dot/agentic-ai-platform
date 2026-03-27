import { Request, Response, NextFunction } from 'express';

export async function authenticate(req: any, res: Response, next: NextFunction) {
  // For development: attach a dummy user
  req.user = { id: 'dummy-user-id', email: 'admin@example.com', role: 'ADMIN' };
  console.log('🔓 Auth bypassed (development mode)');
  next();
}
