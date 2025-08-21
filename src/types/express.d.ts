import { Request } from 'express';
import { Role } from '@prisma/client';

interface JwtPayload {
  id: number;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export interface AuthRequest extends Request {
  user: JwtPayload;
}

export type { JwtPayload };