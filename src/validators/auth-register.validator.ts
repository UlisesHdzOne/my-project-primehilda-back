import { AUTH_MESSAGES } from 'src/common/constants/index';
import { throwBadRequest } from 'src/common/helper/error.helper';
import { RegisterUserDto } from 'src/modules/auth/dto/register-user.dto';

/**
 * Objeto que agrupa todas las validaciones puras del registro de usuario.
 * No dependen de la base de datos, solo de los datos de entrada.
 */
export const AuthRegisterValidator = {
  // Validaciones individuales
  name: (name: string): boolean => name.trim().length >= 2, // mínimo 2 caracteres
  email: (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), // formato válido
  password: (password: string): boolean => password.length >= 8, // mínimo 8 caracteres
  phone: (phone: string): boolean => /^\d{10,15}$/.test(phone), // solo números entre 10 y 15 dígitos

  // Funciones que lanzan errores si la validación falla
  checkName: (name: string): void => {
    if (!AuthRegisterValidator.name(name)) {
      throwBadRequest(AUTH_MESSAGES.nombreInvalido);
    }
  },
  checkEmail: (email: string): void => {
    if (!AuthRegisterValidator.email(email)) {
      throwBadRequest(AUTH_MESSAGES.emailInvalido);
    }
  },
  checkPassword: (password: string): void => {
    if (!AuthRegisterValidator.password(password)) {
      throwBadRequest(AUTH_MESSAGES.passwordDebil);
    }
  },
  checkPhone: (phone: string): void => {
    if (!AuthRegisterValidator.phone(phone)) {
      throwBadRequest(AUTH_MESSAGES.telefonoInvalido);
    }
  },

  /**
   * Orquestador principal de validaciones puras.
   * Se llama en el AuthService antes de validaciones de DB.
   */
  validarEntradaRegister: (dto: RegisterUserDto): void => {
    AuthRegisterValidator.checkName(dto.name);
    AuthRegisterValidator.checkEmail(dto.email);
    AuthRegisterValidator.checkPassword(dto.password);
    if (dto.phone) {
      AuthRegisterValidator.checkPhone(dto.phone);
    }
  },
};
