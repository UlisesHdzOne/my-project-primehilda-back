import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { CreateCarInput, UpdateCarInput } from './types/car.types';
import { ErrorUtilsService } from '@/common/utils/error-utils.service';
import { AppLogger } from '@/core/logger/winston.config';

@Injectable()
export class CarsService {
  private readonly logger = new AppLogger('CarsService');
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtils: ErrorUtilsService,
  ) {}

  async create(input: CreateCarInput) {
    return this.errorUtils.withDatabaseErrorHandling('CrearCarro', async () => {
      const normalizedPlate = this.normalizePlate(input.plate);
      this.logger.debug('Normalizando placa', { plate: input.plate, normalizedPlate });

      await this.validatePlateUnique(normalizedPlate);

      this.logger.log('carro creado', { plate: normalizedPlate });
      return this.prisma.car.create({
        data: {
          ...input,
          plate: normalizedPlate,
        },
      });
    });
  }

  async findAll() {
    return this.errorUtils.withDatabaseErrorHandling('BuscarCarros', async () => {
      this.logger.debug('Buscando todos los carros');
      const cars = await this.prisma.car.findMany();
      this.logger.debug('Cantidad de carros encontrados', { count: cars.length });
      return cars;
    });
  }

  async findOne(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('BuscarCarro', async () => {
      this.logger.debug('Buscando carro por id', { id });
      const car = await this.prisma.car.findUnique({ where: { id } });

      if (!car) this.logger.warn('Carro no encontrado', { id });

      // validateEntityExists → exige que car EXISTA
      this.errorUtils.validateEntityExists(car, 'Carro');
      return car;
    });
  }

  async update(id: number, input: UpdateCarInput) {
    return this.errorUtils.withDatabaseErrorHandling('ActualizarCarro', async () => {
      this.logger.debug('Buscando carro para actualizar', { id });
      const car = await this.prisma.car.findUnique({ where: { id } });
      if (!car) this.logger.warn('Carro no encontrado', { id });

      this.errorUtils.validateEntityExists(car, 'Carro');

      if (input.plate) {
        input.plate = this.normalizePlate(input.plate);
        await this.validatePlateUnique(input.plate, id);
      }

      this.logger.log('carro actualizado', { id });
      return this.prisma.car.update({
        where: { id },
        data: input,
      });
    });
  }

  async remove(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('EliminarCarro', async () => {
      this.logger.debug('Buscando carro para eliminar', { id });
      const car = await this.prisma.car.findUnique({ where: { id } });
      if (!car) this.logger.warn('Carro no encontrado', { id });
      this.errorUtils.validateEntityExists(car, 'Carro');

      // futura regla: no eliminar si tiene órdenes activas
      const deleted = await this.prisma.car.delete({ where: { id } });
      this.logger.log('Carro eliminado', { carId: deleted.id });
      return deleted;
    });
  }

  // =========================
  // REGLAS DE NEGOCIO
  // =========================

  private normalizePlate(plate: string): string {
    return plate.toUpperCase();
  }

  private async validatePlateUnique(plate: string, currentId?: number) {
    // busca un Car por placa (placa es UNIQUE en el sistema)
    const existsCar = await this.prisma.car.findUnique({ where: { plate } });

    if (existsCar && existsCar.id !== currentId) {
      this.logger.warn('validacion de placa falla:ya existe un carro con la misma placa', {
        plate,
        existsCarId: existsCar.id,
      });
      // checkConflict → lanza error SI la placa EXISTE (hay conflicto)
      this.errorUtils.checkConflict(existsCar, 'Carro', 'placa');
    }
  }
}
