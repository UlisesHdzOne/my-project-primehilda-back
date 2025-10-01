import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'bcrypt';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from 'src/modules/auth/dto/user-response.dto';

import { UserCreateValidator } from 'src/validators/user-create.validator';
import { UserUpdateValidator } from 'src/validators/user-update.validator';

import { UserBusinessValidatorUpdate } from '../validators-business/user-business-update.validator';
import { UserBusinessValidatorDelete } from '../validators-business/user-business-delete.validator';
import { UserBusinessValidatorCreate } from '../validators-business/user-business-create.validator';

import { throwBadRequest } from 'src/common/helper/error.helper';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    UserCreateValidator.validarEntrada(dto);
    await UserBusinessValidatorCreate.validar(dto, this.prisma);

    const hashedPassword = await hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: { ...dto, password: hashedPassword },
    });

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async getUsers(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany();
    return users.map(({ password, ...safeUser }) => safeUser);
  }

  async getUserById(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    UserUpdateValidator.validarEntrada(dto);
    await UserBusinessValidatorUpdate.validar({ id, ...dto }, this.prisma); // reglas de negocio

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    const { password, ...safeUser } = updatedUser;
    return safeUser;
  }

  async deleteUser(id: number): Promise<UserResponseDto> {
    const user = await UserBusinessValidatorDelete.validar({ id }, this.prisma);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.prisma.user.delete({ where: { id } });

    const { password, ...safeUser } = user;

    return safeUser;
  }

  async findUserByPhone(phone: string): Promise<UserResponseDto> {
    if (!UserCreateValidator.rules.phone(phone)) {
      throwBadRequest([UserCreateValidator.messages.phone]);
    }

    const user = await this.prisma.user.findUnique({
      where: { phone },
      include: { addresses: true },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con teléfono ${phone} no existe`);
    }

    const { password, ...safeUser } = user;
    return safeUser;
  }
}
