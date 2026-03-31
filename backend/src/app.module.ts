import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import appConfig from './config/app.config';
import { ThrottlerModule } from '@nestjs/throttler';
import { getTypeOrmConfig } from './config/database.config';
import { APP_INTERCEPTOR, APP_GUARD, APP_FILTER } from '@nestjs/core';
import { LoggingInterceptor } from './shared/middleware/logger.middleware';
import { AdminModule } from './modules/admin/admin.module';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { HealthModule } from './modules/health/health.module';
import { RequestContextMiddleware } from './context/request-context.middleware';
import { RedisModule } from './redis/redis.module';
import { ClientsModule } from './modules/clients/clients.module';
import { AiModule } from './modules/ai/ai.module';
import { ContentModule } from './modules/content/content.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { OutgoingCommunicationModule } from './modules/outgoing-communication/outgoing-communication.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig],
            envFilePath: [
                `.env`,
                `.env.${process.env.NODE_ENV}`,
                `.env.local`,
            ],
        }),

        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getTypeOrmConfig,
        }),

        ThrottlerModule.forRoot({
            throttlers: [
                {
                    limit: 10,
                    ttl: 60,
                },
            ],
        }),

        ScheduleModule.forRoot(),

        AuthModule,
        UsersModule,
        ClientsModule,
        AiModule,
        OutgoingCommunicationModule,
        ContentModule,
        SchedulerModule,
        InvoiceModule,
        AdminModule,
        HealthModule,
        RedisModule,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionFilter,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RequestContextMiddleware)
            .forRoutes('*');
    }
}
