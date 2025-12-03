// ============================================
// 📁 src/modules/auth/types/auth.types.ts
// ============================================
// ✨ ÚNICO archivo de types - Todo consolidado aquí

import type { Role } from '@prisma/client';

// ============================================
// 📦 BASE TYPES
// ============================================

/**
 * Payload del JWT - lo que se guarda en el token
 */
export type JwtPayload = {
  id: number;
  phone: string;
  role: Role;
};

/**
 * Payload completo del JWT (con campos de jsonwebtoken)
 */
export type JwtPayloadComplete = JwtPayload & {
  iat?: number; // issued at
  exp?: number; // expiration
};

/**
 * Tokens de autenticación
 */
export type AuthTokens = {
  access_token: string;
  refresh_token?: string;
};

// ============================================
// 📥 INPUT TYPES (parámetros de métodos)
// ============================================

/**
 * Datos para login
 */
export type LoginInput = {
  phone: string;
  password: string;
};

/**
 * Datos para registro
 */
export type RegisterInput = {
  name: string;
  phone: string;
  password: string;
  role?: Role;
};

/**
 * Datos para refresh token
 */
export type RefreshTokenInput = {
  refresh_token: string;
};

/**
 * Datos para validar token
 */
export type ValidateTokenInput = {
  token: string;
};

// ============================================
// 📤 OUTPUT TYPES (retornos de métodos)
// ============================================

/**
 * Usuario seguro para respuestas de auth
 * (sin password)
 */
export type AuthUserOutput = {
  id: number;
  name: string;
  phone: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Respuesta de login
 */
export type LoginOutput = {
  tokens: AuthTokens;
  user: AuthUserOutput;
};

/**
 * Respuesta de registro
 */
export type RegisterOutput = {
  tokens: AuthTokens;
  user: AuthUserOutput;
};

/**
 * Respuesta de refresh token
 */
export type RefreshTokenOutput = {
  tokens: AuthTokens;
};

/**
 * Respuesta de validación de token
 */
export type ValidateTokenOutput = {
  isValid: boolean;
  payload?: JwtPayloadComplete;
};

// ============================================
// 🔗 HELPER TYPES
// ============================================

/**
 * Usuario con password (desde Users module)
 * Solo para verificación interna
 */
export type UserWithPassword = {
  id: number;
  name: string;
  phone: string;
  password: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================
// 🏷️ TYPE GUARDS
// ============================================

/**
 * Verifica si un payload es un JwtPayload válido
 */
export function isValidJwtPayload(payload: unknown): payload is JwtPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'id' in payload &&
    'phone' in payload &&
    'role' in payload &&
    typeof (payload as JwtPayload).id === 'number' &&
    typeof (payload as JwtPayload).phone === 'string' &&
    typeof (payload as JwtPayload).role === 'string'
  );
}
