import { PrismaService } from 'src/prisma/prisma.service';
import { compare } from 'bcrypt';
import { UserEntity } from '../../entities/user.entity';

export const AuthRules = {
  async isEmailUnique(email: string, prisma: PrismaService): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email } });
    return !user;
  },

  async isPhoneUnique(phone: string, prisma: PrismaService): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { phone } });
    return !user;
  },

  async validateCredentials(
    email: string,
    password: string,
    prisma: PrismaService,
  ): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const isMatch = await compare(password, user.password);
    if (!isMatch) return null;

    // Convertimos a UserEntity agregando fullName
    return new UserEntity(user);
  },
};
