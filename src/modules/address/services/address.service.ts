import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { AddressEntity } from '../entities/address.entity';
import { Address } from '@prisma/client';
import { AddressValidator } from './address.validator';

@Injectable()
export class AddressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly addressValidator: AddressValidator,
  ) {}

  private toEntity(address: Address): AddressEntity {
    return new AddressEntity(address);
  }

  async createAddress(
    dto: CreateAddressDto,
    userId: number,
  ): Promise<AddressEntity> {
    await this.addressValidator.validateCreate(dto, userId);
    const isDefault = dto.isDefault ?? false;

    if (isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await this.prisma.address.create({
      data: { ...dto, userId, isDefault },
    });

    return this.toEntity(address);
  }

  async updateAddress(
    id: number,
    dto: Partial<UpdateAddressDto>,
    userId: number,
  ): Promise<AddressEntity> {
    await this.addressValidator.validateUpdate(id, dto, userId);
    if (dto.isDefault === true) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

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
    const addresses =
      await this.addressValidator.validateExistsAndBelongsToUser(id, userId);
    return this.toEntity(addresses);
  }

  async deleteAddress(
    id: number,
    userId: number,
  ): Promise<{ message: string }> {
    // ✅ 1. Validar reglas de negocio (incluye existencia, pertenencia y regla de default)
    const existing = await this.addressValidator.validateDelete(id, userId);

    // 2. Eliminar
    await this.prisma.address.delete({ where: { id } });

    // 3. Lógica para reasignar la dirección por defecto si se eliminó la default
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
    // ✅ Validar existencia y pertenencia
    await this.addressValidator.validateExistsAndBelongsToUser(id, userId);

    // 1. Desmarcar todas las direcciones anteriores
    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // 2. Marcar la nueva dirección como default
    const updated = await this.prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    return this.toEntity(updated);
  }

  async getDefaultAddress(userId: number): Promise<AddressEntity> {
    const address = await this.prisma.address.findFirst({
      where: { userId, isDefault: true },
    });

    if (!address) {
      throw new NotFoundException(
        'No se encontró una dirección por defecto para este usuario.',
      );
    }

    return this.toEntity(address);
  }
}
