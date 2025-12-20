// src/modules/wash-order/wash-order.controller.ts - MODIFICADO
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { WashOrderService } from './wash-order.service';
import { UpdateWashOrderDto } from './dto/update-wash-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CreateWashOrderDto } from './dto/create-wash-order.dto';
import { FindWashOrdersQueryDto } from './dto/find-wash-orders-query.dto';

@Controller('wash-order')
export class WashOrderController {
  constructor(private readonly washOrderService: WashOrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createWashOrderDto: CreateWashOrderDto) {
    return this.washOrderService.create(createWashOrderDto);
  }

  @Get()
  findAll(@Query() query: FindWashOrdersQueryDto) {
    return this.washOrderService.findAll(query);
  }

  @Get('stats')
  getStats() {
    return this.washOrderService.getDashboardStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.washOrderService.findOne(+id);
  }

  @Get('car/:carId')
  findByCar(@Param('carId') carId: string, @Query() query: FindWashOrdersQueryDto) {
    return this.washOrderService.findOrdersByCar(+carId, query);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
    return this.washOrderService.updateStatus(+id, updateOrderStatusDto.status);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWashOrderDto: UpdateWashOrderDto) {
    return this.washOrderService.update(+id, updateWashOrderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.washOrderService.remove(+id);
  }
}
