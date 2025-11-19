import { Injectable, ConflictException } from '@nestjs/common';
import { AddressEntity } from '../entities/address.entity';
import { CreateAddressDto } from '../dtos/requests/create-address.dto';
import { UpdateAddressDto } from '../dtos/requests/update-address.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class AddressesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createAddressDto: CreateAddressDto): Promise<AddressEntity> {
    if (createAddressDto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await this.prisma.address.create({
      data: {
        ...createAddressDto,
        userId,
      },
    });

    return toAddressEntity(address);
  }

  async findById(id: number): Promise<AddressEntity | null> {
    const address = await this.prisma.address.findUnique({ where: { id } });
    return address ? toAddressEntity(address) : null;
  }

  async findByUserId(userId: number): Promise<AddressEntity[]> {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return addresses.map(a => toAddressEntity(a));
  }

  async findDefaultByUserId(userId: number): Promise<AddressEntity | null> {
    const address = await this.prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
    return address ? toAddressEntity(address) : null;
  }

  async update(id: number, updateAddressDto: UpdateAddressDto): Promise<AddressEntity> {
    const address = await this.findById(id);
    if (!address) throw new ConflictException('Dirección no encontrada');

    if (updateAddressDto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId: address.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await this.prisma.address.update({
      where: { id },
      data: updateAddressDto,
    });

    return toAddressEntity(updated);
  }

  async delete(id: number): Promise<void> {
    const address = await this.findById(id);
    if (!address) throw new ConflictException('Dirección no encontrada');

    await this.prisma.address.delete({ where: { id } });

    if (address.isDefault) {
      const fallback = await this.prisma.address.findFirst({
        where: { userId: address.userId },
        orderBy: { createdAt: 'desc' },
      });

      if (fallback) {
        await this.prisma.address.update({
          where: { id: fallback.id },
          data: { isDefault: true },
        });
      }
    }
  }

  async countByUserId(userId: number): Promise<number> {
    return this.prisma.address.count({ where: { userId } });
  }
}

function toAddressEntity(data: any): AddressEntity {
  return new AddressEntity(data as Partial<AddressEntity>);
}
