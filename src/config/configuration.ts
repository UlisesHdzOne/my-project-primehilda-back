import { registerAs } from '@nestjs/config';

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
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },

    // ✅ NUEVO: Configuración de notificaciones
    notifications: {
      sendWelcomeEmail: process.env.SEND_WELCOME_EMAIL === 'true',
      sendPasswordOnCreate: process.env.SEND_PASSWORD_ON_CREATE === 'true',
    },
    
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    // ✅ NUEVO: Configuración de paginación por defecto
    pagination: {
      defaultLimit: 10,
      maxLimit: 100,
    },
  };
});
