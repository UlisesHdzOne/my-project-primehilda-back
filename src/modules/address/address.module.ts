import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddressController } from './controllers/address.controller';
import { AddressService } from './services/address.service';


@Module({
  controllers: [AddressController],
  providers: [AddressService, PrismaService],
})
export class AddresModule {}
