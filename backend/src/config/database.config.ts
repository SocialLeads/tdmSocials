import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { getConfig } from './app.config';
import { UserEntity } from '../modules/users/users.entity';
import { ClientEntity } from '../modules/clients/client.entity';
import { config } from 'dotenv';

// Load environment variables
config();

// Load configuration for both NestJS & CLI
const appConfig = getConfig();
const entities: Function[] = [
    UserEntity as Function,
    ClientEntity as Function,
];

// Function for NestJS (returns TypeOrmModuleOptions)
export const getTypeOrmConfig = (): TypeOrmModuleOptions => ({
    type: 'postgres' as const,
    host: appConfig.databaseHost,
    port: +appConfig.databasePort,
    username: appConfig.databaseUser,
    password: appConfig.databasePassword,
    database: appConfig.databaseName,
    autoLoadEntities: true,
    synchronize: true, // Enable auto-schema creation
    retryAttempts: 5, 
});

// Function for TypeORM CLI (returns DataSourceOptions)
export const getDataSourceOptions = (): DataSourceOptions => ({
    type: 'postgres' as const,
    host: appConfig.databaseHost,
    port: +appConfig.databasePort,
    username: appConfig.databaseUser,
    password: appConfig.databasePassword,
    database: appConfig.databaseName,
    entities,
    migrations: [
        "src/database/migrations/**/*.ts", // for TypeScript during development
    ],
    migrationsTableName: "migrations",
});

// Create TypeORM `DataSource` instance for CLI
const AppDataSource = new DataSource(getDataSourceOptions());

export default AppDataSource;
