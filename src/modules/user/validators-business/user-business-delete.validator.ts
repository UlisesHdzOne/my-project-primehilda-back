import { PrismaService } from 'src/prisma/prisma.service';
import { USER_MESSAGES } from 'src/common/constants';
import { UserRules } from './rules/user.rules';
import { ErrorHelper } from 'src/common/helper/error.helper';

export interface UserBusinessDeleteInput {
  id: number;
}

export const UserBusinessValidatorDelete = {
  validar: async (dto: UserBusinessDeleteInput, prisma: PrismaService) => {
    const user = await UserRules.existsById(dto.id, prisma);

    if (!user) ErrorHelper.notFoundException(USER_MESSAGES.usuarioNoExiste);
    return user;
  },
};
