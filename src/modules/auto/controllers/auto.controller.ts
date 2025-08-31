import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { AutoService } from '../services/auto.service';
import { CreateAutoDto } from '../dto/create-auto.dto';
import type { AuthRequest } from 'src/types/express';
import { AutoResponseDto } from '../dto/auto-response.dto';
import { UpdateAutoDto } from '../dto/update-auto.dto';

@Controller('auto')
export class AutoController {
  constructor(private readonly autoService: AutoService) {}

  @Post()
  async crearAuto(
    @Body() dto: CreateAutoDto,
    @Req() req: AuthRequest,
  ): Promise<AutoResponseDto> {
    return this.autoService.crearAuto(dto, req.user.id);
  }

  @Patch(':id')
  async updateAuto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAutoDto,
    @Req() req: AuthRequest,
  ): Promise<AutoResponseDto> {
    return this.autoService.updateAuto(id, dto, req.user.id);
  }
}
