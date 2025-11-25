import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  id: number;
  name: string;
  phone: string;

  @Exclude({ toPlainOnly: true })
  password: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
