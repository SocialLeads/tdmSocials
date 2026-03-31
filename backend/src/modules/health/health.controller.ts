import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Public } from '../auth/guards/auth.decorators';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('live')
  @Public()
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  @Public()
  async ready() {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok', db: 'up' };
    } catch (error) {
      throw new HttpException(
        { status: 'degraded', db: 'down', error: (error as Error).message },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
