import { PrismaService } from 'src/prisma/prisma.service';
import { compare } from 'bcrypt';

export const AuthRules = {
  // Verifica si email ya está registrado
  emailUnique: async (email: string, prisma: PrismaService) => {
    const user = await prisma.user.findUnique({ where: { email } });
    return !user; // true si no existe
  },

  // Valida credenciales
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
