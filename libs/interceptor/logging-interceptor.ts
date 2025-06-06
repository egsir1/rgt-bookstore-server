import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger();
  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const recordTime = Date.now();
    const requestType = context.getType();
    this.logger.debug(`LoggingInterceptor ~ requestType: ${requestType}`);

    if (requestType === 'http') {
      // Handle HTTP requests (REST API)
      const httpContext = context.switchToHttp();
      const request = httpContext.getRequest();
      const { method, url, body, query, params } = request;

      this.logger.log(
        `HTTP ${method} Request to ${url} \n` +
          `Query Params: ${JSON.stringify(query)} \n` +
          `Path Params: ${JSON.stringify(params)} \n` +
          `Request Body: ${JSON.stringify(body)}`,
        'HTTP REQUEST',
      );

      return next.handle().pipe(
        tap(() => {
          const response = httpContext.getResponse();
          const responseTime = Date.now() - recordTime;
          const statusCode = response.statusCode;

          this.logger.log(
            `HTTP Response from ${url} - Status: ${statusCode} - ` +
              `${responseTime}ms \n\n`,
            'HTTP RESPONSE',
          );
        }),
      );
    }

    // Return an empty observable for non-HTTP requests
    return next.handle();
  }
}
