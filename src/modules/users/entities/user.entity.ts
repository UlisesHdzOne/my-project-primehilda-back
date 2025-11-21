export class UserEntity {
  id: number;
  name: string;
  lastName: string;
  email?: string;
  password?: string;
  phone: string;
  role: string;
  document?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
