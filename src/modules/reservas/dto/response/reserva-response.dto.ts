import { Type } from 'class-transformer';
import { UserResponseDto } from './user-response.dto';
import { SalaResponseDto } from './sala-response.dto';

export class ReservaResponseDto {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;

  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @Type(() => SalaResponseDto)
  sala: SalaResponseDto;

  createdAt: Date;
  updatedAt: Date;
}
