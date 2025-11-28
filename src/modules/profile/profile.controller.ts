import { Controller, Get, Put, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from '@/common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';

@UseInterceptors(ResponseInterceptor)
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  getMyProfile(@User('id') userId: number) {
    return this.profileService.getMyProfile(userId);
  }

  @Put()
  updateMyProfile(
  @User('id') userId: number,
  @Body() data: UpdateProfileDto) {
    return this.profileService.updateMyProfile(userId, data);
  }
}
