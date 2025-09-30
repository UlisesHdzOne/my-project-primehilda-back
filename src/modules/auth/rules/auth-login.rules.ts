// src/rules/auth-login.rules.ts
import { PrismaService } from 'src/prisma/prisma.service';
import { throwBadRequest } from 'src/common/helper/error.helper';
import { comparePassword } from 'src/utils/auth.utils';
import { AUTH_MESSAGES } from 'src/common/constants/index';
import { LoginUserDto } from '../dto/login-user.dto';
import { User } from '@prisma/client';

export const AuthBusinessValidatorLogin = {
  /**
   * Valida las reglas de negocio para login
   */
  validar: async (dto: LoginUserDto, prisma: PrismaService): Promise<User> => {
    const errors: string[] = [];
    const { email, password } = dto;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) errors.push(AUTH_MESSAGES.usuarioNoExiste);

    if (user && !(await comparePassword(password, user.password))) {
      errors.push(AUTH_MESSAGES.passwordIncorrecta);
    }

    if (errors.length > 0) throwBadRequest(errors);

    return user!;
  },
};
