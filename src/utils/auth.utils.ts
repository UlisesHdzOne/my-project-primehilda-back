import { hash, compare } from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

export const hashPassword = async (password: string): Promise<string> => {
  return hash(password, 10);
};

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return compare(password, hash);
};

export const checkUserEmailUnique = async (
  email: string,
  prisma: PrismaService,
): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    throw new BadRequestException('The email address is already registered.');
  }
};

export const checkUserExistsByEmail = async (
  email: string,
  prisma: PrismaService,
) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new BadRequestException('The email address is already registered.');
  }
  return user;
};
