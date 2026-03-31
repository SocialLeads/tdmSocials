import { Injectable, Logger, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../users/users.entity';
import { AuthenticationError } from '../../shared/exceptions/errors';
import { ConfigService } from '@nestjs/config';
import { EntityNotFoundError } from 'typeorm';
import { RegisterDto } from './auth.dto';
import { TOKEN_TYPE } from './auth.types';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly resetTokenSecret = this.configService.get<string>('app.jwtResetSecret', this.configService.get<string>('app.jwtSecret', 'superSecret123'));
    private readonly resetTokenExpiry = this.configService.get<string>('app.jwtResetExpiry', '15m');

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    private async findByIdentifier(identifier: string): Promise<UserEntity> {
        const looksLikeEmail = identifier.includes('@');
        const byEmail = looksLikeEmail ? await this.usersService.findByEmail(identifier) : null;
        if (byEmail) return byEmail;
        return await this.usersService.findByUsername(identifier);
    }

    async validateUser(identifier: string, password: string) {
        this.logger.log(`Login attempt from identifier: ${identifier}`);

        const user: UserEntity | null = await this.findByIdentifier(identifier).catch(() => null);
        if (!user) throw new EntityNotFoundError('User', identifier);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new AuthenticationError();

        return {
            user,
            accessToken: this.generateAccessToken(user),
            refreshToken: this.generateRefreshToken(user),
        };
    }

    async registerUser(registerDto: RegisterDto) {
        const username = registerDto.username?.trim();
        if (!username) throw new BadRequestException('Username is required');

        const existingUsername = await this.usersService.findByUsername(username).catch(() => null);
        if (existingUsername) throw new BadRequestException('Username is already in use');

        if (registerDto.email) {
            const existingEmail = await this.usersService.findByEmail(registerDto.email);
            if (existingEmail) throw new BadRequestException('Email is already in use');
        }

        const user = await this.usersService.createUser({
            username,
            email: registerDto.email,
            password: registerDto.password,
        } as any);

        return {
            user,
            accessToken: this.generateAccessToken(user),
            refreshToken: this.generateRefreshToken(user),
            role: user.role,
        };
    }

    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('app.jwtRefreshSecret', this.configService.get<string>('app.jwtSecret', 'superSecret123')),
            });

            const user = await this.usersService.findByUsername(payload.username);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            return {
                accessToken: this.generateAccessToken(user),
                refreshToken: this.generateRefreshToken(user),
            };
        } catch (error) {
            this.logger.error(`Token refresh failed: ${(error as Error).message}`);
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async requestPasswordReset(email: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new NotFoundException('User with this email does not exist');
        }

        const token = this.jwtService.sign(
            { email, type: 'password_reset' },
            { secret: this.resetTokenSecret, expiresIn: this.resetTokenExpiry },
        );

        // TODO: send token via email provider
        return { resetToken: token };
    }

    async validateResetToken(token: string) {
        try {
            const payload = this.jwtService.verify(token, { secret: this.resetTokenSecret });
            if (payload.type !== 'password_reset') {
                throw new BadRequestException('Invalid reset token type');
            }

            const user = await this.usersService.findByEmail(payload.email);
            if (!user) {
                throw new NotFoundException('User not found for reset token');
            }

            return { valid: true };
        } catch (error: any) {
            this.logger.error(`Reset token validation failed: ${error?.message || error}`);
            throw new BadRequestException('Invalid or expired reset token');
        }
    }

    async resetPassword(token: string, newPassword: string) {
        try {
            const payload = this.jwtService.verify(token, { secret: this.resetTokenSecret });
            if (payload.type !== 'password_reset') {
                throw new BadRequestException('Invalid reset token type');
            }

            const user = await this.usersService.findByEmail(payload.email);
            if (!user) {
                throw new NotFoundException('User not found for reset token');
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.usersService.updateUser(user.id.toString(), { password: hashedPassword });

            return { message: 'Password reset successful' };
        } catch (error: any) {
            this.logger.error(`Password reset failed: ${error?.message || error}`);
            throw new BadRequestException('Invalid or expired reset token');
        }
    }

    generateAccessToken(user: UserEntity) {
        return this.jwtService.sign(
            {
                sub: user.id,
                username: user.username,
                role: user.role,
                tokenType: TOKEN_TYPE.USER,
            },
            {
                expiresIn: this.configService.get<string>('app.jwtAccessExpiry', '1h'),
                secret: this.configService.get<string>('app.jwtSecret', 'superSecret123'),
            },
        );
    }

    generateRefreshToken(user: UserEntity) {
        return this.jwtService.sign(
            { username: user.username },
            {
                expiresIn: this.configService.get<string>('app.jwtRefreshExpiry', '7d'),
                secret: this.configService.get<string>('app.jwtRefreshSecret', 'superSecret123'),
            },
        );
    }
}
