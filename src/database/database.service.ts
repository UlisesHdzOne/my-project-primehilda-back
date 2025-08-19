import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async checkConnection(): Promise<{ status: string; error?: string }> {
    try {
      await this.$queryRaw`SELECT 1`;
      return { status: 'ok' };
    } catch (error: any) {
      return { status: 'error', error: error.message };
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
