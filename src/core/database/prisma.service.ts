// src/core/database/prisma.service.ts - VERSIÓN COMPLETA CORREGIDA
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
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
      this.logger.log('✅ Conectado a la base de datos exitosamente');
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

  // =============================================
  // 🧹 LIMPIAR BASE DE DATOS (VERSIÓN SEGURA)
  // =============================================
  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      this.logger.warn('🚫 No se permite limpiar DB en producción');
      return;
    }

    this.logger.log('🧹 Limpiando base de datos...');

    try {
      // Usa truncate como método seguro mientras no tienes los tipos
      await this.truncateAllTables();
      this.logger.log('✅ Base de datos limpiada exitosamente');
    } catch (error) {
      this.logger.error('❌ Error limpiando base de datos', error as Error);
      throw error;
    }
  }

  // =============================================
  // 🧹 TRUNCAR TODAS LAS TABLAS (MÉTODO ALTERNATIVO)
  // =============================================
  async truncateAllTables(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('No se permite truncar tablas en producción');
    }

    this.logger.log('🧹 Truncando todas las tablas...');

    try {
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

      this.logger.log('✅ Todas las tablas truncadas');
    } catch (error) {
      this.logger.error('❌ Error truncando tablas', error as Error);
      throw error;
    }
  }

  // =============================================
  // 🔄 REINICIAR SECUENCIAS
  // =============================================
  async resetSequences(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      this.logger.warn('🚫 No se permite resetear secuencias en producción');
      return;
    }

    try {
      await this.$executeRawUnsafe(`
        DO $$ 
        DECLARE
          r RECORD;
        BEGIN
          FOR r IN (
            SELECT sequencename 
            FROM pg_sequences 
            WHERE schemaname = 'public'
          ) LOOP
            EXECUTE 'ALTER SEQUENCE ' || quote_ident(r.sequencename) || ' RESTART WITH 1';
          END LOOP;
        END $$;
      `);

      this.logger.log('✅ Secuencias reiniciadas');
    } catch (error) {
      this.logger.error('❌ Error reiniciando secuencias', error as Error);
    }
  }

  // =============================================
  // ✅ VERIFICAR SALUD
  // =============================================
  async checkHealth() {
    try {
      await this.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        timestamp: new Date(),
        database: 'connected',
      };
    } catch (error) {
      this.logger.error('❌ Health check falló', error as Error);
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // =============================================
  // 📋 OBTENER INFORMACIÓN
  // =============================================
  async getDatabaseInfo() {
    try {
      const [version, tableCount, dbSize] = await Promise.all([
        this.$queryRaw<[{ version: string }]>`SELECT version()`,
        this.$queryRaw<[{ count: string }]>`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
        `,
        this.$queryRaw<[{ size: string }]>`
          SELECT pg_database_size(current_database()) as size
        `,
      ]);

      return {
        version: version[0]?.version || 'unknown',
        tableCount: parseInt(tableCount[0]?.count || '0'),
        databaseSize: parseInt(dbSize[0]?.size || '0'),
        databaseSizeMB: Math.round(parseInt(dbSize[0]?.size || '0') / 1024 / 1024),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error obteniendo info de DB', error as Error);
      return {
        version: 'unknown',
        tableCount: 0,
        databaseSize: 0,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // =============================================
  // 🔄 REINICIAR BASE DE DATOS
  // =============================================
  async resetDatabase(): Promise<void> {
    this.logger.log('🔄 Reiniciando base de datos...');
    await this.cleanDatabase();
    this.logger.log('✅ Base de datos reiniciada');
  }

  // =============================================
  // 🛠️ MÉTODO PARA EJECUTAR QUERIES RAW
  // =============================================
  async executeRaw<T>(query: string, params?: unknown[]): Promise<T> {
    try {
      this.logger.debug('Ejecutando consulta raw');

      // $queryRawUnsafe retorna un tipo unknown por defecto
      const result =
        params && params.length > 0
          ? await this.$queryRawUnsafe<unknown>(query, ...params)
          : await this.$queryRawUnsafe<unknown>(query);

      // Hacemos el cast al tipo esperado T
      return result as T;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Error ejecutando consulta raw', err);
      throw err;
    }
  }
}
