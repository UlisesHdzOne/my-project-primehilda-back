import { Injectable } from '@nestjs/common';
import { CreateCarDetailInput, UpdateCarDetailInput } from './types/car-detail.types';
import { ErrorUtilsService } from '@/common/utils/error-utils.service';
import { PrismaService } from '@/core/database/prisma.service';
import { BusinessRuleError } from '@/core/errors/custom.errors';
import { Logger } from '@nestjs/common';
@Injectable()
export class CarDetailService {
  private readonly logger = new Logger(CarDetailService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtils: ErrorUtilsService,
  ) {}

  create(input: CreateCarDetailInput) {
    return this.errorUtils.withDatabaseErrorHandling('CrearCarDetail', async () => {
      this.logger.debug('buscando carro para asociar CarDetail', { carId: input.carId });
      const car = await this.prisma.car.findUnique({ where: { id: input.carId } });
      if (!car) this.logger.warn('Carro no encontrado', { carId: input.carId });
      this.errorUtils.validateEntityExists(car, 'Carro');

      // Esto dice 1:1 -> si ya existe un CarDetail para ese carId, no se puede crear otro.
      // Eso garantiza que cada Car tenga como máximo un CarDetail, que es la esencia de la relación 1:1.
      const existingDetail = await this.prisma.carDetail.findUnique({
        where: { carId: input.carId },
      });
      if (existingDetail)
        this.logger.warn('CarDetail ya existe para este carro', {
          carId: input.carId,
          carDetailId: existingDetail.id,
        });
      this.errorUtils.checkConflict(existingDetail, 'CarDetail', 'carId');

      this.logger.debug('CarDetail creado', { carId: input.carId });
      return this.prisma.carDetail.create({
        data: input,
      });
    });
  }

  findAll() {
    return this.errorUtils.withDatabaseErrorHandling('BuscarCarros', async () => {
      this.logger.debug('buscando todos los carros');

      const details = await this.prisma.carDetail.findMany();
      this.logger.debug('Cantidad de CarDetail encontrados', { count: details.length });
      return details;
    });
  }

  findOne(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('BuscarCarDetail', async () => {
      this.logger.debug('Buscando CarDetail por id', { id });
      const carDetail = await this.prisma.carDetail.findUnique({ where: { id } });
      if (!carDetail) this.logger.warn('CarDetail no encontrado', { id });
      this.errorUtils.validateEntityExists(carDetail, 'CarDetail');
      return carDetail;
    });
  }

  update(id: number, input: UpdateCarDetailInput) {
    return this.errorUtils.withDatabaseErrorHandling('ActualizarCarDetail', async () => {
      this.logger.debug('Buscando CarDetail para actualizar', { id });
      const carDetail = await this.prisma.carDetail.findUnique({ where: { id } });
      if (!carDetail) this.logger.warn('CarDetail no encontrado', { id });

      //validateEntityExists → exige que carDetail EXISTA
      this.errorUtils.validateEntityExists(carDetail, 'CarDetail');

      if ('carId' in input) {
        this.logger.warn('El carId NO puede cambiar después de crear el CarDetail', {
          id,
          newCarId: input.carId,
        });

        throw new BusinessRuleError(
          'CAR_DETAIL_CAR_IMMUTABLE',
          'No se puede cambiar el carId de un CarDetail existente',
        );
      }

      const updated = await this.prisma.carDetail.update({ where: { id }, data: input });
      this.logger.log('CarDetail actualizado', { carDetailId: updated.id });
      return updated;
    });
  }

  remove(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('EliminarCarDetail', async () => {
      this.logger.debug('Eliminando CarDetail', { id });

      const deleted = await this.prisma.carDetail.delete({ where: { id } });
      this.logger.log('CarDetail eliminado', { carDetailId: deleted.id });

      return deleted;
    });
  }
}
