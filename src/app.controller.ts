import { Controller, Get, Res, Req, Headers, Logger } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

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
      cors: {
        origin: this.configService.get('app.cors.origin'),
        credentials: this.configService.get('app.cors.credentials'),
      },
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

  @Get('cors-test')
  testCors(@Req() request: Request, @Res() response: Response, @Headers('origin') origin: string) {
    const corsConfig = this.configService.get('app.cors');

    this.logger.log(`CORS Test Request - Origin: ${origin}`);
    this.logger.log(`CORS Config: ${JSON.stringify(corsConfig)}`);

    return response.json({
      success: true,
      timestamp: new Date().toISOString(),
      request: {
        origin,
        method: request.method,
        headers: request.headers,
      },
      corsConfig,
      message: 'CORS está configurado correctamente',
    });
  }

  private getMemoryUsage() {
    const { rss, heapUsed, heapTotal } = process.memoryUsage();
    return { rss, heapUsed, heapTotal };
  }
}
