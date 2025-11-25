import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { SalasRepository } from '../repository/salas.repository';
import { Sala } from '@prisma/client';
import { CreateSalaDto } from '../dto/create-sala.dto';
import { UpdateSalaDto } from '../dto/update-sala.dto';

@Injectable()
export class SalasService {
  constructor(private readonly salasRepository: SalasRepository) {}

  // Crear sala
  async createSala(data: CreateSalaDto): Promise<Sala> {
    const exists = await this.salasRepository.existsByName(data.name);
    if (exists) {
      throw new ConflictException('Sala already exists');
    }
    return this.salasRepository.create(data);
  }

  // Listar todas las salas
  async getAllSalas(): Promise<Sala[]> {
    return this.salasRepository.findAll();
  }

  // Obtener sala por ID
  async getSalaById(id: number): Promise<Sala> {
    const sala = await this.salasRepository.findOne(id);
    if (!sala) {
      throw new NotFoundException('Sala not found');
    }
    return sala;
  }

  // Actualizar sala
  async updateSala(id: number, updateData: UpdateSalaDto): Promise<Sala> {
    const sala = await this.salasRepository.findOne(id);
    if (!sala) {
      throw new NotFoundException('Sala not found');
    }

    // Opcional: validar nombre duplicado si cambia
    if (updateData.name && updateData.name !== sala.name) {
      const nameExists = await this.salasRepository.existsByName(updateData.name);
      if (nameExists) {
        throw new ConflictException('Another sala with this name already exists');
      }
    }

    return this.salasRepository.update(id, updateData);
  }

  // Eliminar sala
  async deleteSala(id: number): Promise<Sala> {
    const sala = await this.salasRepository.findOne(id);
    if (!sala) {
      throw new NotFoundException('Sala not found');
    }
    return this.salasRepository.remove(id);
  }
}
