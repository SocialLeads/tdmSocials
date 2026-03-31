import { IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from './users.types';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class UserDto {
    @ApiProperty({ description: 'Unique identifier for the user' })
    @Expose()
    id!: string;

    @ApiProperty({ example: 'john.doe', description: 'Username of the user' })
    @Expose()
    username!: string;

    @ApiProperty({ example: 'john.doe@example.com', description: 'User email address' })
    @Expose()
    email!: string | null;

    @ApiProperty({ example: 'ADMIN', enum: UserRole, description: 'Role of the user' })
    @Expose()
    role!: UserRole;

    @ApiProperty({ description: 'User creation timestamp' })
    @Expose()
    createdAt!: Date;

    @ApiProperty({ description: 'User last update timestamp' })
    @Expose()
    updatedAt!: Date;

    @Exclude()
    password!: string;
}

export class CreateUserDto {
    @IsString()
    @ApiProperty({ example: 'johndoe' })
    username: string;

    @IsString()
    @ApiProperty({ example: 'strongpassword' })
    password: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'john.doe@example.com', required: false })
    email?: string;

    @IsOptional()
    @IsEnum(UserRole)
    @ApiProperty({ example: UserRole.ADMIN, enum: UserRole, required: false })
    role: UserRole = UserRole.USER;
}

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'newusername', required: false })
    username?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'newpassword', required: false })
    password?: string;

    @IsOptional()
    @IsEnum(UserRole)
    @ApiProperty({ example: UserRole.USER, enum: UserRole, required: false })
    role?: UserRole;
}
