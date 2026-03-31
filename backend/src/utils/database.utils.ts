import { DataSource } from 'typeorm';
import * as process from "process";
import {Logger} from "@nestjs/common";

const logger = new Logger("DatabaseUtils"); // This names the logs after the class
export async function initializeDatabase(dataSource: DataSource) {

    try {
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
            logger.log('✅ Database connection established');
        } else {
            logger.log('⚠ Database connection already exists.');
        }
    } catch (error) {
        logger.error('❌ Error connecting to the database:', error);
        process.exit(1); // Stop the app if DB connection fails
    }
}

export async function clearDatabase(dataSource: DataSource) {
    try {
        logger.log('🔄 Starting to clear the database...');

        // Initialize database connection if not already
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
        }

        // Get all entities (tables) from the dataSource
        const entities = dataSource.entityMetadatas;

        // Start transaction for atomic operations
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            // Iterate through all entities and drop/truncate them
            for (const entity of entities) {
                const tableName = entity.tableName;
                logger.log(`⚠ Dropping/Truncating table: ${tableName}`);
                await queryRunner.query(`TRUNCATE TABLE "${tableName}" CASCADE;`);
            }

            // Commit the transaction after successful operation
            await queryRunner.commitTransaction();
            logger.log('✅ Database cleared successfully.');
        } catch (error) {
            // If there's an error, rollback the transaction
            await queryRunner.rollbackTransaction();
            logger.error('❌ Error clearing the database:', error);
        } finally {
            // Release the query runner (cleanup)
            await queryRunner.release();
        }
    } catch (error) {
        logger.error('❌ Error initializing database or clearing tables:', error);
    }
}

export function applyFilters(
    queryBuilder: any,
    filters: { [key: string]: any }, 
    alias: string,
) {
    // Loop through the filters and apply them to the queryBuilder
    Object.entries(filters).forEach(([key, value], index) => {
        if (value === undefined) return;  // Skip undefined values

        const condition = `${alias}.${key}`;
        const param = { [key]: value };

        if (Array.isArray(value)) {
            queryBuilder[index === 0 ? 'where' : 'andWhere'](`${condition} IN (:...${key})`, param);
        } else {
            queryBuilder[index === 0 ? 'where' : 'andWhere'](`${condition} = :${key}`, param);
        }
    });
}








