import { registerAs } from "@nestjs/config";

export default registerAs('app', () => {
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está definida en .env');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está definida en .env');
  }

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    database: {
      url: process.env.DATABASE_URL,
    },

    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },

    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  };
});
