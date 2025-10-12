import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from '../services/address.service';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { AddressEntity } from '../entities/address.entity';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  async createAddress(
    @Body() dto: CreateAddressDto,
    @UserId() userId: number,
  ): Promise<AddressEntity> {
    return this.addressService.createAddress(dto, userId);
  }

  @Get()
  async getAddresses(@UserId() userId: number): Promise<AddressEntity[]> {
    return this.addressService.getAddresses(userId);
  }

  @Get('search')
  async searchAddresses(
    @UserId() userId: number,
    @Query('name') name: string,
  ): Promise<AddressEntity[]> {
    return this.addressService.searchAddresses(userId, name);
  }

  @Get(':id')
  async getAddressById(
    @Param('id') id: number,
    @UserId() userId: number,
  ): Promise<AddressEntity> {
    return this.addressService.getAddressById(id, userId);
  }

  @Patch(':id')
  async updateAddress(
    @Param('id') id: number,
    @Body() dto: UpdateAddressDto,
    @UserId() userId: number,
  ): Promise<AddressEntity> {
    return this.addressService.updateAddress(id, dto, userId);
  }

  @Delete(':id')
  async deleteAddress(
    @Param('id') id: number,
    @UserId() userId: number,
  ): Promise<{ message: string }> {
    return this.addressService.deleteAddress(id, userId);
  }

  @Patch(':id/default')
  async setDefaultAddress(
    @Param('id') id: number,
    @UserId() userId: number,
  ): Promise<AddressEntity> {
    return this.addressService.setDefaultAddress(id, userId);
  }
}
