import { IsString, Matches } from 'class-validator';

export class SearchUserDto {
  @IsString()
  @Matches(/^\d{10,15}$/)
  phone: string;
}
