import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global pipes
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

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL'),
    credentials: true,
  });

  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
