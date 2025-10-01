import { PrismaService } from 'src/prisma/prisma.service';
import { throwBadRequest } from 'src/common/helper/error.helper';
import { Role } from 'src/common/constants/role.enum';
import { USER_MESSAGES } from 'src/common/constants';
import { UserRules } from './rules/user.rules';

export interface UserBusinessCreateInput {
  name: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
}

export const UserBusinessValidatorCreate = {
  validar: async (dto: UserBusinessCreateInput, prisma: PrismaService) => {
    const errors: string[] = [];

    if (!(await UserRules.emailUniqueCreate(dto.email, prisma))) {
      errors.push(USER_MESSAGES.emailDuplicado);
    }
    if (!(await UserRules.phoneUniqueCreate(dto.phone, prisma))) {
      errors.push(USER_MESSAGES.telefonoDuplicado);
    }

    if (errors.length > 0) throwBadRequest(errors);
  },
};
