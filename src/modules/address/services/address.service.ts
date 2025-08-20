import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAddressDto } from '../dto/create-address.dto';
import { GeocodingService } from './geocoding.service';
import { CacheService } from './cache.service';
import { validateCoordinates } from '../utils/address.validator';

@Injectable()
export class AddressService {
  private readonly PRECISION = 6; // normaliza lat/lng

  constructor(
    private readonly prisma: PrismaService,
    private geo: GeocodingService,
    private cache: CacheService,
  ) {}

  async createAddress(dto: CreateAddressDto) {
    const coords = await validateCoordinates(
      dto.latitude,
      dto.longitude,
      this.geo,
      this.cache,
    );
    const normalizedDto = { ...dto, ...coords };
    return this.prisma.address.create({ data: normalizedDto });
  }

  async getAddress() {
    return this.prisma.address.findMany();
  }

  async getAddressById(id: number) {
    return this.prisma.address.findUnique({ where: { id } });
  }

  async updateAddress(id: number, dto: CreateAddressDto) {
    const coords = await validateCoordinates(
      dto.latitude,
      dto.longitude,
      this.geo,
      this.cache,
    );
    dto.latitude = coords.latitude;
    dto.longitude = coords.longitude;

    return this.prisma.address.update({ where: { id }, data: dto });
  }

  async deleteAddress(id: number) {
    return this.prisma.address.delete({ where: { id } });
  }
}
