import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthValidator {
  constructor(private readonly prisma: PrismaService) {}

  async checkEmailUnique(email: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Email ya registrado');
  }
   // Función para ejecutar todas las validaciones de registro
  async validateRegisterAll(email: string): Promise<void> {
    await this.checkEmailUnique(email);
    // Puedes agregar más reglas aquí
  }

  async validateLogin(email: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Credenciales inválidas');

    return user;
  }
}
