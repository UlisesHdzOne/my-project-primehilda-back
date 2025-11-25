import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { StudentService } from '../student/student.service';
import { CreateStudentDto } from '../dto/create-student.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';

@Controller('students')
export class StudentController {
  constructor(private readonly service: StudentService) {}

  @Post()
  create(@Body() data: CreateStudentDto) {
    return this.service.create(data);
  }

  // Controller
  @Get()
  findAll(@Query() pagination: PaginationQueryDto) {
    const skip = (pagination.page - 1) * pagination.limit;
    return this.service.findAllPagination(skip, pagination.limit);
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
