// src/modules/user/utils/user.validator.ts
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaseUserDto } from '../../user/dto/base-user.dto';
import { LoginUserDto } from 'src/modules/auth/dto/login-user.dto';
import * as bcrypt from 'bcrypt';


export async function validateRegisterUser(
  dto: BaseUserDto,
  prisma: PrismaService,
) {

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