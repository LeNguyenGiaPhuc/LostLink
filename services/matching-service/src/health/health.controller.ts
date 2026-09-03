import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DatabaseReadinessService } from './database-readiness.service';

@Controller('health')
export class HealthController {
  constructor(private readonly databaseReadiness: DatabaseReadinessService) {}

  @Get('live')
  live(): { status: 'live' } {
    return { status: 'live' };
  }

  @Get('ready')
  async ready(): Promise<{ status: 'ready' }> {
    try {
      await this.databaseReadiness.check();
      return { status: 'ready' };
    } catch {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        dependencies: { database: 'down' },
      });
    }
  }
}
