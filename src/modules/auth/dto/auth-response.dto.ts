import { Expose, Type } from 'class-transformer';

export class AuthResponseDto {
  @Expose()
  access_token!: string;

  @Expose()
  @Type(() => AuthResponseDto)
  user!: AuthResponseDto;
}
