import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { CreateCarInput, UpdateCarInput } from './types/car.types';
import { ErrorUtilsService } from '@/common/utils/error-utils.service';

@Injectable()
export class CarsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtils: ErrorUtilsService,
  ) {}

  async create(input: CreateCarInput) {
    return this.errorUtils.withDatabaseErrorHandling('CrearCarro', async () => {
      //normaliza la placa a mayusculas
      const normalizedPlate = this.normalizePlate(input.plate);

      //busca si ya existe un carro con la misma placa
      await this.validatePlateUnique(normalizedPlate);

      //crea el carro
      const car = await this.prisma.car.create({
        data: {
          ...input,
          plate: normalizedPlate,
        },
      });
      return car;
    });
  }

  async findAll() {
    return this.errorUtils.withDatabaseErrorHandling('BuscarCarros', async () => {
      return await this.prisma.car.findMany();
    });
  }

  async findOne(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('BuscarCarro', async () => {
      const car = await this.prisma.car.findUnique({ where: { id } });

      this.errorUtils.validateEntityExists(car, 'Carro');
      return car;
    });
  }

  async update(id: number, input: UpdateCarInput) {
    return this.errorUtils.withDatabaseErrorHandling('ActualizarCarro', async () => {
      //verifica que el carro exista antes de actualizar
      const car = await this.prisma.car.findUnique({ where: { id } });
      this.errorUtils.validateEntityExists(car, 'Carro');

      // Si viene 'plate' en el body, entonces sí validamos unicidad
      if (input.plate) {
        //normaliza la placa
        input.plate = this.normalizePlate(input.plate);
        await this.validatePlateUnique(input.plate, id);
      }

      // Ejecutar la actualización
      const updateCar = await this.prisma.car.update({
        where: { id },
        data: input,
      });
      return updateCar;
    });
  }

  async remove(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('EliminarCarro', async () => {
      const car = await this.prisma.car.findUnique({ where: { id } });
      this.errorUtils.validateEntityExists(car, 'Carro');
      return this.prisma.car.delete({ where: { id } });
    });
  }

  private normalizePlate(plate: string): string {
    return plate.toUpperCase();
  }

  private async validatePlateUnique(plate: string, currentId?: number) {
    // Buscar si la placa ya está usada por otro carro
    const existsCar = await this.prisma.car.findUnique({
      where: { plate },
    });

    // Si existe y no es el mismo carro que se está actualizando → conflicto
    if (existsCar && existsCar.id !== currentId) {
      this.errorUtils.checkConflict(existsCar, 'Carro', 'placa');
    }
  }
}
