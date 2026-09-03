import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ReadinessService } from './readiness.service';

type DependencyStatus = 'up' | 'down';

@Controller('health')
export class HealthController {
  constructor(private readonly readiness: ReadinessService) {}

  @Get('live')
  live(): { status: 'live' } {
    return { status: 'live' };
  }

  @Get('ready')
  async ready(): Promise<{ status: 'ready' }> {
    let database: DependencyStatus = 'up';
    let objectStorage: DependencyStatus = 'up';

    try {
      await this.readiness.checkDatabase();
    } catch {
      database = 'down';
    }

    try {
      await this.readiness.checkObjectStorage();
    } catch {
      objectStorage = 'down';
    }

    if (database === 'up' && objectStorage === 'up') {
      return { status: 'ready' };
    }

    throw new ServiceUnavailableException({
      status: 'not_ready',
      dependencies: { database, objectStorage },
    });
  }
}
