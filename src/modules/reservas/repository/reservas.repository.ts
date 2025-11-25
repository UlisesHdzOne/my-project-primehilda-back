import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Reserva, Sala, User } from '@prisma/client';
import { CreateReservaDto } from '../dto/create-reserva.dto';
import { UpdateReservaDto } from '../dto/update-reserva.dto';

@Injectable()
export class ReservaRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 1️ Crear reserva
  create(data: CreateReservaDto): Promise<Reserva> {
    return this.prisma.reserva.create({
      data,
    });
  }

  // 2️ Listar todas las reservas con usuario y sala
  findAllWithRelations(): Promise<(Reserva & { user: User; sala: Sala })[]> {
    return this.prisma.reserva.findMany({
      include: { user: true, sala: true },
    });
  }

  // 3️ Obtener reserva por ID con usuario y sala
  findOneWithRelations(id: number): Promise<(Reserva & { user: User; sala: Sala }) | null> {
    return this.prisma.reserva.findUnique({
      where: { id },
      include: { user: true, sala: true },
    });
  }

  // 4️ Actualizar reserva
  update(id: number, data: UpdateReservaDto): Promise<Reserva> {
    return this.prisma.reserva.update({ where: { id }, data });
  }

  // 5️ Eliminar reserva
  remove(id: number): Promise<Reserva> {
    return this.prisma.reserva.delete({ where: { id } });
  }

  // 6️ Verificar existencia
  async existsById(id: number): Promise<boolean> {
    const count = await this.prisma.reserva.count({ where: { id } });
    return count > 0;
  }
}
