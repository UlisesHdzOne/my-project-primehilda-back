export class UserEntity {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  document?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
