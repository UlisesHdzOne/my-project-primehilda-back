import { PrismaService } from 'src/prisma/prisma.service';
import { throwBadRequest } from 'src/common/helper/error.helper';
import { AuthRules } from './rules/auth.rules';
import { AUTH_MESSAGES } from 'src/common/constants';
import { LoginUserDto } from '../dto/login-user.dto';

export const AuthBusinessValidatorLogin = {
  validar: async (dto: LoginUserDto, prisma: PrismaService) => {
    const user = await AuthRules.validCredentials(
      dto.email,
      dto.password,
      prisma,
    );

    if (!user) throwBadRequest([AUTH_MESSAGES.credencialesInvalidas]);

    return user as NonNullable<typeof user>;
  },
};
