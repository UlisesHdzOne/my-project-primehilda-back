// src/app.service.ts - VERSIÓN CORREGIDA
import { Injectable } from '@nestjs/common';
import { AppLogger } from './core/logger/winston.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private readonly logger = new AppLogger(AppService.name);

  constructor(private readonly configService: ConfigService) {}

  getHello(): string {
    const port = this.configService.get('app.port');
    const nodeEnv = this.configService.get('app.nodeEnv');

    this.logger.log('AppService.getHello ejecutado', {
      port,
      environment: nodeEnv,
      timestamp: new Date().toISOString(),
    });

    // ✅ Devolver solo string, sin objetos
    return `¡Hola! El servidor está funcionando correctamente 🚀 (Env: ${nodeEnv}, Port: ${port})`;
  }
}
