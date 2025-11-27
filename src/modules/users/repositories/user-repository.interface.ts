import { User, Role } from '@prisma/client';

export interface IUserRepository {
  findByPhone(phone: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(userData: CreateUserData): Promise<User>;
}

export interface CreateUserData {
  name: string;
  phone: string;
  password: string;
  role?: Role;
  isActive?: boolean;
}
