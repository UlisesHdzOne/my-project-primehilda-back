import { Body, Controller, Post } from '@nestjs/common';
import type { CreateVehicleDto } from './dto/create-vehicle.dto';
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post('register')
  async register(@Body() dto: CreateVehicleDto) {
    const input = {
      plateNumber: dto.plateNumber,
      brand: dto.brand,
      model: dto.model,
      color: dto.color,
      notes: dto.notes,
    };
    return this.vehiclesService.register(input);
  }
}
