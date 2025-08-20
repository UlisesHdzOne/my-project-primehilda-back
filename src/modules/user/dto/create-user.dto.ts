import { BaseUserDto } from './base-user.dto';

export class CreateUserDto implements BaseUserDto {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'SELLER' | 'CUSTOMER';
  isActive?: boolean;
}
