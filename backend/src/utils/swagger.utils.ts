import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {INestApplication, Logger} from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
    const logger = new Logger("SwaggerUtils"); // This names the logs after the class

    const config = new DocumentBuilder()
        .setTitle('Optima Backend API')
        .setDescription('API documentation for the Optima Backend service')
        .setVersion('1.0')
        .addBearerAuth() // For Bearer token authentication
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document); // Swagger UI at /api
    logger.log('✅ Swagger setup complete');
}
