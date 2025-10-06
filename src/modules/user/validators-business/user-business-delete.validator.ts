import { PrismaService } from 'src/prisma/prisma.service';
import { throwBadRequest } from 'src/common/helper/error.helper';
import { USER_MESSAGES } from 'src/common/constants';
import { UserRules } from './rules/user.rules';

export interface UserBusinessDeleteInput {
  id: number;
}

export const UserBusinessValidatorDelete = {
  validar: async (dto: UserBusinessDeleteInput, prisma: PrismaService) => {
    const user = await UserRules.existsById(dto.id, prisma);

    if (!user) throwBadRequest([USER_MESSAGES.usuarioNoExiste]);
    return user as NonNullable<typeof user>;
  },
};
