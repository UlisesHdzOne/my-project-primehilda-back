import { Module } from '@nestjs/common';
import { AddressesController } from './controllers/addresses.controller';
import { AddressesService } from './services/addresses.service';
import { AddressesRepository } from './repositories/addresses.repository';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  controllers: [AddressesController],
  providers: [AddressesService, AddressesRepository],
  exports: [AddressesService],
})
export class AddressesModule {}
