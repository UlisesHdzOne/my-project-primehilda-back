import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { StudentService } from '../student/student.service';
import { CreateStudentDto } from '../dto/create-student.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';

@Controller('students')
export class StudentController {
  constructor(private readonly service: StudentService) {}

  @Post()
  create(@Body() data: CreateStudentDto) {
    return this.service.create(data);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateStudentDto) {
    return this.service.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
