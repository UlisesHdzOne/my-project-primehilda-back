import type { Role, User } from '@prisma/client';

// ======================
// 🟢 USER TYPES
// ======================
export type AuthUserResponse = Omit<User, 'password' | 'createdAt' | 'updatedAt'>;

// ======================
// 🔑 JWT PAYLOAD
// ======================
export interface JwtPayload {
  id: number;
  phone: string;
  role: Role;
}

export interface JwtPayloadComplete extends JwtPayload {
  iat?: number;
  exp?: number;
}

// ======================
// 🔐 TOKENS
// ======================
export interface AuthTokensResponse {
  access_token: string;
  refresh_token?: string;
}

// ======================
// 📝 INPUT TYPES
// ======================
export interface LoginInput {
  phone: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  phone: string;
  password: string;
  role?: Role;
}

// ======================
// 📝 OUTPUT TYPES
// ======================
export interface AuthResponse {
  user: AuthUserResponse;
  tokens: AuthTokensResponse;
}

// ======================
// 🛡️ TYPE GUARDS
// ======================
export function isValidJwtPayload(payload: unknown): payload is JwtPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'id' in payload &&
    'phone' in payload &&
    'role' in payload
  );
}
