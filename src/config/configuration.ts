import { registerAs } from '@nestjs/config';
import * as joi from 'joi';

export const validationSchema = joi.object({
  NODE_ENV: joi.string().valid('development', 'production', 'test').default('development'),
  PORT: joi.number().port().default(3000),
  DATABASE_URL: joi
    .string()
    .uri({ scheme: ['postgresql'] })
    .required()
    .description('URL completa de conexión a PostgreSQL'),
  CORS_ORIGIN: joi
    .string()
    .default('http://localhost:5173')
    .description('Origen permitido para CORS'),
  CATEGORIES_MAX_PER_PAGE: joi
    .number()
    .min(1)
    .max(100)
    .default(50)
    .description('Máximo de categorías por página'),
  CATEGORIES_MAX_BULK_OPERATION: joi
    .number()
    .min(1)
    .max(100)
    .default(20)
    .description('Máximo de categorías para operaciones masivas'),
  CATEGORIES_RESERVED_WORDS: joi
    .string()
    .default('admin,system,root,test,default')
    .description('Palabras reservadas para nombres de categoría (separadas por coma)'),
});

export default registerAs('app', () => {
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

  return {
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    database: {
      url: process.env.DATABASE_URL,
    },
    cors: {
      origin: corsOrigin.includes(',') ? corsOrigin.split(',').map(url => url.trim()) : corsOrigin,
    },
    categories: {
      maxPerPage: parseInt(process.env.CATEGORIES_MAX_PER_PAGE ?? '50', 10),
      maxBulkOperation: parseInt(process.env.CATEGORIES_MAX_BULK_OPERATION ?? '20', 10),
      reservedWords: (process.env.CATEGORIES_RESERVED_WORDS ?? 'admin,system,root,test,default')
        .split(',')
        .map(word => word.trim())
        .filter(word => word.length > 0),
    },
  };
});
