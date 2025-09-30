// src/validators/auth-login.validator.ts
import { AUTH_MESSAGES } from 'src/common/constants/index';
import { throwBadRequest } from 'src/common/helper/error.helper';
import { LoginUserDto } from 'src/modules/auth/dto/login-user.dto';

export const AuthLoginValidator = {
  email: (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),

  password: (password: string): boolean => password.trim().length > 0,

  validarEntrada: (dto: LoginUserDto): void => {
    const errors: string[] = [];

    if (!AuthLoginValidator.email(dto.email)) {
      errors.push(AUTH_MESSAGES.emailInvalido);
    }

    if (!AuthLoginValidator.password(dto.password)) {
      errors.push(AUTH_MESSAGES.passwordRequerida);
    }

    if (errors.length > 0) throwBadRequest(errors);
  },
};
