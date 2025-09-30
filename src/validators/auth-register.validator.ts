// src/validators/auth-register.validator.ts
import { AUTH_MESSAGES } from 'src/common/constants/index';
import { throwBadRequest } from 'src/common/helper/error.helper';
import { RegisterUserDto } from 'src/modules/auth/dto/register-user.dto';

export const AuthRegisterValidator = {
  name: (name: string): boolean => name.trim().length >= 2,
  email: (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  password: (password: string): boolean => password.length >= 8,
  phone: (phone: string) => /^\d{10,15}$/.test(phone.trim()),

  validarEntradaRegister: (dto: RegisterUserDto): void => {
    const errors: string[] = [];

    if (!AuthRegisterValidator.name(dto.name)) {
      errors.push(AUTH_MESSAGES.nombreInvalido);
    }

    if (!AuthRegisterValidator.email(dto.email)) {
      errors.push(AUTH_MESSAGES.emailInvalido);
    }

    if (!AuthRegisterValidator.password(dto.password)) {
      errors.push(AUTH_MESSAGES.passwordDebil);
    }

    const phone = dto.phone?.trim() || '';
    if (!phone || !/^\d{10,15}$/.test(phone)) {
      errors.push(AUTH_MESSAGES.telefonoInvalido);
    }

    if (errors.length > 0) throwBadRequest(errors);
  },
};
