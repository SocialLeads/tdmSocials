import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class UserContextInterceptor implements NestInterceptor {
  private readonly logger = new Logger(UserContextInterceptor.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // If no auth header, continue without user context
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.debug('No valid authorization header found');
      return next.handle();
    }

    try {
      const token = authHeader.substring(7);
      
      const payload = this.jwtService.verify(token);
      const username = payload.username || payload.sub;
      
      if (!username) {
        this.logger.warn('Invalid token: no username found');
        return next.handle();
      }

      this.logger.debug(`Decoded token for user: ${username}`);
      
      const user = await this.usersService.findByUsername(username);
      request.user = user;
      
      this.logger.debug(`Added user context: ${user.username}`);
      
    } catch (error: any) {
      this.logger.warn('Failed to decode JWT token:', error.message);
      // No throw - allows public endpoints to work even with invalid tokens
    }

    return next.handle();
  }
}
