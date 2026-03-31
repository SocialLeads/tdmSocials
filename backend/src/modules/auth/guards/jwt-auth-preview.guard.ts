import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthPreviewGuard extends AuthGuard('jwt') {
    constructor(private jwtService: JwtService) {
        super();
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.query.token || request.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            // Verify token manually
            const payload = this.jwtService.verify(token);
            request.user = payload;
            return true;
        } catch (error) {
            // If query token fails, try standard auth
            return super.canActivate(context);
        }
    }
}