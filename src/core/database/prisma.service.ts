import { Injectable } from '@nestjs/common';
import type { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { AppLogger } from '../logger/winston.config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new AppLogger(PrismaService.name);

  constructor() {
    const isDev = process.env.NODE_ENV === 'development';

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
      this.logger.log('✅ Conectado a la base de datos');
    } catch (error) {
      this.logger.error('❌ Error conectando a la base de datos', error as Error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('🔌 Desconectado de la base de datos');
    } catch (error) {
      this.logger.error('❌ Error desconectando de la base de datos', error as Error);
    }
  }

  // =========================
  // UTILIDADES DEV
  // =========================

  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      this.logger.warn('🚫 No permitido en producción');
      return;
    }

    await this.$executeRawUnsafe(`
      DO $$ 
      DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
        END LOOP;
      END $$;
    `);

    this.logger.log('🧹 Base de datos limpiada');
  }

  async checkHealth() {
    try {
      await this.$queryRaw`SELECT 1`;
      return { status: 'healthy' };
    } catch {
      return { status: 'unhealthy' };
    }
  }
}
