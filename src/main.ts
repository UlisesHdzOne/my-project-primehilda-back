import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: errors => {
        const details = errors.map(err => ({
          field: err.property,
          message: Object.values(err.constraints ?? {}).join(', '),
        }));

        return new BadRequestException({
          statusCode: 400,
          message: 'Validation Error',
          error: 'Bad Request',
          details,
        });
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  const corsOrigin = configService.get<Array<string> | string>('app.cors.origin') ?? [
    'http://localhost:5173',
    'http://localhost:8100',
  ];

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  const corsOriginString = Array.isArray(corsOrigin) ? corsOrigin.join(', ') : String(corsOrigin);
  logger.log(`✅ CORS configurado para: ${corsOriginString}`);

  const port = configService.get<number>('app.port') ?? 3000;

  await app.listen(port);

  logger.log(`🚀 Servidor iniciado en: http://localhost:${String(port)}/api`);
  const nodeEnv = configService.get<string>('app.nodeEnv') ?? 'development';
  logger.log(`🌍 Ambiente: ${nodeEnv}`);
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  const errorMessage = error instanceof Error ? error.message : String(error);
  logger.error('❌ Error durante el inicio:', errorMessage);
  process.exit(1);
});
