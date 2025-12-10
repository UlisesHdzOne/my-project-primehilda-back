// src/main.ts - CORREGIR
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Configurar global prefix
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: errors => {
        const details = errors.map(err => ({
          field: err.property,
          message: Object.values(err.constraints || {}).join(', '),
        }));

        // ✅ Estructura que GlobalExceptionFilter espera para HttpException
        return new BadRequestException({
          message: 'Validation Error', // ← 'message' en lugar de 'error'
          error: 'Bad Request', // ← 'error' opcional
          statusCode: 400, // ← 'statusCode' opcional
          details: details, // ← Esto será extraído por extractHttpExceptionDetails
        });
      },
    }),
  );

  // Configurar Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Configurar CORS
  const corsOrigin = configService.get('app.cors.origin') || [
    'http://localhost:5173',
    'http://localhost:8100',
  ];

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  logger.log(
    `✅ CORS configurado para: ${Array.isArray(corsOrigin) ? corsOrigin.join(', ') : corsOrigin}`,
  );

  // Obtener puerto
  const port = configService.get<number>('app.port') || 3000;

  await app.listen(port);

  // Log de información
  logger.log(`🚀 Servidor iniciado en: http://localhost:${port}/api`);
  logger.log(`🌍 Ambiente: ${configService.get('app.nodeEnv')}`);
}

bootstrap().catch(error => {
  const logger = new Logger('Bootstrap');
  logger.error('❌ Error durante el inicio:', error);
  process.exit(1);
});
