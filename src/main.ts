import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService); 

  const port = configService.get<number>('PORT');
  if (!port) throw new Error('PORT no definido');

  await app.listen(port);
}
bootstrap();