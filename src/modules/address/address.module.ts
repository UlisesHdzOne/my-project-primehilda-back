import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddressController } from './controllers/address.controller';
import { AddressService } from './services/address.service';
import { GeocodingService } from './services/geocoding.service';
import { HttpModule } from '@nestjs/axios';
import { CacheService } from './services/cache.service';
import { JwtModule } from '../auth/jwt/jwt.module';


@Module({
  imports: [HttpModule,JwtModule],
  controllers: [AddressController],
  providers: [AddressService, PrismaService, GeocodingService,CacheService],
  exports: [GeocodingService,CacheService],
})
export class AddressModule {}
