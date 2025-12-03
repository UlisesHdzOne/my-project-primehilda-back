import type { Role } from '@prisma/client';
import type { UserBase } from 'shared/types/base.types';

/**
 * Safe Output (sin password)
 */
export type UserSafe = Omit<UserBase, 'password'>;

/**
 * Input Types
 */
export type UserCreateInput = {
  name: string;
  phone: string;
  password: string;
  role?: Role;
  isActive?: boolean;
};

/**
 * Diferentes flujos de creación
 */
export type CreateUserByAdminInput = Omit<UserCreateInput, 'password'> & { password?: string };
export type CreateUserPublicInput = Pick<UserCreateInput, 'name' | 'phone' | 'password'>;

/**
 * List / Filter
 */
export type UserListItem = Pick<UserSafe, 'id' | 'name' | 'phone'>;
export type FindUsersInput = {
  skip?: number;
  take?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
  orderBy?: keyof UserSafe;
  orderDirection?: 'asc' | 'desc';
};
export type CountUsersParams = Pick<FindUsersInput, 'search' | 'role' | 'isActive'>;

/**
 * Repository type (con password)
 */
export type UserWithPasswordFromRepository = Pick<
  UserBase,
  'id' | 'phone' | 'password' | 'isActive' | 'role'
>;

/**
 * Type Guards
 */
export function hasPassword(user: UserSafe | UserBase): user is UserBase {
  return 'password' in user;
}

/**
 * Output
 */
export type UsersListOutput = {
  users: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
};
