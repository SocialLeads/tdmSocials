import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
    Inject,
    forwardRef,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';

import { UsersService } from '../../users/users.service';
import { UserDto } from '../../users/users.dto';
import { TOKEN_TYPE } from '../auth.types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(
        private readonly reflector: Reflector,
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
        if (isPublic) return true;

        const request = context.switchToHttp().getRequest();

        const authHeader = request.headers['authorization'];
        const token =
            authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
                ? authHeader.split(' ')[1]
                : null;

        if (!token) {
            throw new UnauthorizedException('Missing token');
        }

        let decoded: any;
        try {
            decoded = this.jwtService.verify(token, {
                secret: process.env.APP_JWT_SECRET ?? this.configService.get('app.jwtSecret'),
            });
        } catch {
            throw new UnauthorizedException('Invalid token');
        }

        if (decoded?.tokenType && decoded.tokenType !== TOKEN_TYPE.USER) {
            throw new UnauthorizedException('Unsupported token type');
        }

        request.user = decoded;

        const canActivate = (await super.canActivate(context)) as boolean;
        if (!canActivate) return false;

        const userPayload = request.user;

        if (!userPayload?.username) {
            throw new UnauthorizedException('Invalid token payload');
        }

        const fullUser = await this.usersService.findByUsername(userPayload.username);
        if (!fullUser) {
            throw new UnauthorizedException('User not found');
        }

        request.user = plainToInstance(UserDto, fullUser, {
            excludeExtraneousValues: true,
        });

        return true;
    }
}
