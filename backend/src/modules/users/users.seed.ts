import { UserEntity } from './users.entity';
import { UserRole } from './users.types';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';

export async function seedUsers(dataSource: DataSource) {
    const logger = new Logger('UserSeeder');
    logger.log('Running user seeding...');

    const users: Array<{
        username: string;
        password: string;
        email?: string;
        role: UserRole;
    }> = [
        {
            username: 'admin',
            password: 'admin123',
            email: 'admin@admin.com',
            role: UserRole.ADMIN,
        },
    ];

    const userRepo = dataSource.getRepository(UserEntity);

    for (const user of users) {
        const existing = await userRepo.findOne({ where: { username: user.username } });

        if (!existing) {
            logger.log(`Inserting user: ${user.username}`);
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await userRepo.save({ ...user, password: hashedPassword });
        } else {
            logger.log(`Skipping ${user.username}, already exists.`);
        }
    }

    logger.log('User seeding complete.');
}
