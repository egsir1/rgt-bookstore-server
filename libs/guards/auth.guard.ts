import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const bearerToken = request.headers.authorization;
    console.log('🚀 ~ AuthGuard ~ canActivate ~ bearerToken:', bearerToken);
    const cookieToken = request.cookies?.access_token;
    console.log(
      '🚀 ~ AuthGuard ~ canActivate ~ request.cookies:',
      request.cookies,
    );
    console.log('🚀 ~ AuthGuard ~ canActivate ~ cookieToken:', cookieToken);

    const token = bearerToken?.split(' ')[1] || cookieToken;
    console.log('🚀 ~ AuthGuard ~ token:', token);

    if (!token) {
      throw new BadRequestException('Authorization token is missing');
    }

    console.log('🚀 ~ AuthGuard ~ canActivate ~ token:', token);

    try {
      const user = this.authService.verifyToken(token);

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      request.user = user;
      return true;
    } catch (err) {
      console.error('AuthGuard Error:', err);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
