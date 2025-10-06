import { PrismaService } from 'src/prisma/prisma.service';
import { throwBadRequest } from 'src/common/helper/error.helper';
import { ADDRESS_MESSAGES } from 'src/common/constants';
import { AddressRules } from './rules/address.rules';

export interface AddressBusinessDeleteInput {
  id: number;
  userId: number;
}

export const AddressBusinessValidatorDelete = {
  validar: async (dto: AddressBusinessDeleteInput, prisma: PrismaService) => {
    const errors: string[] = [];

    if (!(await AddressRules.hasMoreThanOneAddress(dto.userId, prisma))) {
      errors.push(ADDRESS_MESSAGES.noPuedeEliminarUnicaDireccion);
    }

    if (!(await AddressRules.canDeleteDefault(dto.id, dto.userId, prisma))) {
      errors.push(ADDRESS_MESSAGES.noPuedeEliminarDefaultSinReemplazo);
    }

    if (errors.length > 0) throwBadRequest(errors);
  },
};
