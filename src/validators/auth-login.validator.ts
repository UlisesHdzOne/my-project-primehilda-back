import { throwBadRequest } from 'src/common/helper/error.helper';
import { UserCreateValidator } from './user-create.validator';

export interface LoginInput {
  email: string;
  password: string;
}

export const AuthLoginValidator = {
  validarEntrada(dto: LoginInput): void {
    const errors: string[] = [];

    const keys: (keyof LoginInput)[] = ['email', 'password'];

    for (const key of keys) {
      const value = dto[key];

      if (!value) {
        errors.push(UserCreateValidator.messages[key]);
        continue;
      }

      if (!UserCreateValidator.rules[key](String(value))) {
        errors.push(UserCreateValidator.messages[key]);
      }
    }

    if (errors.length > 0) {
      throwBadRequest(errors);
    }
  },
};
