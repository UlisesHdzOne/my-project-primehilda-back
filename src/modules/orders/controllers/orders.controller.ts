import {
  Controller,
  Post,
  Get,
  Param,
  Put,
  Delete,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../auth/decorators/role.decorators';
import { UserId } from '../../../common/decorators/user-id.decorator';
import { Role } from 'src/common/constants/role.enum';
import { FilterOrdersDto } from '../dto/filter-orders.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Crear pedido
  @Post()
  @Roles(Role.ADMIN, Role.EDITOR)
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @UserId() userId: number,
  ) {
    return this.ordersService.create(createOrderDto, userId);
  }

  // Listar pedidos con filtros opcionales
  @Get()
  @Roles(Role.ADMIN, Role.EDITOR)
  async findAll(@Query() filters: FilterOrdersDto) {
    return this.ordersService.findAll(filters);
  }

  // Obtener pedido por ID
  @Get(':id')
  @Roles(Role.ADMIN, Role.EDITOR)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  // Actualizar estado de pedido
  @Put(':id/status')
  @Roles(Role.ADMIN, Role.EDITOR)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(
      id,
      dto.status,
      dto.confirmedDeliveryTime,
    );
  }

  // Cancelar pedido
  @Delete(':id')
  @Roles(Role.ADMIN, Role.EDITOR)
  async cancel(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.cancel(id);
  }
}
