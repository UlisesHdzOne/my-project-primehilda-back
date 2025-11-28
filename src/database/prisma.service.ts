import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import configuration from '../config/configuration';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const config = configuration(); // obtiene nodeEnv y database URL
    const isDev = config.nodeEnv === 'development';

    super({
      // Logs de queries solo en desarrollo, siempre warn y error
      log: [...(isDev ? ['query'] : []), 'warn', 'error'] as any,
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

  // Solo si necesitas limpiar la base de datos en dev/test
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      this.logger.warn('🚫 Limpieza de base de datos omitida en producción');
      return;
    }

    this.logger.log('🧹 Iniciando limpieza de base de datos...');
    try {
      const modelsToDelete = [this.user.deleteMany()].filter(Boolean);
      if (!modelsToDelete.length) return;
      await this.$transaction(modelsToDelete);
      this.logger.log('✅ Base de datos limpiada exitosamente');
    } catch (error) {
      this.logger.error('❌ Error limpiando base de datos:', error);
      throw error;
    }
  }

  // Health check
  async checkHealth(): Promise<{ status: string; timestamp: Date }> {
    try {
      await this.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      this.logger.error('❌ Health check falló:', error);
      return { status: 'unhealthy', timestamp: new Date() };
    }
  }

  // Stats solo en desarrollo
  async getDatabaseStats() {
    if (process.env.NODE_ENV !== 'development') {
      return { message: 'Solo disponible en desarrollo' };
    }

    try {
      const userCount = await this.user.count();
      return { users: userCount, timestamp: new Date().toISOString() };
    } catch (error) {
      this.logger.error('Error obteniendo estadísticas:', error);
      return { error: 'No se pudieron obtener estadísticas' };
    }
  }
}
