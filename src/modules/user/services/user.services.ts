import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'bcrypt';
import {
  validateEmailUpdate,
  validateUserEmailUnique,
  validateUserExists,
} from '../utils/user.validator';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    await validateUserEmailUnique(dto.email, this.prisma);
    const hashedPassword = await hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
    });

    // Retornar solo datos seguros
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async getUsers() {
    return this.prisma.user.findMany();
  }

  async getUserById(id: number) {
    return validateUserExists(id, this.prisma);
  }

  async updateUser(id: number, dto: Partial<CreateUserDto>) {
    await validateUserExists(id, this.prisma);
    if (dto.email) {
      await validateEmailUpdate(id, dto.email, this.prisma);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    const { password, ...safeUser } = updatedUser;
    return safeUser;
  }

  async deleteUser(id: number) {
    await validateUserExists(id, this.prisma);
    return this.prisma.user.delete({ where: { id } });
  }


async findUserByPhone(phone: string) {
  const user = await this.prisma.user.findUnique({
    where: { phone },
    include: { addresses: true },
  });

  if (!user) {
    throw new NotFoundException(`No existe un usuario con el teléfono ${phone}`);
  }

  const { password, ...safeUser } = user;
  return safeUser;
}

}
