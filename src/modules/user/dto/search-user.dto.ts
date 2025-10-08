import { IsString, Matches } from 'class-validator';
import { USER_MESSAGES } from 'src/common/constants';

export class SearchUserDto {
  @IsString({ message: USER_MESSAGES.telefonoInvalido })
  @Matches(/^\d{10,15}$/, { message: USER_MESSAGES.telefonoInvalido })
  phone: string;
}
