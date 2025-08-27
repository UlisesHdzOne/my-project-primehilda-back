import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from '../dto/register-user.dto';
import { BadRequestException } from '@nestjs/common';
import { LoginUserDto } from '../dto/login-user.dto';

export const validateRegister = async (
  dto: RegisterUserDto,
  prisma: PrismaService,
) => {
  const exists = await prisma.user.findUnique({
    where: {
      email: dto.email,
    },
  });
  if (exists) {
    throw new BadRequestException('The email is already in use');
  }
};

export const validateLogin = async (
  dto: LoginUserDto,
  prisma: PrismaService,
) => {
  const user = await prisma.user.findUnique({
    where: {
      email: dto.email,
    },
  });

  if (!user) {
    throw new BadRequestException('Invalid credentials');
  }

  return user;
};
