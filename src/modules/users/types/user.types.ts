import type { User, Role } from '@prisma/client';

// ENTIDAD CRUDA
export type UserEntity = User;

// OUTPUT SEGURO (sin password)
export type UserSafe = Omit<UserEntity, 'password'>;

// INPUTS
export type UserCreateInput = {
  name: string;
  phone: string;
  password: string;
  role?: Role;
  isActive?: boolean;
};

export type CreateUserByAdminInput = {
  name: string;
  phone: string;
  password?: string;
  role?: Role;
  isActive?: boolean;
};

export type CreateUserPublicInput = {
  name: string;
  phone: string;
  password: string;
};

// LISTAS / FILTROS
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

// REPOSITORIO
export type UserWithPasswordFromRepository = UserEntity;

// TYPE GUARD
export function hasPassword(user: UserSafe | UserEntity): user is UserEntity {
  return 'password' in user;
}

// SALIDAS
export type UsersListOutput = {
  users: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
};
