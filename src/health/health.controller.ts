import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('System Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check system health' })
  checkHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }
}