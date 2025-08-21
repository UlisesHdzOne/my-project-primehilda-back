import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAddressDto } from '../dto/create-address.dto';
import { GeocodingService } from './geocoding.service';
import { CacheService } from './cache.service';
import { validateAddress } from '../utils/address.validator';
import { UpdateAddressDto } from '../dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(
    private readonly prisma: PrismaService,
    private geo: GeocodingService,
    private cache: CacheService,
  ) {}

  async createAddress(dto: CreateAddressDto, userId: number) {
    await validateAddress(dto, userId, this.prisma, this.geo, this.cache);

    return this.prisma.address.create({ data: { ...dto, userId } });
  }

  async getAddress(userId: number) {
    return this.prisma.address.findMany({ where: { userId } });
  }

  async getAddressById(id: number, userId: number) {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address || address.userId !== userId) {
      throw new BadRequestException('No puedes acceder a esta dirección');
    }

    return address;
  }

  async updateAddress(id: number, dto: UpdateAddressDto, userId: number) {
    await validateAddress(dto, userId, this.prisma, this.geo, this.cache, true);

    const updated = await this.prisma.address.updateMany({
      where: { id, userId },
      data: dto,
    });

    if (updated.count === 0)
      throw new BadRequestException('No puedes actualizar esta direccion');

    return updated;
  }

  async deleteAddress(id: number, userId: number) {
    const deleted = await this.prisma.address.deleteMany({
      where: {
        id,
        userId,
      },
    });

    if (deleted.count === 0) {
      throw new BadRequestException('No puedes eliminar esta dirección');
    }

    return { message: 'Dirección eliminada correctamente' };
  }
}
