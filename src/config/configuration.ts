import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // ================ ENTORNO ================
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3000),

  // ================ POSTGRESQL ================
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
  POSTGRES_PORT: Joi.number().port().default(5432),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql'] })
    .required(),

  // ================ PRISMA ================
  PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK: Joi.number().valid(0, 1).default(0),

  // ================ JWT ================
  JWT_SECRET: Joi.string().min(16).required(), // Reducido a 16 para desarrollo
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // ================ CORS ================
  // Hacer CORS_ORIGIN opcional con buen default
  CORS_ORIGIN: Joi.string().default('http://localhost:5173,http://localhost:8100'),

  // Las otras variables CORS son opcionales
  CORS_METHODS: Joi.string().default('GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'),
  CORS_CREDENTIALS: Joi.boolean().default(true),
  CORS_PREFLIGHT_CONTINUE: Joi.boolean().default(false),
  CORS_OPTIONS_SUCCESS_STATUS: Joi.number().valid(200, 204).default(204),
  CORS_MAX_AGE: Joi.number().min(0).default(86400),

  // ================ APP CONFIG ================
  // FRONTEND_URL puede ser simple string sin validación compleja
  FRONTEND_URL: Joi.string().default('http://localhost:5173'),

  PAGINATION_DEFAULT_LIMIT: Joi.number().min(1).max(100).default(10),
  PAGINATION_MAX_LIMIT: Joi.number().min(10).max(500).default(100),
  SEND_WELCOME_EMAIL: Joi.boolean().default(false),
  SEND_PASSWORD_ON_CREATE: Joi.boolean().default(false),
});

export default registerAs('app', () => {
  // Usar FRONTEND_URL como fallback para CORS_ORIGIN si no está definido
  const corsOrigin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173';

  return {
    // ========== SERVER ==========
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    // ========== DATABASE ==========
    database: {
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      db: process.env.POSTGRES_DB,
      port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432,
      url: process.env.DATABASE_URL,
      prismaDisableAdvisoryLock: process.env.PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK === '1',
    },

    // ========== JWT ==========
    jwt: {
      secret: process.env.JWT_SECRET || 'default_dev_secret_change_in_production',
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },

    // ========== CORS ==========
    cors: {
      origin: corsOrigin === '*' ? corsOrigin : corsOrigin.split(',').map(url => url.trim()),
      methods: (process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
        .split(',')
        .map(method => method.trim()),
      credentials: process.env.CORS_CREDENTIALS === 'true',
      preflightContinue: process.env.CORS_PREFLIGHT_CONTINUE === 'true',
      optionsSuccessStatus: parseInt(process.env.CORS_OPTIONS_SUCCESS_STATUS || '204', 10),
      maxAge: parseInt(process.env.CORS_MAX_AGE || '86400', 10),
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
      exposedHeaders: ['Content-Length', 'Authorization'],
    },

    // ========== APP ==========
    frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:5173')
      .split(',')
      .map(url => url.trim()),

    pagination: {
      defaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT || '10', 10),
      maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT || '100', 10),
    },

    notifications: {
      sendWelcomeEmail: process.env.SEND_WELCOME_EMAIL === 'true',
      sendPasswordOnCreate: process.env.SEND_PASSWORD_ON_CREATE === 'true',
    },
  };
});
