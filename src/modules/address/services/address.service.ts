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
}
