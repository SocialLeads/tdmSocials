import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('app.jwtSecret', 'superSecret123'), // ✅ Ensure this matches `auth.service.ts`
        });

        console.log("🔥 JwtStrategy Initialized with Secret:", configService.get<string>('app.jwtSecret'));
  }

  async validate(payload: any) {
    if (!payload) {
      throw new Error("Invalid token payload");
    }

    if (payload.freeTier) {
      if (!payload.sub) {
        throw new Error("Invalid Free Tier token payload");
      }
      return payload;
    }

    if (!payload.username) {
      console.error("❌ Invalid JWT Payload - Missing username:", payload);
      throw new Error("Invalid token payload");
    }

    return payload;
  }
}
