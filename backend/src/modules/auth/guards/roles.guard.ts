import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);

    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!requiredRoles) return true; // ✅ No roles required → allow access

        const request = context.switchToHttp().getRequest();
        const user = request.user; // ✅ Now safe to access because `JwtAuthGuard` ran first

        if (!user) {
            this.logger.warn(`Access denied: No user found in request.`);
            throw new ForbiddenException('Access denied: You must be logged in.');
        }

        if (!requiredRoles.includes(user.role)) {
            this.logger.warn(`Unauthorized attempt by ${user.username} with role ${user.role}`);
            throw new ForbiddenException('You do not have permission to access this resource.');
        }

        return true;
    }
}
