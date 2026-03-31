export type AppConfig = {
    nodeEnv: string;
    name: string;
    workingDirectory: string;
    frontendDomain?: string;
    backendDomain: string;
    commBackendDomain: string;
    databaseHost: string; // ✅ Added this missing key
    databasePort: string;
    databaseUser: string;
    databasePassword: string;
    databaseName: string;
    port: number;
    fallbackLanguage: string;
    headerLanguage: string;
    jwtSecret: string;
    jwtRefreshSecret: string;
    jwtResetSecret: string;
    jwtRefreshExpiry: string;
    jwtAccessExpiry: string;
    jwtResetExpiry: string;
    redisHost: string;
    redisPort: number;
    redisPassword: string;
    whatsappVerifyToken: string;
    whatsappToken: string;
    whatsappPhoneNumberId: string;
    aiServiceUrl: string;
};
