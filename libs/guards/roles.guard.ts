import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Message } from 'libs/enums/common.enum';
import { AuthService } from 'src/auth/auth.service';

export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    console.log('🚀 ~ RolesGuard ~ canActivate ~ roles:', roles);

    if (!roles) return true;
    const request = context.switchToHttp().getRequest();
    const bearerToken = request.headers.authorization;
    const cookieToken = request.cookies?.access_token;

    const token = bearerToken?.split(' ')[1] || cookieToken;
    console.log('🚀 ~ RolesGuard ~ canActivate ~ token:', token);
    if (!token) {
      throw new BadRequestException('Authorization token is missing');
    }
    try {
      const secret = process.env.JWT_ACCESS_SECRET;
      console.log('🚀 ~ RolesGuard ~ canActivate ~ secret:', secret);
      const user = await this.authService.verifyToken(token);

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const hasRole = () => roles.includes(user.role);
      const hasPermission: boolean = hasRole();
      console.log(
        '🚀 ~ RolesGuard ~ canActivate ~ hasPermission:',
        hasPermission,
      );

      if (!hasPermission) {
        throw new ForbiddenException(Message.ONLY_SPECIFIC_ROLES_ALLOWED);
      }

      request.user = user;
      return true;
    } catch (err) {
      console.error('AuthGuard Error:', err);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
