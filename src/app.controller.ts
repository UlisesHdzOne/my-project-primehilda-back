import { Controller, Get } from '@nestjs/common';
import { AppLogger } from './core/logger/winston.config';
import { ConfigService } from '@nestjs/config';

interface HelloResponse {
  message: string;
  environment?: string;
}

@Controller()
export class AppController {
  private readonly logger = new AppLogger(AppController.name);

  constructor(private readonly configService: ConfigService) {}

  @Get()
  getHello(): HelloResponse {
    const nodeEnv = this.configService.get('app.nodeEnv');
    this.logger.log('Endpoint raíz accedido', { environment: nodeEnv });

    const response: HelloResponse = {
      message: 'API-Lista!',
    };

    if (nodeEnv === 'development') {
      response.environment = nodeEnv;
    }

    return response;
  }

  @Get('health')
  getHealth() {
    // ← Quitado 'async'
    try {
      const dbUrl = this.configService.get('app.database.url');
      const isDev = this.configService.get('app.nodeEnv') === 'development';

      this.logger.debug('Health check ejecutado', {
        database: dbUrl ? 'configured' : 'missing',
        isDevelopment: isDev,
      });

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'API',
        environment: this.configService.get('app.nodeEnv'),
        port: this.configService.get('app.port'),
      };
    } catch (error) {
      this.logger.error('Health check falló', error as Error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      };
    }
  }

  @Get('practice')
  practice() {
    // ← Quitado 'async'
    this.logger.log('Endpoint de práctica ejecutado', {
      timestamp: new Date().toISOString(),
    });

    const corsOrigin = this.configService.get('app.cors.origin');
    const nodeEnv = this.configService.get('app.nodeEnv');

    return {
      message: '¡Listo para practicar',
      environment: nodeEnv,
      corsEnabledFor: corsOrigin,
      next_steps: ['1. Crear módulo 1', '2. Crear módulo 2', '3. Crear módulo 3', '4. Practicar 4'],
    };
  }
}
