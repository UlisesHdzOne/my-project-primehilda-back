import { throwBadRequest } from 'src/common/helper/error.helper';
import { AUTH_MESSAGES } from 'src/common/constants/index';
import { LoginUserDto } from 'src/modules/auth/dto/login-user.dto';

export const AuthLoginValidator = {
  email: (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),

  password: (password: string): boolean => password.trim().length > 0,

  checkEmail: (email: string): void => {
    if (!AuthLoginValidator.email(email)) {
      throwBadRequest(AUTH_MESSAGES.emailInvalido);
    }
  },

  checkPassword: (password: string): void => {
    if (!AuthLoginValidator.password(password)) {
      throwBadRequest(AUTH_MESSAGES.passwordRequerida);
    }
  },

  validarEntrada: (dto: LoginUserDto): void => {
    AuthLoginValidator.checkEmail(dto.email);
    AuthLoginValidator.checkPassword(dto.password);
  },
};
