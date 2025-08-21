import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAddressDto } from '../dto/create-address.dto';
import { GeocodingService } from './geocoding.service';
import { CacheService } from './cache.service';
import { validateCoordinates } from '../utils/address.validator';
import { UpdateAddressDto } from '../dto/update-address.dto';

@Injectable()
export class AddressService {
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

  async updateAddress(id: number, dto: UpdateAddressDto) {
    let coords = {};
    if (dto.latitude != null && dto.longitude != null) {
      coords = await validateCoordinates(
        dto.latitude,
        dto.longitude,
        this.geo,
        this.cache,
      );
    }

    const dataToUpdate = { ...dto, ...coords };
    return this.prisma.address.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async deleteAddress(id: number) {
    return this.prisma.address.delete({ where: { id } });
  }
}
