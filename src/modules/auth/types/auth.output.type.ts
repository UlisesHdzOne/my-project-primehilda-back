import type { AuthTokens } from './auth.shared.type';
import type { UserOutput } from '@/modules/users/types/user.output.type';

/**
 * Tipos para salida/respuestas del servicio auth
 */
export type LoginOutput = {
  tokens: AuthTokens;
  user: UserOutput;
};

export type RegisterOutput = {
  tokens: AuthTokens;
  user: UserOutput;
};

export type RefreshTokenOutput = {
  tokens: AuthTokens;
};

export type ValidateTokenOutput = {
  isValid: boolean;
  payload?: {
    id: number;
    phone: string;
    role: string;
  };
};
