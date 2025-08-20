import { BaseUserDto } from '../../user/dto/base-user.dto';

export class RegisterUserDto implements BaseUserDto {
  name: string;
  email: string;
  password: string;
}
