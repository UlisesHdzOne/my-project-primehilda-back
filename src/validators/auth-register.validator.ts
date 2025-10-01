import { throwBadRequest } from 'src/common/helper/error.helper';
import { UserCreateValidator } from './user-create.validator';

export interface RegisterInput {
  name: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export const AuthRegisterValidator = {
  validarEntrada(dto: RegisterInput): void {
    const errors: string[] = [];

    // Reutilizamos las reglas de UserCreateValidator, excepto role
    const keys: (keyof RegisterInput)[] = [
      'name',
      'lastName',
      'email',
      'password',
      'phone',
    ];

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
