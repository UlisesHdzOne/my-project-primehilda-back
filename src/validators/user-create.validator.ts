import { AUTH_MESSAGES } from 'src/common/constants/index';
import { throwBadRequest } from 'src/common/helper/error.helper';
import { Role } from 'src/common/constants/role.enum';

export interface UserInput {
  name: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
}

export const UserCreateValidator = {
  rules: {
    name: (val: string) => !!val && val.trim().length >= 2,
    lastName: (val: string) => !!val && val.trim().length >= 2,
    email: (val: string) => !!val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    password: (val: string) => !!val && val.length >= 8,
    phone: (val: string) => !!val && /^\d{10,15}$/.test(val.trim()),
    role: (val: any) => Object.values(Role).includes(val as Role),
  },

  messages: {
    name: AUTH_MESSAGES.nombreInvalido,
    lastName: AUTH_MESSAGES.apellidoInvalido,
    email: AUTH_MESSAGES.emailInvalido,
    password: AUTH_MESSAGES.passwordDebil,
    phone: AUTH_MESSAGES.telefonoInvalido,
    role: AUTH_MESSAGES.rolInvalido,
  },

  validarEntrada(dto: UserInput): void {
    const errors: string[] = [];

    for (const key of Object.keys(
      UserCreateValidator.rules,
    ) as (keyof UserInput)[]) {
      const value = dto[key];

      if (!value) {
        errors.push(UserCreateValidator.messages[key]);
        continue;
      }

      if (!UserCreateValidator.rules[key](value)) {
        errors.push(UserCreateValidator.messages[key]);
      }
    }

    if (errors.length > 0) {
      throwBadRequest(errors);
    }
  },
};
