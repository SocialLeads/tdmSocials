import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { getConfig } from './app.config';
import { config } from 'dotenv';
import { DefaultNamingStrategy } from 'typeorm';

// Load environment variables
config();

// ✅ Load configuration for both NestJS & CLI
const appConfig = getConfig();
console.log(appConfig);

// const entities: Function[] = [
//     WorkerEntity as Function,
//     UserEntity as Function,
//     ProfessionEntity as Function,
//     CertificationEntity as Function,
//     WorkerCertificationEntity as Function,
//     QuestionEntity as Function,
//     SessionEntity as Function
// ];

// ✅ Function for NestJS (returns TypeOrmModuleOptions)
export const getTypeOrmConfig = (): TypeOrmModuleOptions => {
    // SAFETY: DB sync requires BOTH conditions to be true:
    // 1. DB_SYNC must be explicitly set to 'true'
    // 2. DB_SYNC_CONFIRM must be set to 'YES_I_WANT_TO_DROP_DATA'
    const shouldSync = process.env.DB_SYNC === 'true' && process.env.DB_SYNC_CONFIRM === 'YES_I_WANT_TO_DROP_DATA';
    
    if (process.env.DB_SYNC === 'true' && process.env.DB_SYNC_CONFIRM !== 'YES_I_WANT_TO_DROP_DATA') {
        console.error('⚠️  WARNING: DB_SYNC is true but DB_SYNC_CONFIRM is not set to "YES_I_WANT_TO_DROP_DATA"');
        console.error('⚠️  Database synchronization is DISABLED for safety.');
        console.error('⚠️  To enable sync (WILL DROP DATA), set: DB_SYNC_CONFIRM=YES_I_WANT_TO_DROP_DATA');
    }
    
    console.log('TypeORM Synchronize:', shouldSync, 'NODE_ENV:', process.env.NODE_ENV, 'DB_SYNC:', process.env.DB_SYNC, 'DB_SYNC_CONFIRM:', process.env.DB_SYNC_CONFIRM);
    
    return {
        type: 'postgres' as const,
        host: appConfig.databaseHost,
        port: +appConfig.databasePort,
        username: appConfig.databaseUser,
        password: appConfig.databasePassword,
        database: appConfig.databaseName,
        autoLoadEntities: true,
        synchronize: shouldSync, // Enable in dev/local/development or when DB_SYNC is true
        retryAttempts: 5,
        namingStrategy: new DefaultNamingStrategy(),
    };
};

// ✅ Function for TypeORM CLI (returns DataSourceOptions)
export const getDataSourceOptions = (): DataSourceOptions => ({
    type: 'postgres' as const,
    host: appConfig.databaseHost,
    port: +appConfig.databasePort,
    username: appConfig.databaseUser,
    password: appConfig.databasePassword,
    database: appConfig.databaseName,
    entities: ["src/**/*.entity.ts"],
    migrations: [
        "src/migrations/**/*.ts", // for TypeScript during development
    ],
    migrationsTableName: "migrations",
    namingStrategy: new DefaultNamingStrategy(),
});

// ✅ Create TypeORM `DataSource` instance for CLI
const AppDataSource = new DataSource(getDataSourceOptions());

export default AppDataSource;
