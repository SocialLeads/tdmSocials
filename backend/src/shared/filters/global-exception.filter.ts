import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { EntityNotFoundError } from '../exceptions/errors';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'InternalServerError';

    if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
      error = exception.name;
    } else if (exception instanceof Error && exception.name === 'AuthenticationError') {
      status = HttpStatus.UNAUTHORIZED;
      message = exception.message;
      error = 'AuthenticationError';
    } else if (exception instanceof Error && exception.name === 'TokenInvalidExpired') {
      status = HttpStatus.UNAUTHORIZED;
      message = exception.message;
      error = 'TokenInvalidExpired';
    } else if (exception instanceof Error && exception.name === 'DatabaseOperationError') {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      error = 'DatabaseOperationError';
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        const nested = (exceptionResponse as any)?.message;
        message = Array.isArray(nested) ? nested.join(', ') : (typeof nested === 'string' ? nested : exception.message);
      }
      error = exception.name;
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      error = exception.name;
    }

    this.logger.error(
      `Exception caught: ${error} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      success: false,
      error,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
