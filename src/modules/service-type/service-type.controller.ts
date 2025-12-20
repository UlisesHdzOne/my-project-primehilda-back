import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ServiceTypeService } from './service-type.service';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';
import { FindServiceTypesQueryDto } from './dto/find-service-types-query.dto';

@Controller('service-type')
export class ServiceTypeController {
  constructor(private readonly serviceTypeService: ServiceTypeService) {}

  @Post()
  create(@Body() createServiceTypeDto: CreateServiceTypeDto) {
    return this.serviceTypeService.create(createServiceTypeDto);
  }

  @Get()
  findAll(query: FindServiceTypesQueryDto) {
    return this.serviceTypeService.findAll(query);
  }

  @Get('stats') // ✅ Nuevo endpoint para estadísticas
  getServiceStats() {
    return this.serviceTypeService.getServiceStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceTypeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceTypeDto: UpdateServiceTypeDto) {
    return this.serviceTypeService.update(+id, updateServiceTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceTypeService.remove(+id);
  }
}
