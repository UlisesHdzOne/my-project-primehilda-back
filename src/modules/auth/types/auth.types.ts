import type { Role, User } from '@prisma/client';

// ======================
// 🟢 USER TYPES
// ======================
export type UserSafe = Omit<User, 'password'>;
export type AuthUserOutput = UserSafe;

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
export interface AuthTokens {
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

export interface RefreshTokenInput {
  refresh_token: string;
}

export interface ValidateTokenInput {
  token: string;
}

// ======================
// 📝 OUTPUT TYPES
// ======================
export interface LoginOutput {
  tokens: AuthTokens;
  user: AuthUserOutput;
}

export type RegisterOutput = LoginOutput;

export interface RefreshTokenOutput {
  tokens: AuthTokens;
}

export interface ValidateTokenOutput {
  isValid: boolean;
  payload?: JwtPayloadComplete;
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
