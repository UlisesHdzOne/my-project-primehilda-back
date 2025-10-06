import { IsString } from 'class-validator';

export class AddressMessageResponseDto {
  @IsString()
  message: string;
}
