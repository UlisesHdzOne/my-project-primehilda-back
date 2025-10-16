import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';
import { hashPassword } from 'src/utils/auth.utils';
import { User } from '@prisma/client';
import { UserValidator } from './user.validator';
import { USER_MESSAGES } from 'src/common/constants';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userValidator: UserValidator,
  ) {}

  private toEntity(user: User): UserEntity {
    return new UserEntity(user);
  }

  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    await this.userValidator.validateCreate(dto);

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
    await this.userValidator.validateUserExists(id);
    const user = await this.prisma.user.findUnique({ where: { id } });
    return this.toEntity(user!);
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<UserEntity> {
    await this.userValidator.validateUpdate(id, dto);
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
    await this.userValidator.validateDelete(id);

    const user = await this.prisma.user.delete({ where: { id } });

    return this.toEntity(user);
  }

  async findUserByPhone(phone: string): Promise<UserEntity> {
    await this.userValidator.validateUserExistsByPhone(phone);
    const user = await this.prisma.user.findUnique({
      where: { phone },
      include: { addresses: true },
    });

    return this.toEntity(user!);
  }
}
