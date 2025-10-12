import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from 'src/common/constants/role.enum';
import { USER_MESSAGES } from 'src/common/constants';
import { UserRules } from './rules/user.rules';
import { ErrorHelper, ApiError } from 'src/common/helper/error.helper';

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
    const errors: ApiError[] = [];

    // Validar email único
    if (!(await UserRules.emailUniqueCreate(dto.email, prisma))) {
      errors.push({ field: 'email', message: USER_MESSAGES.emailDuplicado });
    }

    // Validar teléfono único
    if (!(await UserRules.phoneUniqueCreate(dto.phone, prisma))) {
      errors.push({ field: 'phone', message: USER_MESSAGES.telefonoDuplicado });
    }

    // Validar longitud mínima de campos obligatorios
    if (!dto.name || dto.name.trim().length < 3) {
      errors.push({
        field: 'name',
        message: 'El nombre debe tener al menos 3 caracteres.',
      });
    }

    if (!dto.password || dto.password.length < 6) {
      errors.push({
        field: 'password',
        message: 'La contraseña debe tener al menos 6 caracteres.',
      });
    }

    if (errors.length > 0) {
      ErrorHelper.badRequestException(
        'Validación de formulario fallida',
        errors,
      );
    }
  },
};
