import { hash, compare } from 'bcrypt';

/**
 * Hashea una contraseña usando bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return hash(password, saltRounds);
};

/**
 * Compara una contraseña en texto plano con su hash
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return compare(password, hashedPassword);
};
