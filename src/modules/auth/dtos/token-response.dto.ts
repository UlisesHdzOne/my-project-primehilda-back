import { Expose } from 'class-transformer';

export class TokenResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  expiresIn: number;

  @Expose()
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };

  constructor(partial: Partial<TokenResponseDto>) {
    Object.assign(this, partial);
  }
}
