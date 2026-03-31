import { ConfigService } from '@nestjs/config';

export function buildRedisConfig(configService: ConfigService) {
  const redisConfig: any = {
    host: configService.get<string>('app.redisHost'),
    port: parseInt(configService.get<string>('app.redisPort', '6379'), 10),
  };

  const password = configService.get<string>('app.redisPassword');
  if (password && configService.get<string>('app.nodeEnv') === 'production') {
    redisConfig.password = password;
  }

  return redisConfig;
}