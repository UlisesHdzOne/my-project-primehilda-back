import { DatabaseService } from '../database/database.service';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('System Health')
@Controller('health')
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}
  @Get()
  @ApiOperation({ summary: 'Check system health' })
  async checkHealth() {
    const dbStatus = await this.databaseService.checkConnection();
    return {
      status: dbStatus.status === 'ok' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
    };
  }
}
