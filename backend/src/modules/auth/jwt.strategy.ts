import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private configService: ConfigService) {
        const secret = configService.get<string>('app.jwtSecret');
        if (!secret) throw new Error('JWT_SECRET environment variable is not set');

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
  }

  async validate(payload: any) {
    if (!payload || !payload.username) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return payload;
  }
}
