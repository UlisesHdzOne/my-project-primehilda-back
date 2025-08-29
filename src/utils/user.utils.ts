import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

/**
 * Valida que un email no esté siendo usado por otro usuario distinto.
 * @param email - Email que se quiere asignar.
 * @param prisma - Instancia de PrismaService.
 * @param id? - (Opcional) ID del usuario actual para excluirlo de la validación.
 * @throws BadRequestException si el email ya pertenece a otro usuario.
 */
export const validateEmailUnique = async (
  email: string,
  prisma: PrismaService,
  id?: number,
) => {
  const exists = await prisma.user.findUnique({ where: { email } });

  // Si el email ya existe en otro usuario distinto
  if (exists && exists.id !== id) {
    throw new BadRequestException('The email is already in use by another user');
  }
};

/**
 * Valida que un usuario exista en la base de datos por su ID.
 * @param id - ID del usuario a validar.
 * @param prisma - Instancia de PrismaService.
 * @returns El usuario encontrado.
 * @throws BadRequestException si el usuario no existe.
 */
export const validateUserExists = async (id: number, prisma: PrismaService) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new NotFoundException(`User with id ${id} does not exist`);
  }

  return user;
};