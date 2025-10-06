import { IsString, Matches } from 'class-validator';
import { AUTH_MESSAGES } from 'src/common/constants';

export class SearchUserDto {
  @IsString({ message: AUTH_MESSAGES.telefonoInvalido })
  @Matches(/^\d{10,15}$/, { message: AUTH_MESSAGES.telefonoInvalido })
  phone: string;
}
