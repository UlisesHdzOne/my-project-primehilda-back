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
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      this.logger.warn('🚫 No se permite limpiar DB en producción');
      return;
    }

    this.logger.log('🧹 Limpiando base de datos...');

    try {
      // Como NO hay tablas user/product aún desde Nest, por ahora vaciamos categorías
      await this.$transaction([this.product.deleteMany(), this.category.deleteMany()]);

      this.logger.log('✅ Base de datos limpiada exitosamente');
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
