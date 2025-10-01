import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
