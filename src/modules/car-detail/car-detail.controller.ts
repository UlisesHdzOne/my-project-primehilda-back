import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CarDetailService } from './car-detail.service';
import { CreateCarDetailDto } from './dto/create-car-detail.dto';
import { UpdateCarDetailDto } from './dto/update-car-detail.dto';
import { FindCarDetailsQueryDto } from './dto/find-car-details-query.dto';

@Controller('car-detail')
export class CarDetailController {
  constructor(private readonly carDetailService: CarDetailService) {}

  @Post()
  create(@Body() createCarDetailDto: CreateCarDetailDto) {
    return this.carDetailService.create(createCarDetailDto);
  }

  @Get()
  findAll(@Query() query: FindCarDetailsQueryDto) {
    return this.carDetailService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carDetailService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarDetailDto: UpdateCarDetailDto) {
    return this.carDetailService.update(+id, updateCarDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carDetailService.remove(+id);
  }
}
