import { PrismaService } from 'src/prisma/prisma.service';
import { USER_MESSAGES } from 'src/common/constants';
import { UserRules } from './rules/user.rules';
import { ErrorHelper, ApiError } from 'src/common/helper/error.helper';

export interface UserBusinessUpdateInput {
  id: number;
  email?: string;
  phone?: string;
}

export const UserBusinessValidatorUpdate = {
  validar: async (dto: UserBusinessUpdateInput, prisma: PrismaService) => {
    const errors: ApiError[] = [];

    if (!(await UserRules.emailUniqueUpdate(dto.id, dto.email, prisma))) {
      errors.push({ field: 'email', message: USER_MESSAGES.emailDuplicado });
    }

    if (!(await UserRules.phoneUniqueUpdate(dto.id, dto.phone, prisma))) {
      errors.push({ field: 'phone', message: USER_MESSAGES.telefonoDuplicado });
    }

    if (errors.length > 0) {
      ErrorHelper.badRequestException('Validation failed', errors);
    }
  },
};
