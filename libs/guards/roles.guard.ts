import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Message } from 'libs/enums/common.enum';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    this.logger.debug(`RolesGuard ~ canActivate ~ roles: ${roles}`);
    if (!roles) return true;
    const request = context.switchToHttp().getRequest();
    const bearerToken = request.headers.authorization;
    const cookieToken = request.cookies?.accessToken;

    const token = bearerToken?.split(' ')[1] || cookieToken;
    this.logger.debug(`RolesGuard ~ canActivate ~ token: ${token}`);
    if (!token) {
      throw new BadRequestException(Message.TOKEN_MISSING);
    }
    try {
      const user = await this.authService.verifyToken(token);
      if (!user) {
        throw new UnauthorizedException(Message.TOKEN_NOT_EXIST);
      }

      const hasRole = () => roles.includes(user.role);
      const hasPermission: boolean = hasRole();
      this.logger.debug(
        `RolesGuard ~ canActivate ~ hasPermission: ${hasPermission}`,
      );

      if (!hasPermission) {
        throw new ForbiddenException(Message.ONLY_SPECIFIC_ROLES_ALLOWED);
      }

      request.user = user;
      return true;
    } catch (err) {
      this.logger.error(`AuthGuard Error: ${err}`);
      throw new UnauthorizedException(Message.ONLY_SPECIFIC_ROLES_ALLOWED);
    }
  }
}
