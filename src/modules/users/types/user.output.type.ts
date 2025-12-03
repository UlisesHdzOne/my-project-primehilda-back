import type { UserSafe, UserForList } from './user.shared.type';

/**
 * Tipos para salida/respuestas del servicio users
 */
export type UserOutput = UserSafe;
export type UserListOutput = UserForList[];
export type UserWithTokenOutput = {
  user: UserOutput;
  access_token: string;
};
