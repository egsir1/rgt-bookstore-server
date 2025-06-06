import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';

export const AuthenticatedUser = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    Logger.debug(`user: ${JSON.stringify(user)}`);
    if (user) return data ? user[data] : user;
    else return null;
  },
);
