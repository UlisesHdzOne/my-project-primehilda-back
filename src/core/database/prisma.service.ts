// src/core/database/prisma.service.ts - VERSIÓN CORREGIDA
import configuration from '@/config/configuration';
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const config = configuration();
    const isDev = config.nodeEnv === 'development';

    super({
      log: [
        ...(isDev ? [{ emit: 'stdout', level: 'query' } as Prisma.LogDefinition] : []),
        { emit: 'stdout', level: 'warn' } as Prisma.LogDefinition,
        { emit: 'stdout', level: 'error' } as Prisma.LogDefinition,
      ],
      errorFormat: 'colorless',
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Conectado a la base de datos exitosamente');
    } catch (error) {
      this.logger.error('❌ Error conectando a la base de datos:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('🔌 Desconectado de la base de datos');
    } catch (error) {
      this.logger.error('❌ Error desconectando de la base de datos:', error);
    }
  }

  // Opción segura para reset en desarrollo
  // Versión mejorada que verifica dinámicamente
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      this.logger.warn('🚫 No se permite limpiar DB en producción');
      return;
    }

    this.logger.log('🧹 Limpiando base de datos...');

    try {
      // Lista de todos los modelos en orden inverso de dependencias
      const deleteOperations = [];

      // Verificar qué modelos existen dinámicamente
      if ('washOrderService' in this) {
        deleteOperations.push(this.washOrderService.deleteMany());
      }

      if ('payment' in this) {
        deleteOperations.push(this.payment.deleteMany());
      }

      if ('washOrder' in this) {
        deleteOperations.push(this.washOrder.deleteMany());
      }

      if ('carDetail' in this) {
        deleteOperations.push(this.carDetail.deleteMany());
      }

      if ('car' in this) {
        deleteOperations.push(this.car.deleteMany());
      }

      if ('serviceType' in this) {
        deleteOperations.push(this.serviceType.deleteMany());
      }

      if ('employee' in this) {
        deleteOperations.push(this.employee.deleteMany());
      }

      if (deleteOperations.length > 0) {
        await this.$transaction(deleteOperations);
        this.logger.log(`✅ Base de datos limpiada (${deleteOperations.length} modelos)`);
      } else {
        this.logger.warn('📝 No se encontraron modelos para limpiar');
      }
    } catch (error) {
      this.logger.error('❌ Error limpiando base de datos:', error);
      throw error;
    }
  }

  async checkHealth() {
    try {
      await this.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      this.logger.error('❌ Health check falló:', error);
      return { status: 'unhealthy', timestamp: new Date() };
    }
  }
}
