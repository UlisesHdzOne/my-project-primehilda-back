// AuthBusinessValidatorRegister (UX con múltiples errores)
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRules } from './rules/auth.rules';
import { ErrorHelper, ApiError } from 'src/common/helper/error.helper';
import { AUTH_MESSAGES } from 'src/common/constants';

export interface AuthRegisterInput {
  email: string;
  phone: string;
}

export const AuthBusinessValidatorRegister = {
  validate: async (dto: AuthRegisterInput, prisma: PrismaService) => {
    const errors: ApiError[] = [];

    if (!(await AuthRules.isEmailUnique(dto.email, prisma))) {
      errors.push({ field: 'email', message: AUTH_MESSAGES.emailDuplicado });
    }

    if (!(await AuthRules.isPhoneUnique(dto.phone, prisma))) {
      errors.push({ field: 'phone', message: AUTH_MESSAGES.telefonoDuplicado });
    }

    if (errors.length > 0) {
      ErrorHelper.badRequestException('Validation failed', errors);
    }
  },
};
