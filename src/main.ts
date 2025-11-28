import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ✅ SOLO ValidationPipe (lo esencial)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: errors => {
        const details = errors.flatMap(err =>
          Object.values(err.constraints || {}).map(message => ({
            field: err.property,
            message,
          })),
        );
        return new BadRequestException({ details });
      },
    }),
  );

  // ✅ CORS básico
  app.enableCors({
    origin: configService.get('app.frontendUrl'),
    credentials: true,
  });

  // ✅ Puerto
  const port = configService.get<number>('app.port') || 3000;

  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch(error => {
  console.error('❌ Error during bootstrap:', error);
  process.exit(1);
});
