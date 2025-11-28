import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  SEND_WELCOME_EMAIL: Joi.boolean().default(false),
  SEND_PASSWORD_ON_CREATE: Joi.boolean().default(false),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  PAGINATION_DEFAULT_LIMIT: Joi.number().default(10),
  PAGINATION_MAX_LIMIT: Joi.number().default(100),
});

// 👇 AQUI es lo importante
export default registerAs('app', () => ({
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

  notifications: {
    sendWelcomeEmail: process.env.SEND_WELCOME_EMAIL === 'true',
    sendPasswordOnCreate: process.env.SEND_PASSWORD_ON_CREATE === 'true',
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
}));
