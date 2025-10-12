import { PrismaService } from 'src/prisma/prisma.service';
import { ADDRESS_MESSAGES } from 'src/common/constants';
import { ErrorHelper, ApiError } from 'src/common/helper/error.helper';
import { AddressRules } from './rules/address.rules';

export interface AddressBusinessUpdateInput {
  id: number;
  userId: number;
  name?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export const AddressBusinessValidatorUpdate = {
  validar: async (dto: AddressBusinessUpdateInput, prisma: PrismaService) => {
    const errors: ApiError[] = [];

    if (
      dto.name &&
      !(await AddressRules.nameUniquePerUser(dto.userId, dto.name, prisma))
    ) {
      errors.push({ field: 'name', message: ADDRESS_MESSAGES.nombreDuplicado });
    }

    if (
      dto.isDefault &&
      !(await AddressRules.onlyOneDefault(dto.userId, prisma))
    ) {
      errors.push({
        field: 'isDefault',
        message: ADDRESS_MESSAGES.defaultDuplicado,
      });
    }

    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      if (!AddressRules.notZeroZero(dto.latitude, dto.longitude)) {
        errors.push({
          field: 'latitude,longitude',
          message: ADDRESS_MESSAGES.coordenadaInvalida,
        });
      }

      if (!AddressRules.insideServiceArea(dto.latitude, dto.longitude)) {
        errors.push({
          field: 'latitude,longitude',
          message: ADDRESS_MESSAGES.fueraDeZona,
        });
      }
    }

    if (errors.length > 0) {
      ErrorHelper.badRequestException('Validation failed', errors);
    }
  },
};
