import { Request } from 'express';

interface JwtPayload {
  id: number;
  email: string;
  role: Role;
}

interface AuthRequest extends Request {
  user: JwtPayload;
}
