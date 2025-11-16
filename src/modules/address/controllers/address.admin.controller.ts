import { Controller, Get, Param } from '@nestjs/common';
import { AddressAdminService } from '../services/address.admin.service';
import { Roles } from 'src/modules/auth/decorators/role.decorators';
import { Role } from 'src/common/constants/role.enum';

@Controller('admin/addresses')
export class AddressAdminController {
  constructor(private readonly addressAdminService: AddressAdminService) {}

  @Roles(Role.ADMIN)
  @Get(':userId')
  async getByUser(@Param('userId') userId: string) {
    return this.addressAdminService.getAddressesByUserId(Number(userId));
  }
}
