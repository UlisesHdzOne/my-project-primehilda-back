import { throwBadRequest } from 'src/common/helper/error.helper';
import { UserCreateValidator } from './user-create.validator';
import { Role } from 'src/common/constants/role.enum';

export interface UserUpdateInput {
  name?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: Role;
}

export const UserUpdateValidator = {
  validarEntrada(dto: Partial<UserUpdateInput>): void {
    const errors: string[] = [];

    const keys: (keyof UserUpdateInput)[] = [
      'name',
      'lastName',
      'email',
      'password',
      'phone',
      'role',
    ];

    for (const key of keys) {
      const value = dto[key];
      if (value !== undefined) {
        if (!UserCreateValidator.rules[key](String(value))) {
          errors.push(UserCreateValidator.messages[key]);
        }
      }
    }

    if (errors.length > 0) {
      throwBadRequest(errors);
    }
  },
};
