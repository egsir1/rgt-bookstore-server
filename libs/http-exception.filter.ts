import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception.getResponse();
    const errorMessage =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || 'Unknown error occurred';

    const errorStack = exception.stack || 'No stack available';
    Logger.warn(`HttpExceptionFilter ~ errorStack: ${errorStack}`);
    Logger.error(`HttpExceptionFilter ~ status: ${status}`);
    Logger.error(`Error message: ${errorMessage}`);

    response.status(status).json({
      statusCode: status,
      message: errorMessage,
      // stack: errorStack,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
