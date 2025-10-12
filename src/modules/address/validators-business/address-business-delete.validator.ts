import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorHelper, ApiError } from 'src/common/helper/error.helper';
import { ADDRESS_MESSAGES } from 'src/common/constants';
import { AddressRules } from './rules/address.rules';

export interface AddressBusinessDeleteInput {
  id: number;
  userId: number;
}

export const AddressBusinessValidatorDelete = {
  validar: async (dto: AddressBusinessDeleteInput, prisma: PrismaService) => {
    const errors: ApiError[] = [];

    const canDelete = await AddressRules.canDeleteDefault(
      dto.id,
      dto.userId,
      prisma,
    );
    if (!canDelete) {
      errors.push({
        field: 'id',
        message: ADDRESS_MESSAGES.noSePuedeEliminarDefault,
      });
    }

    if (errors.length > 0) {
      ErrorHelper.badRequestException('Validation failed', errors);
    }
  },
};
