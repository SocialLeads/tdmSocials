import { registerAs } from '@nestjs/config';
import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUrl,
    Max,
    Min,
} from 'class-validator';

enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
    Local = 'local',
}

class EnvironmentVariablesValidator {
    @IsEnum(Environment)
    @IsOptional()
    NODE_ENV: Environment;

    @IsInt()
    @Min(0)
    @Max(65535)
    @IsOptional()
    PORT: number;

    @IsUrl({ require_tld: false })
    @IsOptional()
    FRONTEND_DOMAIN: string;

    @IsUrl({ require_tld: false })
    @IsOptional()
    BACKEND_DOMAIN: string;

    @IsUrl({ require_tld: false })
    @IsOptional()
    COMM_BACKEND_DOMAIN: string;

    @IsOptional()
    DB_HOST: string;

    @IsOptional()
    DB_PORT: string;

    @IsOptional()
    DB_USER: string;

    @IsOptional()
    DB_PASSWORD: string;

    @IsOptional()
    DB_NAME: string;

    @IsString()
    @IsOptional()
    APP_FALLBACK_LANGUAGE: string;

    @IsString()
    @IsOptional()
    APP_HEADER_LANGUAGE: string;

    @IsString()
    @IsOptional()
    JWT_TOKEN: string;

    @IsString()
    @IsOptional()
    WHATSAPP_VERIFY_TOKEN: string;

    @IsString()
    @IsOptional()
    WHATSAPP_TOKEN: string;

    @IsString()
    @IsOptional()
    WHATSAPP_PHONE_NUMBER_ID: string;

    @IsUrl({ require_tld: false })
    @IsOptional()
    AI_SERVICE_URL: string;
}

// Helper function to determine database host based on environment
const getDatabaseHost = () => {
    return process.env.DB_HOST || 'localhost';
}

// Helper function to determine Redis host based on environment
const getRedisHost = () => {
    if (process.env.NODE_ENV === 'local') {
        return 'localhost'; // When running locally, connect to Docker's exposed port
    }
    return process.env.REDIS_HOST || 'redis'; // In Docker, use service name
}

// ✅ Fixed typos in database config keys

export const getConfig = () => {
    const configObject = {
        nodeEnv: process.env.NODE_ENV || 'development',
        name: process.env.APP_NAME || 'optima-backend',
        workingDirectory: process.env.PWD || process.cwd(),
        frontendDomain: process.env.FRONTEND_DOMAIN,
        backendDomain: process.env.BACKEND_DOMAIN ?? 'http://localhost',
        commBackendDomain: process.env.COMM_BACKEND_DOMAIN ?? 'http://localhost',
        fallbackLanguage: process.env.APP_FALLBACK_LANGUAGE ?? '',
        databaseHost: getDatabaseHost(),
        databasePort: process.env.DB_PORT || "5432",
        databaseUser: process.env.DB_USER || "nestuser",
        databasePassword: process.env.DB_PASSWORD || "nestpassword",
        databaseName: process.env.DB_NAME || "optima_db",
        redisHost: getRedisHost(),
        redisPort: process.env.REDIS_PORT || "6379",
        redisPassword: process.env.REDIS_PASSWORD || '',
        port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
        jwtSecret: process.env.JWT_SECRET || 'superSecret123',
        jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'superSecret123',
        jwtResetSecret: process.env.JWT_RESET_SECRET || process.env.JWT_SECRET || 'superSecret123',
        jwtAccessExpiry: process.env.ACCESS_TOKEN_EXPIRY || '30m',
        jwtRefreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || '15d',
        jwtResetExpiry: process.env.JWT_RESET_EXPIRY || '15m',
        whatsappVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'your_verify_token_here',
        whatsappToken: process.env.WHATSAPP_TOKEN || '',
        whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
        aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8001',

        // Image generation
        dalleModel: process.env.DALL_E_MODEL || 'dall-e-3',
        dalleQuality: process.env.DALL_E_QUALITY || 'standard',
        imageStoragePath: process.env.IMAGE_STORAGE_PATH || '/app/public/generated',
        publicImageBaseUrl: process.env.PUBLIC_IMAGE_BASE_URL || '',
        imageRetentionDays: process.env.IMAGE_RETENTION_DAYS || '365',
    };

    return configObject;
};

// ✅ Use `registerAs()` for NestJS
export default registerAs('app', getConfig);
