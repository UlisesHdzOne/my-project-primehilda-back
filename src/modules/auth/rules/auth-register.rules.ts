// src/rules/auth-register.rules.ts
import { RegisterUserDto } from '../dto/register-user.dto';
import { AUTH_MESSAGES } from 'src/common/constants/index';
import { PrismaService } from 'src/prisma/prisma.service';
import { throwBadRequest } from 'src/common/helper/error.helper';

export const AuthBusinessValidatorRegister = {
  validar: async (
    dto: RegisterUserDto,
    prisma: PrismaService,
  ): Promise<void> => {
    const errors: string[] = [];

    const existingEmail = await prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) errors.push(AUTH_MESSAGES.emailDuplicado);

    if (!dto.phone?.trim() || !/^\d{10,15}$/.test(dto.phone)) {
      errors.push(AUTH_MESSAGES.telefonoInvalido);
    } else {
      const existingPhone = await prisma.user.findUnique({
        where: { phone: dto.phone },
      });
      if (existingPhone) errors.push(AUTH_MESSAGES.telefonoDuplicado);
    }

    if (errors.length > 0) throwBadRequest(errors);
  },
};
