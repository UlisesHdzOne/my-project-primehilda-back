import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { AddressEntity } from '../entities/address.entity';
import { throwNotFound } from 'src/common/helper/error.helper';
import { AddressBusinessValidatorCreate } from '../validators-business/address-business-create.validator';
import { AddressBusinessValidatorDelete } from '../validators-business/address-business-delete.validator';
import { Address } from '@prisma/client';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(address: Address): AddressEntity {
    return new AddressEntity(address);
  }

  // Crear una nueva dirección
  async createAddress(
    dto: CreateAddressDto,
    userId: number,
  ): Promise<AddressEntity> {
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
      data: { ...dto, userId },
    });

    return this.toEntity(address);
  }

  // Obtener todas las direcciones de un usuario
  async getAddress(userId: number): Promise<AddressEntity[]> {
    const addresses = await this.prisma.address.findMany({ where: { userId } });
    return addresses.map((addr) => this.toEntity(addr));
  }

  // Buscar direcciones por nombre
  async searchAddresses(
    userId: number,
    name: string,
  ): Promise<AddressEntity[]> {
    const addresses = await this.prisma.address.findMany({
      where: { userId, name: { contains: name, mode: 'insensitive' } },
    });
    return addresses.map((address) => this.toEntity(address));
  }

  // Obtener una dirección por ID
  async getAddressById(id: number, userId: number): Promise<AddressEntity> {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });

    if (!address) throwNotFound('Dirección no encontrada');
    return this.toEntity(address);
  }

  // Actualizar dirección
  async updateAddress(
    id: number,
    dto: Partial<UpdateAddressDto>,
    userId: number,
  ): Promise<AddressEntity> {
    const existing = await this.prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) throwNotFound('Dirección no encontrada');

    const updated = await this.prisma.address.update({
      where: { id },
      data: dto,
    });

    return this.toEntity(updated);
  }

  // Eliminar dirección
  async deleteAddress(
    id: number,
    userId: number,
  ): Promise<{ message: string }> {
    await AddressBusinessValidatorDelete.validar({ id, userId }, this.prisma);

    const existing = await this.prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) throwNotFound('Dirección no encontrada');

    await this.prisma.address.delete({ where: { id } });

    // Si era por defecto, asignar otra por defecto
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

  // Establecer dirección por defecto
  async setDefaultAddress(id: number, userId: number): Promise<AddressEntity> {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });

    if (!address) throwNotFound('Dirección no encontrada');

    // Desactivar otras direcciones por defecto
    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // Activar la dirección seleccionada
    const updated = await this.prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    return this.toEntity(updated);
  }
}
