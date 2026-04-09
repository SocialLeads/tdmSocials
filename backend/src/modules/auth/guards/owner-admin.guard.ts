import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { UserEntity } from '../../users/users.entity';
import { UserRole } from '../../users/users.types';

@Injectable()
export class OwnerOrAdminGuard implements CanActivate {
    private readonly logger = new Logger(OwnerOrAdminGuard.name);

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user: UserEntity = request.user; // ✅ Now should be fully typed
        const requestedUsername = request.params.username;

        this.logger.debug(`Checking access for user: ${user?.username}`);

        if (!user) {
            this.logger.warn(`Access denied: No user found in request.`);
            throw new ForbiddenException('Access denied: You must be logged in.');
        }

        if (!user.username || !user.role) {
            this.logger.warn(`Access denied: User object does not have required properties.`);
            throw new ForbiddenException('Invalid authentication data.');
        }

        if (user.role === UserRole.ADMIN) return true; // ✅ Allow admins
        if (user.username === requestedUsername) return true; // ✅ Allow user to view own profile

        this.logger.warn(`Unauthorized attempt by ${user.username} to access ${requestedUsername}`);
        throw new ForbiddenException('You do not have permission to access this resource.');
    }
}
