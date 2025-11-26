import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'], // Logs útiles en desarrollo
    });
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Reintenta la conexión a Postgres (útil cuando Docker aún no está listo).
   */
  private async connectWithRetry(retries = 10, delayMs = 1500): Promise<void> {
    while (retries > 0) {
      try {
        await this.$connect();
        return;
      } catch {
        retries--;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw new Error('Prisma failed to connect');
  }

  /**
   * Limpia todas las tablas (solo para tests).
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;

    const models = Reflect.ownKeys(this).filter(
      (key) =>
        key[0] !== '_' &&
        key[0] !== '$' &&
        typeof this[key]?.deleteMany === 'function',
    );

    return Promise.all(models.map((model) => this[model].deleteMany()));
  }
}
