// ============================================
// 📁 src/modules/auth/types/auth.types.ts
// ============================================

import type { Role } from '@prisma/client';

// ============================================
// 📦 BASE TYPES
// ============================================

export type JwtPayload = {
  id: number;
  phone: string;
  role: Role;
};

export type JwtPayloadComplete = JwtPayload & {
  iat?: number;
  exp?: number;
};

export type AuthTokens = {
  access_token: string;
  refresh_token?: string;
};

// ============================================
// 📥 INPUT TYPES
// ============================================

export type LoginInput = {
  phone: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  phone: string;
  password: string;
  role?: Role;
};

export type RefreshTokenInput = {
  refresh_token: string;
};

export type ValidateTokenInput = {
  token: string;
};

// ============================================
// 📤 OUTPUT TYPES
// ============================================

export type AuthUserOutput = {
  id: number;
  name: string;
  phone: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type LoginOutput = {
  tokens: AuthTokens;
  user: AuthUserOutput;
};

export type RegisterOutput = {
  tokens: AuthTokens;
  user: AuthUserOutput;
};

export type RefreshTokenOutput = {
  tokens: AuthTokens;
};

export type ValidateTokenOutput = {
  isValid: boolean;
  payload?: JwtPayloadComplete;
};

// ============================================
// 🏷️ TYPE GUARDS
// ============================================

export function isValidJwtPayload(payload: unknown): payload is JwtPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'id' in payload &&
    'phone' in payload &&
    'role' in payload
  );
}
