import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get('live')
  live(): { status: 'live' } {
    return { status: 'live' };
  }

  @Get('ready')
  ready(): { status: 'ready' } {
    return { status: 'ready' };
  }
}
