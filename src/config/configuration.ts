import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // ================ LO ESENCIAL ================
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  PORT: Joi.number().port().default(3000),

  // ================ DATABASE (solo URL completa) ================
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql'] })
    .required()
    .description('URL completa de conexión a PostgreSQL'),

  // ================ CORS BÁSICO ================
  CORS_ORIGIN: Joi.string()
    .default('http://localhost:5173')
    .description('Origen permitido para CORS'),
});

export default registerAs('app', () => {
  // Configuración mínima
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

  return {
    // ========== SERVER ==========
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    // ========== DATABASE SIMPLE ==========
    database: {
      url: process.env.DATABASE_URL,
    },

    // ========== CORS SIMPLE ==========
    cors: {
      origin: corsOrigin.includes(',') ? corsOrigin.split(',').map(url => url.trim()) : corsOrigin,
    },
  };
});
