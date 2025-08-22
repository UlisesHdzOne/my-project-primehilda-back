import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAddressDto } from '../dto/create-address.dto';
import { GeocodingService } from './geocoding.service';
import { CacheService } from './cache.service';
import { validateAddress } from '../utils/address.validator';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { error } from 'console';

@Injectable()
export class AddressService {
  constructor(
    private readonly prisma: PrismaService,
    private geo: GeocodingService,
    private cache: CacheService,
  ) {}

  async createAddress(dto: CreateAddressDto, userId: number) {
    const normalizedLat = parseFloat(dto.latitude.toFixed(6));
    const normalizedLng = parseFloat(dto.longitude.toFixed(6));
    //validar (con las coords normalizadas)
    await validateAddress(
      { ...dto, latitude: normalizedLat, longitude: normalizedLng },
      userId,
      this.prisma,
      this.geo,
      this.cache,
    );

    return this.prisma.address.create({
      data: {
        ...dto,
        latitude: normalizedLat,
        longitude: normalizedLng,
        userId,
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

  async updateAddress(dto: UpdateAddressDto, userId: number, id: number) {
    //normalizar
    const normalizedLat = parseFloat(dto.latitude.toFixed(6));
    const normalizedLng = parseFloat(dto.longitude.toFixed(6));

    await validateAddress(
      { ...dto, latitude: normalizedLat, longitude: normalizedLng },
      userId,
      this.prisma,
      this.geo,
      this.cache,
      true,
      id,
    );

    const updated = await this.prisma.address.update({
      where: { id, userId },
      data: {
        ...dto,
        latitude: normalizedLat,
        longitude: normalizedLng,
      },
    });

    if (!updated) {
      throw new BadRequestException('No puedes actualizar esta direccion');
    }
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
