import { User } from '@prisma/client';

export class UserEntity {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: User | Omit<User, 'password'>) {
    this.id = user.id;
    this.name = user.name;
    this.lastName = user.lastName;
    this.email = user.email;
    this.phone = user.phone;
    this.role = user.role;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
