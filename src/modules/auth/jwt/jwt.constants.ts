export const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET no está definida en el .env');

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
