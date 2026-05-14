import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('📦 Prisma conectado exitosamente a PostgreSQL');
    } catch (error) {
      console.error('❌ Error conectando Prisma a PostgreSQL:', error.message);
      console.log('⚠️  Asegúrate de haber creado la DB: createdb cybershield');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
