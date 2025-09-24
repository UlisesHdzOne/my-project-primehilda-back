import { hash, compare } from 'bcrypt';

/**
 * Hashea una contraseña usando bcrypt.
 * @param password Contraseña en texto plano
 * @returns Contraseña hasheada
 */
export const hashPassword = async (password: string): Promise<string> => {
  return hash(password, 10);
};

/**
 * Compara una contraseña en texto plano con su hash.
 * @param password Contraseña en texto plano
 * @param hashedPassword Contraseña hasheada
 * @returns true si coinciden, false si no
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return compare(password, hashedPassword);
};
