import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaseUserDto } from '../../user/dto/base-user.dto';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function validateUser(dto: BaseUserDto, prisma: PrismaService) {
  // Validar campos obligatorios
  if (!dto.name || !dto.email || !dto.password) {
    throw new BadRequestException('Name, email y password son obligatorios');
  }

  // Validar formato de email
  if (!emailRegex.test(dto.email)) {
    throw new BadRequestException('Formato de email inválido');
  }

  // Validar longitud mínima de contraseña
  if (dto.password.length < 6) {
    throw new BadRequestException(
      'La contraseña debe tener al menos 6 caracteres',
    );
  }

  // Verificar si el email ya existe
  const existing = await prisma.user.findUnique({
    where: { email: dto.email },
  });
  if (existing) {
    throw new BadRequestException('Email ya registrado');
  }
}
