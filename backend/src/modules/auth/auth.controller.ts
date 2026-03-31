import { Controller, Post, Body, Req, Res, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
    LoginDto,
    LoginResponseDto,
    RegisterDto,
    PasswordResetRequestDto,
    PasswordResetDto,
    ValidateResetTokenDto,
    ValidateResetTokenResponseDto,
} from './auth.dto';
import { Public } from './guards/auth.decorators';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('login')
    @Public()
    @ApiOperation({ summary: 'User login' })
    @ApiResponse({ status: 200, type: LoginResponseDto })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() loginDto: LoginDto, @Res() res: Response): Promise<Response> {
        this.logger.log(`Login attempt for identifier: ${loginDto.identifier}`);

        const { accessToken, refreshToken, user } = await this.authService.validateUser(loginDto.identifier, loginDto.password);

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/auth/refresh',
        });

        return res.json({
            accessToken,
            role: user.role,
        } as LoginResponseDto);
    }

    @Post('register')
    @Public()
    @ApiOperation({ summary: 'User registration' })
    async register(@Body() registerDto: RegisterDto, @Res() res: Response): Promise<Response> {
        this.logger.log(`Registration attempt for username: ${registerDto.username}`);

        const { accessToken, refreshToken, user } = await this.authService.registerUser(registerDto);

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/auth/refresh',
        });

        return res.json({
            accessToken,
            role: user.role,
        } as LoginResponseDto);
    }

    @Post('refresh')
    @Public()
    @ApiOperation({ summary: 'Refresh token' })
    @ApiResponse({ status: 200, type: LoginResponseDto })
    @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
    async refreshToken(@Req() req: Request, @Res() res: Response): Promise<Response> {
        const refreshToken = req.cookies['refresh_token'];
        if (!refreshToken) {
            throw new UnauthorizedException('No refresh token provided');
        }

        const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshToken(refreshToken);

        res.cookie('refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/auth/refresh',
        });

        return res.json({ accessToken });
    }

    @Post('password-reset/request')
    @Public()
    @ApiOperation({ summary: 'Request password reset token' })
    async requestPasswordReset(@Body() body: PasswordResetRequestDto, @Res() res: Response) {
        const { resetToken } = await this.authService.requestPasswordReset(body.email);

        res.cookie('reset_token', resetToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
            path: '/auth/password-reset/confirm',
        });

        return res.json({ message: 'Password reset token issued' });
    }

    @Post('password-reset/validate')
    @Public()
    @ApiOperation({ summary: 'Validate password reset token' })
    @ApiResponse({ status: 200, type: ValidateResetTokenResponseDto })
    async validateResetToken(@Body() body: ValidateResetTokenDto): Promise<ValidateResetTokenResponseDto> {
        return this.authService.validateResetToken(body.token);
    }

    @Post('password-reset/confirm')
    @Public()
    @ApiOperation({ summary: 'Reset password using token' })
    async resetPassword(@Body() body: PasswordResetDto, @Req() req: Request, @Res() res: Response) {
        const token = body.token || req.cookies['reset_token'];
        await this.authService.resetPassword(token, body.newPassword);

        res.clearCookie('reset_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/auth/password-reset/confirm',
        });

        return res.json({ message: 'Password reset successfully' });
    }

    @Post('logout')
    @ApiOperation({ summary: 'User logout' })
    async logout(@Res() res: Response) {
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/auth/refresh',
        });

        return res.json({ message: 'Logged out successfully' });
    }
}
