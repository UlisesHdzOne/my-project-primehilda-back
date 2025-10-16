import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddressController } from './controllers/address.controller';
import { AddressService } from './services/address.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '../auth/jwt/jwt.module';
import { AddressValidator } from './services/address.validator';

@Module({
  //otros módulos que necesitas dentro de este módulo
  imports: [HttpModule, JwtModule],
  //los controladores que gestionan las rutas del módulo
  controllers: [AddressController],
  //los servicios que este módulo ofrece internamente
  providers: [AddressService, AddressValidator, PrismaService],
  //solo los servicios que quieres que otros módulos puedan usar
  exports: [],
})
export class AddressModule {}
