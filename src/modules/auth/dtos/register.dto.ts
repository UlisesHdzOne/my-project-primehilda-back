import { IsEmail, IsString, MinLength, IsOptional, IsPhoneNumber } from 'class-validator';

export class RegisterDto {
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

  @IsString()
  @IsOptional()
  document?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
