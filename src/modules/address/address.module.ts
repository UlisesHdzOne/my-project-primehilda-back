import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddressController } from './controllers/address.controller';
import { AddressService } from './services/address.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '../auth/jwt/jwt.module';
import { AddressValidator } from './services/address.validator';
import { AddressAdminController } from './controllers/address.admin.controller';
import { AddressAdminService } from './services/address.admin.service';

@Module({
  //otros módulos que necesitas dentro de este módulo
  imports: [HttpModule, JwtModule],
  //los controladores que gestionan las rutas del módulo
  controllers: [AddressController, AddressAdminController],
  //los servicios que este módulo ofrece internamente
  providers: [
    AddressService,
    AddressValidator,
    PrismaService,
    AddressAdminService,
  ],
  //solo los servicios que quieres que otros módulos puedan usar
  exports: [],
})
export class AddressModule {}
