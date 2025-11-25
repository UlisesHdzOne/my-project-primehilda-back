import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { SalasService } from '../service/salas.service';
import { CreateSalaDto } from '../dto/create-sala.dto';
import { UpdateSalaDto } from '../dto/update-sala.dto';
import { Sala } from '@prisma/client';

@Controller('salas')
export class SalasController {
  constructor(private readonly salasService: SalasService) {}

  // Crear sala
  @Post()
  async create(@Body() createSalaDto: CreateSalaDto): Promise<Sala> {
    return this.salasService.createSala(createSalaDto);
  }

  // Listar todas las salas
  @Get()
  async findAll(): Promise<Sala[]> {
    return this.salasService.getAllSalas();
  }

  // Obtener sala por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Sala> {
    return this.salasService.getSalaById(id);
  }

  // Actualizar sala
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSalaDto: UpdateSalaDto,
  ): Promise<Sala> {
    return this.salasService.updateSala(id, updateSalaDto);
  }

  // Eliminar sala
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Sala> {
    return this.salasService.deleteSala(id);
  }
}
