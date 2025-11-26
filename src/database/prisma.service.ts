import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      // ✅ LOGS MEJORADOS - Solo en desarrollo y según nivel
      log: [process.env.NODE_ENV === 'development' ? 'query' : undefined, 'warn', 'error'].filter(
        Boolean,
      ) as any, // Filtra undefined

      // ✅ MEJOR MANEJO DE CONEXIONES
      errorFormat: 'colorless',

      // ✅ MEJOR MANEJO DE TRANSACCIONES (opcional)
      // transactionOptions: {
      //   maxWait: 5000,
      //   timeout: 10000,
      // },
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

  // ✅ MÉTODO MEJORADO PARA LIMPIAR BASE DE DATOS
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      this.logger.warn('🚫 Limpieza de base de datos omitida en producción');
      return;
    }

    this.logger.log('🧹 Iniciando limpieza de base de datos...');

    try {
      // ✅ ORDEN CORRECTO: primero tablas con foreign keys, luego independientes
      const modelsToDelete = [
        // Cuando agregues más modelos, ponlos en este orden:
        // this.orderItem.deleteMany(), // depende de order y product
        // this.order.deleteMany(),     // depende de user
        // this.product.deleteMany(),   // depende de category
        // this.category.deleteMany(),  // independiente
        this.user.deleteMany(), // tabla base
      ].filter(Boolean); // Filtra modelos que no existen aún

      if (modelsToDelete.length === 0) {
        this.logger.log('ℹ️  No hay modelos para limpiar');
        return;
      }

      await this.$transaction(modelsToDelete);
      this.logger.log('✅ Base de datos limpiada exitosamente');
    } catch (error) {
      this.logger.error('❌ Error limpiando base de datos:', error);
      throw error;
    }
  }

  // ✅ NUEVO: MÉTODO PARA HEALTH CHECK
  async checkHealth(): Promise<{ status: string; timestamp: Date }> {
    try {
      await this.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('❌ Health check falló:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date(),
      };
    }
  }

  // ✅ NUEVO: MÉTODO PARA ESTADÍSTICAS (útil para debugging)
  async getDatabaseStats() {
    if (process.env.NODE_ENV !== 'development') {
      return { message: 'Solo disponible en desarrollo' };
    }

    try {
      const userCount = await this.user.count();

      return {
        users: userCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error obteniendo estadísticas:', error);
      return { error: 'No se pudieron obtener estadísticas' };
    }
  }
}
