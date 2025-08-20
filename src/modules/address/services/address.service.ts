import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateAddressDto } from '../dto/create-address.dto';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}

  async createAddres(dto: CreateAddressDto) {
    return this.prisma.address.create({
      data: dto,
    });
  }

  async getAddres() {
    return this.prisma.address.findMany();
  }

  async getAddresById(id: number) {
    return this.prisma.address.findUnique({ where: { id } });
  }

  async updateAddres(id: number, dto: Partial<CreateAddressDto>) {
    return this.prisma.address.update({ where: { id }, data: dto });
  }

  async deleteUser(id: number) {
    return this.prisma.address.delete({ where: { id } });
  }
}
