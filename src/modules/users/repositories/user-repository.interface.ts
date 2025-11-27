import { User, Role } from '@prisma/client';

export interface IUserRepository {
  findByPhone(phone: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(userData: { name: string; phone: string; password: string; role?: Role }): Promise<User>;
}
