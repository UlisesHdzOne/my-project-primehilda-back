import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { securitySetup } from './config/security.config';
import { AppConfig } from './config/configuration';
import { Request, Response, NextFunction } from 'express'; // <-- IMPORT TIPOS

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  
  // Security configuration
  securitySetup(app, configService);

  // HTTPS redirection in production
  if (configService.get('NODE_ENV') === 'production') {
    app.use((req: Request, res: Response, next: NextFunction) => { // <-- TIPOS
      if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(`https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  // Safe logging (hide credentials)
  const dbUrl = configService.get<string>('DATABASE_URL');
  const safeDbUrl = dbUrl
    ? dbUrl.replace(/(:\/\/)(.*)(@)/, '$1****:****$3')
    : 'not configured';

  logger.log(`🚀 Server running on port ${port}`);
  logger.log(`📀 Environment: ${configService.get('NODE_ENV')}`);
  logger.log(`💾 Database: ${safeDbUrl}`);
}

bootstrap();
