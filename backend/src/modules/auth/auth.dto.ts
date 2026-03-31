import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'john.doe@example.com', description: 'Email or username for login' })
    @IsString()
    @IsNotEmpty()
    identifier: string;

    @ApiProperty({ example: 'password123', description: 'Password for login' })
    @IsString()
    @IsNotEmpty()
    password: string;
}

export class RegisterDto {
    @ApiProperty({ example: 'john.doe@example.com', description: 'Email for registration' })
    @IsString()
    @IsNotEmpty()
    email?: string;

    @ApiProperty({ example: 'john.doe', description: 'Optional username; defaults to email if omitted', required: false })
    @IsOptional()
    @IsString()
    username: string;

    @ApiProperty({ example: 'password123', description: 'Password for registration' })
    @IsString()
    @IsNotEmpty()
    password: string;
}

export class PasswordResetRequestDto {
    @ApiProperty({ example: 'john.doe@example.com' })
    @IsString()
    @IsNotEmpty()
    email: string;
}

export class PasswordResetDto {
    @ApiProperty({ description: 'Password reset token' })
    @IsString()
    @IsNotEmpty()
    token: string;

    @ApiProperty({ description: 'New password' })
    @IsString()
    @IsNotEmpty()
    newPassword: string;
}

export class ValidateResetTokenDto {
    @ApiProperty({ description: 'Password reset token' })
    @IsString()
    @IsNotEmpty()
    token: string;
}

export class ValidateResetTokenResponseDto {
    @ApiProperty({ description: 'Whether the reset token is valid' })
    valid: boolean;
}

export class LoginResponseDto {
    @ApiProperty({ description: 'JWT access token' })
    accessToken: string;

    @ApiProperty({ description: 'User role' })
    role: string;
}
