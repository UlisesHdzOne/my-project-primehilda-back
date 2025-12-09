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

  // ================ CATEGORIES CONFIG ================
  CATEGORIES_MAX_PER_PAGE: Joi.number()
    .min(1)
    .max(100)
    .default(50)
    .description('Máximo de categorías por página'),

  CATEGORIES_MAX_BULK_OPERATION: Joi.number()
    .min(1)
    .max(100)
    .default(20)
    .description('Máximo de categorías para operaciones masivas'),

  CATEGORIES_RESERVED_WORDS: Joi.string()
    .default('admin,system,root,test,default')
    .description('Palabras reservadas para nombres de categoría (separadas por coma)'),
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

    // ========== CATEGORIES CONFIG ==========
    categories: {
      maxPerPage: parseInt(process.env.CATEGORIES_MAX_PER_PAGE || '50', 10),
      maxBulkOperation: parseInt(process.env.CATEGORIES_MAX_BULK_OPERATION || '20', 10),
      reservedWords: (process.env.CATEGORIES_RESERVED_WORDS || 'admin,system,root,test,default')
        .split(',')
        .map(word => word.trim())
        .filter(word => word.length > 0),
    },
  };
});
