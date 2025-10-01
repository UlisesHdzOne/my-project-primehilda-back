import { PrismaService } from 'src/prisma/prisma.service';
import { throwBadRequest } from 'src/common/helper/error.helper';
import { USER_MESSAGES } from 'src/common/constants';
import { UserRules } from './rules/user.rules';

export interface UserBusinessUpdateInput {
  id: number;
  email?: string;
  phone?: string;
}

export const UserBusinessValidatorUpdate = {
  validar: async (dto: UserBusinessUpdateInput, prisma: PrismaService) => {
    const errors: string[] = [];

    if (!(await UserRules.emailUniqueUpdate(dto.id, dto.email, prisma))) {
      errors.push(USER_MESSAGES.emailDuplicado);
    }
    if (!(await UserRules.phoneUniqueUpdate(dto.id, dto.phone, prisma))) {
      errors.push(USER_MESSAGES.telefonoDuplicado);
    }

    if (errors.length > 0) throwBadRequest(errors);
  },
};
