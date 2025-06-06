import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'prisma/src/prisma.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [AuthModule, PrismaModule, MailModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
