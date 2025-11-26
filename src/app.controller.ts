import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  
  getHello(): { message: string } {
    return { message: this.appService.getHello() };
  }

  @Get('health')
  
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      port: process.env.PORT,
    };
  }

  @Get('test')
  
  getTestData() {
    return {
      users: [
        { id: 1, name: 'Test User 1', email: 'test1@example.com' },
        { id: 2, name: 'Test User 2', email: 'test2@example.com' },
      ],
      total: 2,
      message: 'Datos de prueba',
    };
  }
}
