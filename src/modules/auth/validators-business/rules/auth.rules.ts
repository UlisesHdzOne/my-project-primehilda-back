import { PrismaService } from 'src/prisma/prisma.service';
import { compare } from 'bcrypt';

export const AuthRules = {
  emailUnique: async (email: string, prisma: PrismaService) => {
    const user = await prisma.user.findUnique({ where: { email } });
    return !user;
  },

  phoneUnique: async (phone: string, prisma: PrismaService) => {
    const user = await prisma.user.findUnique({ where: { phone } });
    return !user;
  },

  validCredentials: async (
    email: string,
    password: string,
    prisma: PrismaService,
  ) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const isMatch = await compare(password, user.password);
    return isMatch ? user : null;
  },
};
