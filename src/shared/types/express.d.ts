import { Request } from 'express';
import { Role } from '../constants/role.enum';

interface JwtPayload {
  sub: number;
  phone: string;
  name: string;
  role: Role;
  iat: number;
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
