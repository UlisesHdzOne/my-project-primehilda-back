import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AddressAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAddressesByUserId(userId: number) {
    return this.prisma.address.findMany({
      where: { userId },
    });
  }
}
