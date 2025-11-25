import { Exclude, Type } from 'class-transformer';
import { ReservaResponseDto } from './reserva-response.dto';

export class UserResponseDto {
  id: number;
  name: string;
  phone: string;

  @Exclude() // nunca se enviará al cliente
  password: string;

  @Type(() => ReservaResponseDto)
  reservas?: ReservaResponseDto[];

  createdAt: Date;
  updatedAt: Date;
}
