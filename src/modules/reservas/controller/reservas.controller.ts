import { Controller, Get, Post, Param, Body, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { ReservasService } from '../service/reservas.service';
import { CreateReservaDto } from '../dto/create-reserva.dto';
import { UpdateReservaDto } from '../dto/update-reserva.dto';
import { ReservaResponseDto } from '../dto/response/reserva-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('reserva')
export class ReservasController {
  constructor(private readonly reservaService: ReservasService) {}

  @Post()
  async create(@Body() createReservaDto: CreateReservaDto): Promise<ReservaResponseDto> {
    const reserva = await this.reservaService.createReserva(createReservaDto);
    return plainToInstance(ReservaResponseDto, reserva);
  }

  @Get()
  async findAll(): Promise<ReservaResponseDto[]> {
    const reservas = await this.reservaService.getAllReservas();
    return plainToInstance(ReservaResponseDto, reservas);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ReservaResponseDto> {
    const reserva = await this.reservaService.getReservaById(id);
    return plainToInstance(ReservaResponseDto, reserva);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservaDto: UpdateReservaDto,
  ): Promise<ReservaResponseDto> {
    const updatedReserva = await this.reservaService.updateReserva(id, updateReservaDto);
    return plainToInstance(ReservaResponseDto, updatedReserva);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ReservaResponseDto> {
    const deletedReserva = await this.reservaService.deleteReserva(id);
    return plainToInstance(ReservaResponseDto, deletedReserva);
  }
}
