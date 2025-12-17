import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { DatabaseModule } from '@/core/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeeController],
  providers: [EmployeeService],
})
export class EmployeeModule {}
