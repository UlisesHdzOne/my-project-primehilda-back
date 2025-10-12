import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';
import { UserBusinessValidatorCreate } from '../validators-business/user-business-create.validator';
import { UserBusinessValidatorUpdate } from '../validators-business/user-business-update.validator';
import { UserBusinessValidatorDelete } from '../validators-business/user-business-delete.validator';
import { hashPassword } from 'src/utils/auth.utils';
import { ErrorHelper } from 'src/common/helper/error.helper';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(user: User): UserEntity {
    return new UserEntity(user);
  }

  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    await UserBusinessValidatorCreate.validar(dto, this.prisma);

    const hashedPassword = await hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: { ...dto, password: hashedPassword },
    });

    return this.toEntity(user);
  }

  async getUsers(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany();

    return users.map((user) => this.toEntity(user));
  }

  async getUserById(id: number): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) ErrorHelper.notFoundException('Usuario no encontrado');
    return this.toEntity(user);
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<UserEntity> {
    await UserBusinessValidatorUpdate.validar({ id, ...dto }, this.prisma);

    const dataToUpdate = { ...dto };
    if (dto.password) {
      dataToUpdate.password = await hashPassword(dto.password);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return this.toEntity(updatedUser);
  }

  async deleteUser(id: number): Promise<UserEntity> {
    const user = await UserBusinessValidatorDelete.validar({ id }, this.prisma);
    if (!user) ErrorHelper.notFoundException('Usuario no encontrado');

    await this.prisma.user.delete({ where: { id } });

    return this.toEntity(user);
  }

  async findUserByPhone(phone: string): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { phone },
      include: { addresses: true },
    });

    if (!user)
      ErrorHelper.notFoundException(`Usuario con teléfono ${phone} no existe`);

    return this.toEntity(user);
  }
}
