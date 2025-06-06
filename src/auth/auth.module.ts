import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwt_expiry } from 'config';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: jwt_expiry },
    }),
  ],
  providers: [AuthService],
})
export class AuthModule {}
