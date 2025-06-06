import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwt_expiry } from 'config';
import { PrismaModule } from 'prisma/src/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: jwt_expiry },
    }),
  ],
  providers: [AuthService],
})
export class AuthModule {}
