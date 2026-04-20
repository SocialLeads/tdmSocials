import { registerAs } from '@nestjs/config';

const getDatabaseHost = () => {
    if (process.env.NODE_ENV === 'local') {
        return 'localhost';
    }
    return process.env.DB_HOST || 'db';
};

const getRedisHost = () => {
    if (process.env.NODE_ENV === 'local') {
        return 'localhost';
    }
    return process.env.REDIS_HOST || 'redis';
};

export const getConfig = () => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    name: process.env.APP_NAME || 'backend-api',
    workingDirectory: process.env.PWD || process.cwd(),
    frontendDomain: process.env.FRONTEND_DOMAIN,
    backendDomain: process.env.BACKEND_DOMAIN ?? 'http://localhost',
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,

    // Database
    databaseHost: getDatabaseHost(),
    databasePort: process.env.DB_PORT || '5432',
    databaseUser: process.env.DB_USER || 'nestuser',
    databasePassword: process.env.DB_PASSWORD || 'nestpassword',
    databaseName: process.env.DB_NAME || 'backend_db',

    // Redis
    redisHost: getRedisHost(),
    redisPort: process.env.REDIS_PORT || '6379',
    redisPassword: process.env.REDIS_PASSWORD || '',

    // JWT
    jwtSecret: process.env.JWT_SECRET || 'superSecret123',
    jwtAccessExpiry: process.env.ACCESS_TOKEN_EXPIRY || '30m',
    jwtRefreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || '15d',
    jwtResetSecret: process.env.JWT_RESET_SECRET || 'resetSecret123',

    // OpenAI
    openaiApiKey: process.env.OPENAI_API_KEY || '',

    // SMTP
    smtpHost: process.env.SMTP_HOST || 'smtp.privateemail.com',
    smtpPort: process.env.SMTP_PORT || '465',
    smtpSecure: process.env.SMTP_SECURE || 'true',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpFrom: process.env.SMTP_FROM || '',
    smtpFromName: process.env.SMTP_FROM_NAME || '',

    // Contact / Admin
    adminContactEmail: process.env.ADMIN_CONTACT_EMAIL || '',

    // Cron schedule (default: 8 AM daily)
    cronSchedule: process.env.CRON_SCHEDULE || '0 8 * * *',

    // Image generation
    dalleModel: process.env.DALL_E_MODEL || 'dall-e-3',
    dalleQuality: process.env.DALL_E_QUALITY || 'standard',
    imageStoragePath: process.env.IMAGE_STORAGE_PATH || '/app/public/generated',
    publicImageBaseUrl: process.env.PUBLIC_IMAGE_BASE_URL || '',
    imageRetentionDays: process.env.IMAGE_RETENTION_DAYS || '365',
});

export default registerAs('app', getConfig);
