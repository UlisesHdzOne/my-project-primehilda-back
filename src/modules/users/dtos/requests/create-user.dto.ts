import { IsEmail, IsString, IsOptional, MinLength, IsEnum } from 'class-validator';
import { Role } from 'src/shared/constants';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(10)
  phone: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsString()
  @IsOptional()
  document?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
