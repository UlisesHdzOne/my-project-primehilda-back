import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WashOrderService } from './wash-order.service';
import { CreateWashOrderDto } from './dto/create-wash-order.dto';
import { UpdateWashOrderDto } from './dto/update-wash-order.dto';

@Controller('wash-order')
export class WashOrderController {
  constructor(private readonly washOrderService: WashOrderService) {}

  @Post()
  create(@Body() createWashOrderDto: CreateWashOrderDto) {
    return this.washOrderService.create(createWashOrderDto);
  }

  @Get()
  findAll() {
    return this.washOrderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.washOrderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWashOrderDto: UpdateWashOrderDto) {
    return this.washOrderService.update(+id, updateWashOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.washOrderService.remove(+id);
  }
}
