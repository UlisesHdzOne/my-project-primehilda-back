// src/config/security.setup.ts
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors = require('cors');

export const securitySetup = (app: INestApplication, config: ConfigService): void => {
  const nodeEnv = config.get<string>('NODE_ENV');

  // =========================
  // Helmet para cabeceras de seguridad
  // =========================
  app.use(
    helmet({
      contentSecurityPolicy:
        nodeEnv === 'production'
          ? { directives: { defaultSrc: ["'self'"] } }
          : false,
      hsts: config.get<boolean>('HELMET_HSTS_ENABLED', true),
    }),
  );

  // =========================
  // CORS
  // =========================
  const allowedOrigin = nodeEnv === 'production'
    ? [/\.yourdomain\.com$/]
    : '*';

  app.use(
    cors({
      origin: allowedOrigin,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }),
  );

  // =========================
  // Rate Limiting
  // =========================
  const maxRequests = config.get<number>('RATE_LIMIT_MAX', 100);

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: maxRequests,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
};
