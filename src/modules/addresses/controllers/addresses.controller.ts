import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AddressesService } from '../services/addresses.service';
import { CreateAddressDto } from '../dtos/requests/create-address.dto';
import { UpdateAddressDto } from '../dtos/requests/update-address.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserId } from 'src/common/decorators/user-id.decorator';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  async create(@UserId() userId: number, @Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(userId, createAddressDto);
  }

  @Get()
  async findAll(@UserId() userId: number) {
    return this.addressesService.findByUserId(userId);
  }

  @Get('default')
  async findDefault(@UserId() userId: number) {
    return this.addressesService.findDefaultByUserId(userId);
  }

  @Get(':id')
  async findOne(@UserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.addressesService.findById(id, userId);
  }

  @Put(':id')
  async update(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(id, userId, updateAddressDto);
  }

  @Put(':id/default')
  async setDefault(@UserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.addressesService.setDefault(id, userId);
  }

  @Delete(':id')
  async delete(@UserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.addressesService.delete(id, userId);
  }
}
