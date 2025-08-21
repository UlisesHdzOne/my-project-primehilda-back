import { BaseUserDto } from '../../user/dto/base-user.dto';
import { IsEmail, IsString } from 'class-validator';

export class RegisterUserDto implements BaseUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
