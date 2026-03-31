import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UserEntity } from './users.entity';
import { CreateUserDto } from './users.dto';
import { EntityNotFoundError } from '../../shared/exceptions/errors';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private readonly usersRepository: UsersRepository,
    ) {}

    async findAll(): Promise<UserEntity[]> {
        this.logger.debug('Fetching users...');
        return this.usersRepository.findAll();
    }

    async findByUsername(username: string): Promise<UserEntity> {
        const user = await this.usersRepository.findByUsername(username);
        if (!user) {
            throw new EntityNotFoundError('User', username);
        }
        return user;
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.usersRepository.findByEmail(email);
    }

    async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
        this.logger.log(`Creating user: ${createUserDto.username}`);

        const username = createUserDto.username || createUserDto.email;
        if (!username) {
            throw new BadRequestException('Username or email is required');
        }
        createUserDto.username = username;

        const existingUser = await this.usersRepository.findByUsername(createUserDto.username);
        if (existingUser) {
            throw new BadRequestException(`Username '${createUserDto.username}' is already taken.`);
        }

        if (createUserDto.email) {
            const existingEmail = await this.usersRepository.findByEmail(createUserDto.email);
            if (existingEmail) {
                throw new BadRequestException(`Email '${createUserDto.email}' is already taken.`);
            }
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        createUserDto.password = hashedPassword;

        return this.usersRepository.createUser(createUserDto);
    }

    async deleteUser(username: string): Promise<void> {
        await this.findByUsername(username);
        await this.usersRepository.deleteUser(username);
    }

    async findById(id: string): Promise<UserEntity> {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new EntityNotFoundError('User', id);
        }
        return user;
    }

    async updateUser(userId: string, updateData: Partial<UserEntity>): Promise<UserEntity> {
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);
        const updatedUser = isUuid
            ? await this.usersRepository.updateUserById(userId, updateData)
            : await this.usersRepository.updateUser(userId, updateData);

        if (!updatedUser) {
            throw new EntityNotFoundError('User', userId);
        }

        return updatedUser;
    }
}
