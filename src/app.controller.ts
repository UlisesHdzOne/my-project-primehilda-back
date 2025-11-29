import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): { message: string } {
    return { message: 'Hello World!' };
  }

  @Get('health')
  async getHealth() {
    let dbStatus = 'unknown';

    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      dbStatus = 'healthy';
    } catch {
      dbStatus = 'unhealthy';
    }

    const memory = this.getMemoryUsage();

    return {
      status: dbStatus === 'healthy' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      environment: this.configService.get('app.nodeEnv'),
      port: this.configService.get('app.port'),
      services: {
        database: dbStatus,
      },
      system: {
        memory,
      },
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

  private getMemoryUsage() {
    const { rss, heapUsed, heapTotal } = process.memoryUsage();
    return { rss, heapUsed, heapTotal };
  }
}
