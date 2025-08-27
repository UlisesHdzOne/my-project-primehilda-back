import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

/**
 * Verifica que un correo electrónico no esté registrado antes de crear un nuevo usuario.
 * @param email - Email del usuario que se intenta registrar
 * @param prisma - Instancia de PrismaService
 * @throws BadRequestException si el email ya existe en la base de datos
 */
export const checkUserEmailUnique = async (
  email: string,
  prisma: PrismaService,
) => {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    throw new BadRequestException('The email is already in use');
  }
};

/**
 * Verifica que un usuario exista con el email dado para iniciar sesión.
 * @param email - Email del usuario que intenta iniciar sesión
 * @param prisma - Instancia de PrismaService
 * @returns El usuario encontrado
 * @throws BadRequestException si el email no existe en la base de datos
 */
export const checkUserExistsByEmail = async (
  email: string,
  prisma: PrismaService,
) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new BadRequestException('Invalid credentials');
  }
  return user;
};
