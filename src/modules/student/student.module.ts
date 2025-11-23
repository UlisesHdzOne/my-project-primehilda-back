import { Module } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { StudentController } from './controller/student.controller';
import { StudentService } from './student/student.service';
import { StudentRepository } from './repository/student.repository';

@Module({
  
  controllers: [StudentController],
  providers: [StudentService, StudentRepository, PrismaService],
})
export class StudentModule {}
