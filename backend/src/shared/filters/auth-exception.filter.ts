import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationError, TokenInvalidExpiredError } from '../exceptions/errors';

@Catch(AuthenticationError, TokenInvalidExpiredError)
export class AuthExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(AuthExceptionFilter.name);

    catch(exception: AuthenticationError | TokenInvalidExpiredError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.UNAUTHORIZED;
        let message = 'Authentication error.';

        if (exception instanceof AuthenticationError) {
            this.logger.warn(`Authentication failed: ${exception.message}`);
            message = 'Invalid credentials or session expired.';
        } else if (exception instanceof TokenInvalidExpiredError) {
            this.logger.warn(`Token error: ${exception.message}`);
            message = 'Your session has expired. Please log in again.';
        }

        response.status(status).json({
            statusCode: status,
            message,
        });
    }
}
