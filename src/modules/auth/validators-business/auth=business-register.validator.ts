import { PrismaService } from 'src/prisma/prisma.service';
import { throwBadRequest } from 'src/common/helper/error.helper';
import { AuthRules } from './rules/auth.rules';
import { AUTH_MESSAGES } from 'src/common/constants';

export interface AuthBusinessRegisterInput {
  email: string;
  password: string;
  phone: string;
}

export const AuthBusinessValidatorRegister = {
  validar: async (dto: AuthBusinessRegisterInput, prisma: PrismaService) => {
    const errors: string[] = [];

    if (!(await AuthRules.emailUnique(dto.email, prisma))) {
      errors.push(AUTH_MESSAGES.emailDuplicado);
    }

    if (errors.length > 0) throwBadRequest(errors);
  },
};
