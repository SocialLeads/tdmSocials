import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Response, Request } from 'express';
import { EntityNotFoundError } from '../exceptions/errors';

@Catch(EntityNotFoundError)
export class EntityNotFoundExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(EntityNotFoundExceptionFilter.name);

    catch(exception: EntityNotFoundError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const entityName = exception.name.replace('NotFoundError', ''); // Extract entity name from error class
        const entityId =
            request.body?.id ||
            request.body?.username ||
            request.params?.id ||
            request.body?.userId ||
            request.params?.userId ||
            request.body?.workerId ||
            request.params?.workerId ||
            request.body?.sessionId ||
            request.params?.sessionId ||
            request.params?.questionId ||
            'Unknown ID';

        this.logger.warn(`⚠️ ${entityName} not found: ${entityId}`);

        response.status(HttpStatus.NOT_FOUND).json({
            statusCode: HttpStatus.NOT_FOUND,
            message: `${entityName} with ID '${entityId}' not found.`,
        });
    }
}
