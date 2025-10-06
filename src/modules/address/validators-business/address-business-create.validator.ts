import { PrismaService } from 'src/prisma/prisma.service';
import { throwBadRequest } from 'src/common/helper/error.helper';
import { ADDRESS_MESSAGES } from 'src/common/constants';
import { AddressRules } from './rules/address.rules';

export interface AddressBusinessCreateInput {
  userId: number;
  name: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export const AddressBusinessValidatorCreate = {
  validar: async (dto: AddressBusinessCreateInput, prisma: PrismaService) => {
    const errors: string[] = [];

    if (!(await AddressRules.nameUniquePerUser(dto.userId, dto.name, prisma))) {
      errors.push(ADDRESS_MESSAGES.nombreDuplicado);
    }

    if (
      dto.isDefault &&
      !(await AddressRules.onlyOneDefault(dto.userId, prisma))
    ) {
      errors.push(ADDRESS_MESSAGES.defaultDuplicado);
    }
    if (!AddressRules.notZeroZero(dto.latitude, dto.longitude)) {
      errors.push(ADDRESS_MESSAGES.coordenadaInvalida);
    }
    // if (!AddressRules.insideMexico(dto.latitude, dto.longitude)) {
    //   errors.push(ADDRESS_MESSAGES.fueraDeZona);
    // }
    if (!AddressRules.insideServiceArea(dto.latitude, dto.longitude)) {
      errors.push(ADDRESS_MESSAGES.fueraDeZona);
    }

    if (errors.length > 0) throwBadRequest(errors);
  },
};
