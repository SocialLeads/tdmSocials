import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { getConfig } from "../config/app.config";
import AppDataSource from "../config/database.config";
import { config } from "dotenv";
import { seedUsers } from '../modules/users/users.seed';

// ✅ Load environment variables manually
config();

async function runSeeder() {
    const logger = new Logger("Seeder");

    try {
        console.log("🔄 Initializing database connection...");

        // ✅ Ensure TypeORM is initialized before running migrations
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log("✅ Database connection established!");
        } else {
            console.log("✅ Database connection already initialized.");
        }

        console.log("🌱 Running database seeders...");
        console.log("ℹ️ Database Config:", getConfig());
        console.log("ℹ️ Database Connection:", AppDataSource.options);

        const app = await NestFactory.createApplicationContext(AppModule); // ✅ Bootstrap without HTTP server
        const dataSource = app.get(DataSource);

        logger.log('🌱 Running database seeder...');
        await seedDatabase(dataSource);

        logger.log('✅ Seeding complete!');
        await app.close(); // ✅ Cleanly close the app context
    } catch (error) {
        logger.error('❌ Seeding failed:', error);
    } finally {
        await AppDataSource.destroy(); // ✅ Properly close the database connection
    }
}

async function seedDatabase(
    dataSource: DataSource,
) {
    const logger = new Logger("SeederUtils"); // This names the logs after the class
    try {
        logger.log('🔍 Running database seed for development environment...');
        
        
        logger.log('✅ Seeding successfully');
    } catch (error) {
        logger.error('❌ Error seeding database:', error);
    }
}

runSeeder();
