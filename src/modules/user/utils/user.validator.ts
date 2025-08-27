import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * Valida que un email no esté siendo usado por otro usuario distinto
 * @param id - ID del usuario que se está actualizando
 * @param email - Email que se quiere asignar
 * @param prisma - Instancia de PrismaService
 * @throws BadRequestException si el email ya pertenece a otro usuario
 */
export const validateEmailUpdate = async (
  id: number,
  email: string,
  prisma: PrismaService,
) => {
  const exists = await prisma.user.findUnique({ where: { email } });

  // Si el email ya existe en otro usuario distinto
  if (exists && exists.id !== id) {
    throw new BadRequestException(
      'The email is already in use by another user',
    );
  }
};

/**
 * Valida que un usuario exista en la base de datos por su ID
 * @param id - ID del usuario a validar
 * @param prisma - Instancia de PrismaService
 * @returns El usuario encontrado
 * @throws BadRequestException si el usuario no existe
 */
export const validateUserExists = async (id: number, prisma: PrismaService) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new BadRequestException(`User with id ${id} does not exist`);
  }

  return user;
};

/**
 * Valida que un email no esté siendo usado por otro usuario al crear un nuevo usuario.
 * @param email - Email que se quiere asignar al nuevo usuario
 * @param prisma - Instancia de PrismaService
 * @throws BadRequestException si el email ya está registrado
 */
export const validateUserEmailUnique = async (
  email: string,
  prisma: PrismaService,
) => {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new BadRequestException('Email already in use');
};
