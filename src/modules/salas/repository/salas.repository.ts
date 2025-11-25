import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Sala } from '@prisma/client';
import { CreateSalaDto } from '../dto/create-sala.dto';
import { UpdateSalaDto } from '../dto/update-sala.dto';

@Injectable()
export class SalasRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Crear sala
  create(data: CreateSalaDto): Promise<Sala> {
    return this.prisma.sala.create({ data });
  }

  // Listar todas las salas
  findAll(): Promise<Sala[]> {
    return this.prisma.sala.findMany();
  }

  // Obtener sala por ID
  findOne(id: number): Promise<Sala | null> {
    return this.prisma.sala.findUnique({ where: { id } });
  }

  // Actualizar sala
  update(id: number, data: UpdateSalaDto): Promise<Sala> {
    return this.prisma.sala.update({ where: { id }, data });
  }

  // Eliminar sala
  remove(id: number): Promise<Sala> {
    return this.prisma.sala.delete({ where: { id } });
  }

  // Utilidades

  // Verifica si existe sala por ID
  async existsById(id: number): Promise<boolean> {
    const count = await this.prisma.sala.count({ where: { id } });
    return count > 0;
  }

  // Opcional: verificar si ya existe una sala con el mismo nombre
  async existsByName(name: string): Promise<boolean> {
    const count = await this.prisma.sala.count({ where: { name } });
    return count > 0;
  }
}
