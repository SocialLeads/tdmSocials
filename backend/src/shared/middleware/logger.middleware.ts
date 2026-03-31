import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, originalUrl, body, query } = req;

        const username = req.user?.username || req.headers['user-id'] || 'Anonymous User';

        // Skip body logging for webhook endpoints to avoid massive Buffer logs
        const isWebhook = originalUrl.includes('/stripe/webhook');
        const bodyLog = isWebhook ? '[WEBHOOK_BODY]' : JSON.stringify(body);

        this.logger.log(`[${username}] ${method} ${originalUrl} - Query: ${JSON.stringify(query)} - Body: ${bodyLog}`);

        const start = Date.now();

        return next.handle().pipe(
            tap(() => {
                const duration = Date.now() - start;
                this.logger.log(`[${username}] ${method} ${originalUrl} - Response Time: ${duration}ms`);
            })
        );
    }
}
