import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect()
      .then(() => console.log('CONNECTED To Prisma DB'))
      .catch((err: unknown) =>
        console.error('Failed to connect to Prisma DB:', err),
      );
  }

  async onModuleDestroy() {
    await this.$disconnect()
      .then(() => console.log('DISCONNECTED From Prisma DB'))
      .catch((err: unknown) =>
        console.error('Failed to disconnect from Prisma DB:', err),
      );
  }
}
