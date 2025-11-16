import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar validaciones automáticas en todos los DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
      validationError: { target: false },
      exceptionFactory: (errors) => {
        // En lugar de unir los mensajes, creamos un detalle por cada constraint
        const details = errors.flatMap((err) => {
          // Para cada error (err) en una propiedad, tomamos cada constraint y la mapeamos a un objeto
          const constraints = err.constraints
            ? Object.values(err.constraints)
            : [];
          return constraints.map((message) => ({
            field: err.property,
            message,
          }));
        });

        return new BadRequestException({
          message: details.map((d) => d.message),
          error: 'Bad Request',
          statusCode: 400,
          details,
        });
      },
    }),
  );
  // Interceptors y Filters globales
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Parseo de cookies
  app.use(cookieParser());

  // Traemos ConfigService
  const configService = app.get(ConfigService);

  // Habilitar CORS de manera segura
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  if (!frontendUrl) {
    throw new Error('FRONTEND_URL no definido en el .env');
  }

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  });

  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error('Error al iniciar el servidor:', error);
});
