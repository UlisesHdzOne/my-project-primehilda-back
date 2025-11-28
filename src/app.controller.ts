import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService
  ) {}

  @Get()
  getHello(): { message: string } {
    return { message: this.appService.getHello() };
  }

  @Get('health')
  async getHealth() {
    let databaseStatus = 'unknown';

    try {
      await this.prismaService.$queryRaw`SELECT 1`; // ← usar la instancia inyectada
      databaseStatus = 'connected';
    } catch {
      databaseStatus = 'disconnected';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || '3000',
      database: databaseStatus,
      uptime: process.uptime(),
    };
  }
  @Get('test')
  getTestData() {
    return {
      users: [
        { id: 1, name: 'Test User 1', email: 'test1@example.com' },
        { id: 2, name: 'Test User 2', email: 'test2@example.com' },
      ],
      total: 2,
      message: 'Datos de prueba',
    };
  }
}
