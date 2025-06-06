import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from 'prisma/src/prisma.module';
import { MailModule } from './mail/mail.module';
import { BookModule } from './book/book.module';

@Module({
  imports: [UserModule, AuthModule, PrismaModule, MailModule, BookModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
