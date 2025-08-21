// src/modules/user/utils/user.validator.ts
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaseUserDto } from '../../user/dto/base-user.dto';
import { LoginUserDto } from 'src/modules/auth/dto/login-user.dto';
import * as bcrypt from 'bcrypt';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function validateRegisterUser(
  dto: BaseUserDto,
  prisma: PrismaService,
) {
  if (!dto.name || !dto.email || !dto.password) {
    throw new BadRequestException('Name, email y password son obligatorios');
  }

  if (!emailRegex.test(dto.email)) {
    throw new BadRequestException('Formato de email inválido');
  }

  if (dto.password.length < 6) {
    throw new BadRequestException(
      'La contraseña debe tener al menos 6 caracteres',
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: dto.email },
  });
  if (existing) {
    throw new BadRequestException('Email ya registrado');
  }
}

export async function validateLoginUser(
  dto: LoginUserDto,
  prisma: PrismaService,
) {
  if (!dto.email || !dto.password) {
    throw new BadRequestException('Email y password son obligatorios');
  }

  if (!emailRegex.test(dto.email)) {
    throw new BadRequestException('Formato de email inválido');
  }

  const user = await prisma.user.findUnique({ 
    where: { email: dto.email } 
  });
  
  if (!user) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  const isValid = await bcrypt.compare(dto.password, user.password);
  if (!isValid) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  return user;
}