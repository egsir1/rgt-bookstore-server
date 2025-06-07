import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  private readonly logger = new Logger(OptionalAuthGuard.name);
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const bearerToken = request.headers.authorization;
    const cookieToken = request.cookies?.accessToken;

    const token = bearerToken?.split(' ')[1] || cookieToken;
    this.logger.debug(`OptionalAuthGuard ~ token: ${token}`);

    if (!token) {
      request.user = null;
      return true;
    }

    try {
      const user = this.authService.verifyToken(token);
      request.user = user || null;
    } catch (err) {
      this.logger.warn(`Invalid token in OptionalAuthGuard: ${err}`);
      request.user = null;
    }

    return true;
  }
}
