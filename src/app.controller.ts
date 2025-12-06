import {
  Controller,
  Get,
  Res,
  Req,
  Headers,
  BadRequestException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AppLogger } from './common/logger/winston.config';

@Controller()
export class AppController {
  private readonly logger = new AppLogger(AppController.name);

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

  // ============================================
  // 🧪 ENDPOINTS DE PRUEBA PARA EL NUEVO LOGGER Y ERROR HANDLING
  // ============================================

  @Get('test/error/404')
  testNotFoundError() {
    throw new NotFoundException('Este es un error 404 de prueba');
  }

  @Get('test/error/400')
  testBadRequestError(@Query('name') name?: string) {
    if (!name) {
      throw new BadRequestException({
        message: 'El parámetro "name" es requerido',
        error: 'Bad Request',
        statusCode: 400,
      });
    }
    return { message: `Hola ${name}` };
  }

  @Get('test/error/validation')
  testValidationError() {
    throw new BadRequestException({
      message: [
        {
          property: 'email',
          constraints: {
            isEmail: 'El email debe ser válido',
          },
        },
        {
          property: 'password',
          constraints: {
            minLength: 'La contraseña debe tener al menos 8 caracteres',
            matches: 'La contraseña debe contener mayúsculas y números',
          },
        },
      ],
      error: 'Validation Error',
      statusCode: 400,
    });
  }

  @Get('test/error/500')
  testServerError() {
    // Simular un error del servidor
    throw new Error('Este es un error interno del servidor de prueba');
  }

  @Get('test/logs/info')
  testInfoLog() {
    this.logger.log('Este es un log INFO de prueba desde AppController');
    return { message: 'Log INFO generado' };
  }

  @Get('test/logs/error')
  testErrorLog() {
    this.logger.error(
      'Este es un log ERROR de prueba desde AppController',
      new Error('Error simulado'),
    );
    return { message: 'Log ERROR generado' };
  }

  @Get('test/logs/warn')
  testWarnLog() {
    this.logger.warn('Este es un log WARN de prueba desde AppController');
    return { message: 'Log WARN generado' };
  }

  private getMemoryUsage() {
    const { rss, heapUsed, heapTotal } = process.memoryUsage();
    return { rss, heapUsed, heapTotal };
  }
}
