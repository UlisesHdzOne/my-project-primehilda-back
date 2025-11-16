import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';
import { hashPassword } from 'src/utils/auth.utils';
import { UserValidator } from './user.validator';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userValidator: UserValidator,
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    await this.userValidator.validateCreate(dto);
    const hashedPassword = await hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
        lastName: dto.lastName || 'modificar apellido',
      },
    });

    return UserEntity.fromPrisma(user);
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<UserEntity> {
    await this.userValidator.validateUpdate(id, dto);
    const dataToUpdate = { ...dto };
    if (dto.password) dataToUpdate.password = await hashPassword(dto.password);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });
    return UserEntity.fromPrisma(updatedUser);
  }

  async deleteUser(id: number): Promise<UserEntity> {
    await this.userValidator.validateDelete(id);
    const user = await this.prisma.user.delete({ where: { id } });
    return UserEntity.fromPrisma(user);
  }

  ///usuarios y direcciones
  // async getUserById(id: number): Promise<UserEntity> {
  //   await this.userValidator.validateUserExists(id);

  //   const user = await this.prisma.user.findUnique({ where: { id } });
  //   if (!user) {
  //     // Esto debería ser imposible si validateUserExists funciona, pero TS lo requiere
  //     throw new Error('Usuario no encontrado');
  //   }

  //   return UserEntity.fromPrisma(user);
  // }
}
