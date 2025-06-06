import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect()
      .then(() => Logger.debug('CONNECTED To Prisma DB'))
      .catch((err: unknown) =>
        Logger.error('Failed to connect to Prisma DB:', err),
      );
  }

  async onModuleDestroy() {
    await this.$disconnect()
      .then(() => Logger.debug('DISCONNECTED From Prisma DB'))
      .catch((err: unknown) =>
        Logger.error('Failed to disconnect from Prisma DB:', err),
      );
  }
}
