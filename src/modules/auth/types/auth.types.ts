import type { Role } from '@prisma/client';
import type { UserSafe } from '../../users/types/user.types';

/**
 * JWT Payload
 */
export type JwtPayload = {
  id: number;
  phone: string;
  role: Role;
};

export type JwtPayloadComplete = JwtPayload & {
  iat?: number;
  exp?: number;
};

/**
 * Auth tokens
 */
export type AuthTokens = {
  access_token: string;
  refresh_token?: string;
};

/**
 * Input Types
 */
export type LoginInput = { phone: string; password: string };
export type RegisterInput = { name: string; phone: string; password: string; role?: Role };
export type RefreshTokenInput = { refresh_token: string };
export type ValidateTokenInput = { token: string };

/**
 * Output Types
 */
export type AuthUserOutput = UserSafe;
export type LoginOutput = { tokens: AuthTokens; user: AuthUserOutput };
export type RegisterOutput = LoginOutput;
export type RefreshTokenOutput = { tokens: AuthTokens };
export type ValidateTokenOutput = { isValid: boolean; payload?: JwtPayloadComplete };

/**
 * Type Guards
 */
export function isValidJwtPayload(payload: unknown): payload is JwtPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'id' in payload &&
    'phone' in payload &&
    'role' in payload
  );
}
