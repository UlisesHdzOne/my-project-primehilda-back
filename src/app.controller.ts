import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { AppLogger } from './common/logger/winston.config';

@Controller()
export class AppController {
  private readonly logger = new AppLogger(AppController.name);

  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  getHello(): { message: string } {
    return { message: 'API de Biblioteca - Lista para practicar relaciones!' };
  }

  @Get('health')
  async getHealth() {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Biblioteca API',
        database: 'connected',
      };
    } catch {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      };
    }
  }

  @Get('practice')
  async practice() {
    this.logger.log('Endpoint de práctica ejecutado');
    return {
      message: '¡Listo para practicar relaciones 1:1, 1:N, N:M!',
      next_steps: [
        '1. Crear módulo "libros"',
        '2. Crear módulo "usuarios"',
        '3. Crear módulo "préstamos" (relaciones)',
        '4. Practicar consultas con include, where, select',
      ],
    };
  }
}
