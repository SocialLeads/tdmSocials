import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { DatabaseOperationError } from '../exceptions/errors';

@Catch(DatabaseOperationError)
export class DatabaseExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(DatabaseExceptionFilter.name);

    catch(exception: DatabaseOperationError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        this.logger.error(`Database error: ${exception.message}`);

        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'A database error occurred. Please try again later.',
        });
    }
}
