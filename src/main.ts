import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './config/configuration';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Obtener configuración validada
    const appConfig = configService.get<AppConfig>('app');
    
    if (!appConfig) {
      throw new Error('Configuración "app" no encontrada');
    }

    // Verificación final de valores críticos
    if (!appConfig.databaseUrl) {
      throw new Error('DATABASE_URL no configurada');
    }

    await app.listen(appConfig.port);

    logger.log('🚀 Aplicación iniciada correctamente');
    logger.log(`├─ Entorno: ${appConfig.nodeEnv}`);
    logger.log(`├─ Puerto: ${appConfig.port}`);
    logger.log(`└─ Base de datos: ${appConfig.databaseUrl.split('@')[1] || appConfig.databaseUrl}`);
    
  } catch (error: unknown) {
    const errorLogger = new Logger('BootstrapError');
    
    if (error instanceof Error) {
      errorLogger.error(`❌ ${error.message}`);
      
      if (error.stack) {
        errorLogger.verbose(error.stack);
      }
    } else {
      errorLogger.error('Error desconocido durante el inicio');
    }
    
    process.exit(1);
  }
}

bootstrap();