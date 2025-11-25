import { Module } from '@nestjs/common';
import { ReservasService } from './service/reservas.service';
import { ReservaRepository } from './repository/reservas.repository';
import { ReservasController } from './controller/reservas.controller';

@Module({
  controllers: [ReservasController],
  providers: [ReservasService, ReservaRepository],
})
export class ReservaModule {}
