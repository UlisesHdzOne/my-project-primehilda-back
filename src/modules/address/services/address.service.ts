import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { AddressEntity } from '../entities/address.entity';
import { AddressBusinessValidatorCreate } from '../validators-business/address-business-create.validator';
import { AddressBusinessValidatorUpdate } from '../validators-business/address-business-update.validator';
import { AddressBusinessValidatorDelete } from '../validators-business/address-business-delete.validator';
import { Address } from '@prisma/client';
import { ErrorHelper } from 'src/common/helper/error.helper';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(address: Address): AddressEntity {
    return new AddressEntity(address);
  }

  async createAddress(
    dto: CreateAddressDto,
    userId: number,
  ): Promise<AddressEntity> {
    if (!userId) ErrorHelper.unauthorizedException('Usuario no autenticado');

    await AddressBusinessValidatorCreate.validar(
      {
        userId,
        name: dto.name ?? '',
        latitude: dto.latitude ?? 0,
        longitude: dto.longitude ?? 0,
        isDefault: dto.isDefault ?? false,
      },
      this.prisma,
    );

    const address = await this.prisma.address.create({
      data: { ...dto, userId, isDefault: dto.isDefault ?? false },
    });

    return this.toEntity(address);
  }

  async updateAddress(
    id: number,
    dto: Partial<UpdateAddressDto>,
    userId: number,
  ): Promise<AddressEntity> {
    const existing = await this.prisma.address.findFirst({
      where: { id, userId },
    });
    if (!existing) ErrorHelper.notFoundException('Dirección no encontrada');

    await AddressBusinessValidatorUpdate.validar(
      { id, userId, ...dto },
      this.prisma,
    );

    const updated = await this.prisma.address.update({
      where: { id },
      data: dto,
    });

    return this.toEntity(updated);
  }

  async getAddresses(userId: number): Promise<AddressEntity[]> {
    const addresses = await this.prisma.address.findMany({ where: { userId } });
    return addresses.map((addr) => this.toEntity(addr));
  }

  async searchAddresses(
    userId: number,
    name: string,
  ): Promise<AddressEntity[]> {
    const addresses = await this.prisma.address.findMany({
      where: { userId, name: { contains: name, mode: 'insensitive' } },
    });
    return addresses.map((address) => this.toEntity(address));
  }

  async getAddressById(id: number, userId: number): Promise<AddressEntity> {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });
    if (!address) ErrorHelper.notFoundException('Dirección no encontrada');
    return this.toEntity(address);
  }

  async deleteAddress(
    id: number,
    userId: number,
  ): Promise<{ message: string }> {
    await AddressBusinessValidatorDelete.validar({ id, userId }, this.prisma);

    const existing = await this.prisma.address.findFirst({
      where: { id, userId },
    });
    if (!existing) ErrorHelper.notFoundException('Dirección no encontrada');

    await this.prisma.address.delete({ where: { id } });

    if (existing.isDefault) {
      const another = await this.prisma.address.findFirst({
        where: { userId },
        orderBy: { id: 'asc' },
      });

      if (another) {
        await this.prisma.address.update({
          where: { id: another.id },
          data: { isDefault: true },
        });
      }
    }

    return { message: 'Dirección eliminada correctamente' };
  }

  async setDefaultAddress(id: number, userId: number): Promise<AddressEntity> {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });
    if (!address) ErrorHelper.notFoundException('Dirección no encontrada');

    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    const updated = await this.prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    return this.toEntity(updated);
  }
}
