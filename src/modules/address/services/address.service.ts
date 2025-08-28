import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAddressDto } from '../dto/create-address.dto';
import { GeocodingService } from './geocoding.service';
import { CacheService } from './cache.service';
import { UpdateAddressDto } from '../dto/update-address.dto';
import {
  shouldBeDefault,
  validateAddressOwnership,
  validateCreateAddress,
  validateUpdateAddress,
} from 'src/utils/address.utils';

@Injectable()
export class AddressService {
  constructor(
    private readonly prisma: PrismaService,
    private geo: GeocodingService,
    private cache: CacheService,
  ) {}

  async createAddress(dto: CreateAddressDto, userId: number) {
    const isDefault = await shouldBeDefault(userId, this.prisma);

    const coords = await validateCreateAddress(
      dto,
      userId,
      this.prisma,
      this.geo,
      this.cache,
    );

    return this.prisma.address.create({
      data: {
        ...dto,
        ...coords,
        userId,
        isDefault,
      },
    });
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

  async updateAddress(
    dto: Partial<UpdateAddressDto>,
    userId: number,
    id: number,
  ) {
    // Validar y normalizar solo si hay coords
    const coords = await validateUpdateAddress(
      dto,
      userId,
      id,
      this.prisma,
      this.geo,
      this.cache,
    );

    return this.prisma.address.update({
      where: { id, userId },
      data: {
        ...dto,
        ...(coords ?? {}), // solo se incluyen coords si vienen
      },
    });
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

  async setDefaultAddress(addressId: number, userId: number) {
    const address = await validateAddressOwnership(
      addressId,
      userId,
      this.prisma,
    );

    await this.prisma.$transaction([
      this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      this.prisma.address.update({
        where: { id: address.id },
        data: { isDefault: true },
      }),
    ]);

    return { message: 'Dirección por defecto actualizada correctamente' };
  }

  async getDefaultAddress(userId: number) {
    return this.prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
  }

  async searchAddresses(userId: number, name?: string) {
  return this.prisma.address.findMany({
    where: {
      userId,
      name: name ? { contains: name, mode: 'insensitive' } : undefined,
    },
  });
}

}
