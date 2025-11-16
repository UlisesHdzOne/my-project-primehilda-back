import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { AddressEntity } from '../entities/address.entity';
import { Address, Prisma } from '@prisma/client';
import { AddressValidator } from './address.validator';
import { AddressEntityResponse } from '../entities/AddressEntityResponse';

@Injectable()
export class AddressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly addressValidator: AddressValidator,
  ) {}

  private toEntity(address: Address): AddressEntity {
    return new AddressEntity(address);
  }

  async createAddress(dto: AddressDto, userId: number): Promise<void> {
    await this.addressValidator.validateCreate(dto, userId);
    const isDefault = dto.isDefault ?? false;

    // Si es default, desactiva las demás
    if (isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    await this.prisma.address.create({
      data: { ...dto, userId, isDefault },
    });
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

  async getAddresses(
    userId: number,
    query?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<AddressEntityResponse> {
    const where = this.buildSearchWhere(userId, query);

    const total = await this.prisma.address.count({ where });
    const addresses = await this.prisma.address.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: 'asc' },
    });

    return {
      addresses: addresses.map((a) => this.toEntity(a)),
      total,
      page,
      limit,
    };
  }

  async searchAddresses(userId: number, q: string): Promise<AddressEntity[]> {
    const addresses = await this.prisma.address.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { street: { contains: q, mode: 'insensitive' } },
          { colony: { contains: q, mode: 'insensitive' } },
          { reference: { contains: q, mode: 'insensitive' } },
          { zipcode: { contains: q, mode: 'insensitive' } },
        ],
      },
    });
    return addresses.map((a) => this.toEntity(a));
  }

  async getAddressById(id: number, userId: number): Promise<AddressEntity> {
    const address = await this.addressValidator.validateExistsAndBelongsToUser(
      id,
      userId,
    );
    return this.toEntity(address);
  }

  async deleteAddress(id: number, userId: number): Promise<void> {
    const existing = await this.addressValidator.validateDelete(id, userId);

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
  }

  async setDefaultAddress(id: number, userId: number): Promise<AddressEntity> {
    await this.addressValidator.validateExistsAndBelongsToUser(id, userId);

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

  private buildSearchWhere(
    userId: number,
    query?: string,
  ): Prisma.AddressWhereInput {
    const where: Prisma.AddressWhereInput = { userId };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { street: { contains: query, mode: 'insensitive' } },
        { colony: { contains: query, mode: 'insensitive' } },
        { reference: { contains: query, mode: 'insensitive' } },
        { zipcode: { contains: query, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
