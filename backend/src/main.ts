import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { initializeDatabase } from './utils/database.utils';
import { setupSwagger } from './utils/swagger.utils';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AuthExceptionFilter } from './shared/filters/auth-exception.filter';
import { DatabaseExceptionFilter } from './shared/filters/database-exception.filter';
import { ValidationExceptionFilter } from './shared/filters/validation-exception.filter';
import { EntityNotFoundExceptionFilter } from './shared/filters/entity-exception.filter';
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { winstonLogger } from './logger/winston-logger';

async function bootstrap() {
    const logger = new Logger('MainApp');

    const app = await NestFactory.create(AppModule, {
        logger: WinstonModule.createLogger(winstonLogger),
    });

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());

    setupSwagger(app);

    app.useGlobalFilters(
        new AuthExceptionFilter(),
        new ValidationExceptionFilter(),
        new DatabaseExceptionFilter(),
        new EntityNotFoundExceptionFilter(),
    );

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    const configService = app.get(ConfigService);
    const frontendOriginsRaw = configService.get<string>('FRONTEND_DOMAIN') || configService.get<string>('app.frontendDomain');
    const origins = frontendOriginsRaw ? frontendOriginsRaw.split(',').map(o => o.trim()).filter(Boolean) : '*';

    app.enableCors({
        origin: origins,
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type, Authorization',
    });

    const dataSource = app.get(DataSource);
    try {
        const dbInfo = await dataSource.query(
            'select current_database() as name, current_schema() as schema',
        );
        logger.log(`DB connected: ${JSON.stringify(dbInfo?.[0] ?? {})}`);
    } catch (error) {
        logger.warn(`DB info query failed: ${String(error)}`);
    }
    await initializeDatabase(dataSource);

    await app.listen(process.env.PORT || 3001);
    logger.log(`Server running on http://localhost:${process.env.PORT || 3001}`);
}

bootstrap();
