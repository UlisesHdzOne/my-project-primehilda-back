import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ReservaResponseDto } from '../dto/response/reserva-response.dto';
import { CreateReservaDto } from '../dto/create-reserva.dto';
import { UpdateReservaDto } from '../dto/update-reserva.dto';
import { ReservaRepository } from '../repository/reservas.repository';
import { Reserva } from '@prisma/client';

@Injectable()
export class ReservasService {
  constructor(private readonly reservaRepository: ReservaRepository) {}

  // 1️ Crear reserva
  async createReserva(data: CreateReservaDto): Promise<ReservaResponseDto> {
    const reserva: Reserva = await this.reservaRepository.create(data);
    const reservaId: number = reserva.id;
    const reservaWithRelations = await this.reservaRepository.findOneWithRelations(reservaId);

    if (!reservaWithRelations) {
      throw new Error('Reserva not found after creation');
    }

    return plainToInstance(ReservaResponseDto, reservaWithRelations);
  }

  // 2️ Listar todas las reservas con usuario y sala
  async getAllReservas(): Promise<ReservaResponseDto[]> {
    const reservas = await this.reservaRepository.findAllWithRelations();
    return plainToInstance(ReservaResponseDto, reservas);
  }

  // 3️ Obtener reserva por ID
  async getReservaById(id: number): Promise<ReservaResponseDto> {
    const reserva = await this.reservaRepository.findOneWithRelations(id);
    if (!reserva) throw new NotFoundException('Reserva not found');
    return plainToInstance(ReservaResponseDto, reserva);
  }

  // 4️ Actualizar reserva
  async updateReserva(id: number, data: UpdateReservaDto): Promise<ReservaResponseDto> {
    const exists = await this.reservaRepository.existsById(id);
    if (!exists) throw new NotFoundException('Reserva not found');
    await this.reservaRepository.update(id, data);
    const updatedReserva = await this.reservaRepository.findOneWithRelations(id);
    return plainToInstance(ReservaResponseDto, updatedReserva);
  }

  // 5️Eliminar reserva
  async deleteReserva(id: number): Promise<ReservaResponseDto> {
    const exists = await this.reservaRepository.existsById(id);
    if (!exists) throw new NotFoundException('Reserva not found');
    const reservaToDelete = await this.reservaRepository.findOneWithRelations(id);
    await this.reservaRepository.remove(id);
    return plainToInstance(ReservaResponseDto, reservaToDelete);
  }
}
