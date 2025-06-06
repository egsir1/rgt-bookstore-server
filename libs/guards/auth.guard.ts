import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Message } from 'libs/enums/common.enum';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const bearerToken = request.headers.authorization;
    this.logger.debug(`AuthGuard ~ canActivate ~ bearerToken: ${bearerToken}`);
    const cookieToken = request.cookies?.accessToken;
    this.logger.debug(
      `AuthGuard ~ canActivate ~ request.cookies ${request.cookies}`,
    );
    console.log('🚀 ~ AuthGuard ~ canActivate ~ cookieToken:', cookieToken);

    const token = bearerToken?.split(' ')[1] || cookieToken;
    this.logger.debug(`AuthGuard ~ token: ${token}`);

    if (!token) {
      throw new BadRequestException(Message.TOKEN_MISSING);
    }

    try {
      const user = this.authService.verifyToken(token);

      if (!user) {
        throw new UnauthorizedException(Message.TOKEN_NOT_EXIST);
      }
      request.user = user;
      return true;
    } catch (err) {
      this.logger.error(`AuthGuard Error: ${err}`);
      throw new UnauthorizedException(Message.ONLY_SPECIFIC_ROLES_ALLOWED);
    }
  }
}
