import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { securitySetup } from './config/security.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  // Security middlewares (Helmet, CORS, Rate limiting, etc.)
  securitySetup(app, configService);

  if (configService.get('NODE_ENV') === 'production') {
    // 🔒 Usa solo logs críticos
    app.useLogger(['error', 'warn']);
    // 🔒 Si Nest recibe tráfico detrás de un proxy (ej. Heroku, Nginx)
    app.set('trust proxy', 1);
  }

  app.useGlobalFilters(new HttpExceptionFilter());

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  // Safe logging (ocultar credenciales sensibles)
  const dbUrl = configService.get<string>('DATABASE_URL');
  const safeDbUrl = dbUrl
    ? dbUrl.replace(/(:\/\/)(.*)(@)/, '$1****:****$3')
    : 'not configured';

  logger.log(`🚀 Server running on port ${port}`);
  logger.log(`📀 Environment: ${configService.get('NODE_ENV')}`);
  logger.log(`💾 Database: ${safeDbUrl}`);
}

bootstrap();
