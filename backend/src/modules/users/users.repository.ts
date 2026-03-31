import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './users.entity';
import { CreateUserDto } from './users.dto';
import { DatabaseOperationError } from 'src/shared/exceptions/errors';

@Injectable()
export class UsersRepository {
    private readonly logger = new Logger(UsersRepository.name);

    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
    ) {}

    async findAll(): Promise<UserEntity[]> {
        try {
            return await this.usersRepository.find();
        } catch (error: any) {
            this.logger.error('Failed to fetch users', error.stack);
            throw new DatabaseOperationError(`Failed to fetch users: ${(error as Error).message}`);
        }
    }

    async createUser(user: CreateUserDto): Promise<UserEntity> {
        try {
            const newUser = this.usersRepository.create(user);
            return await this.usersRepository.save(newUser);
        } catch (error: any) {
            this.logger.error(`Failed to create user: ${JSON.stringify(user)}`, error.stack);
            throw new DatabaseOperationError(`Failed to create user: ${(error as Error).message}`);
        }
    }

    async updateUser(username: string, updates: Partial<UserEntity>): Promise<UserEntity | null> {
        try {
            const result = await this.usersRepository
                .createQueryBuilder()
                .update(UserEntity)
                .set(updates)
                .where('username = :username', { username })
                .returning('*')
                .execute();

            return result.raw[0] ?? null;
        } catch (error: any) {
            this.logger.error(`Failed to update user ${username}`, error.stack);
            throw new DatabaseOperationError(`Failed to update user: ${(error as Error).message}`);
        }
    }

    async deleteUser(username: string): Promise<void> {
        try {
            await this.usersRepository.delete({ username });
        } catch (error: any) {
            this.logger.error(`Failed to delete user ${username}`, error.stack);
            throw new DatabaseOperationError(`Failed to delete user: ${(error as Error).message}`);
        }
    }

    async findByUsername(username: string): Promise<UserEntity | null> {
        try {
            return await this.usersRepository.findOneBy({ username });
        } catch (error: any) {
            this.logger.error(`Failed to find user by username ${username}`, error.stack);
            throw new DatabaseOperationError(`Failed to find user: ${(error as Error).message}`);
        }
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        try {
            return await this.usersRepository.findOneBy({ email });
        } catch (error: any) {
            this.logger.error(`Failed to find user by email ${email}`, error.stack);
            throw new DatabaseOperationError(`Failed to find user by email: ${(error as Error).message}`);
        }
    }

    async findById(id: string): Promise<UserEntity | null> {
        try {
            return await this.usersRepository.findOneBy({ id });
        } catch (error: any) {
            this.logger.error(`Failed to find user by ID ${id}`, error.stack);
            throw new DatabaseOperationError(`Failed to find user by ID: ${(error as Error).message}`);
        }
    }

    async updateUserById(id: string, updates: Partial<UserEntity>): Promise<UserEntity | null> {
        try {
            const result = await this.usersRepository
                .createQueryBuilder()
                .update(UserEntity)
                .set(updates)
                .where('id = :id', { id })
                .returning('*')
                .execute();

            return result.raw[0] ?? null;
        } catch (error: any) {
            this.logger.error(`Failed to update user ID ${id}`, error.stack);
            throw new DatabaseOperationError(`Failed to update user: ${(error as Error).message}`);
        }
    }
}
