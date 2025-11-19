import { Expose } from 'class-transformer';

export class UserPublicDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  lastName: string;

  @Expose()
  role: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<UserPublicDto>) {
    Object.assign(this, partial);
  }
}
