import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Database cleaning skipped in production');
      return;
    }

    // Lista EXPLÍCITA de todos tus modelos en el orden correcto
    // (primero las tablas que dependen de otras, luego las independientes)
    const modelsToDelete = [
      // Agrega aquí TODOS tus modelos en orden inverso de dependencias
      // Ejemplo:
      // this.orderItem.deleteMany(), // depende de order y product
      // this.order.deleteMany(),     // depende de user
      // this.product.deleteMany(),   // depende de category  
      // this.category.deleteMany(),
      this.user.deleteMany(),
    ];

    if (modelsToDelete.length > 0) {
      await this.$transaction(modelsToDelete);
    }
  }
}