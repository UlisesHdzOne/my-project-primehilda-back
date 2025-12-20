// src/modules/car-detail/car-detail.service.ts - VERSIÓN MEJORADA
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma.service';
import { ErrorUtilsService } from '@/common/utils/error-utils.service';
import { AppLogger } from '@/core/logger/winston.config'; // ✅ AppLogger
import { BusinessRuleError } from '@/core/errors/custom.errors';
import { CreateCarDetailInput, UpdateCarDetailInput } from './types/car-detail.types';
import { EnhancedPaginatedResponse } from '@/common/types/pagination.types';
import { PaginationFormatter } from '@/common/utils/pagination-formatter.utils';
import { FindCarDetailsQueryDto } from './dto/find-car-details-query.dto';

@Injectable()
export class CarDetailService {
  private readonly logger = new AppLogger(CarDetailService.name); // ✅ AppLogger

  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtils: ErrorUtilsService,
  ) {}

  async create(input: CreateCarDetailInput) {
    return this.errorUtils.withDatabaseErrorHandling('CrearCarDetail', async () => {
      this.logger.log('Creando CarDetail para carro', { carId: input.carId });

      // ✅ Validar que el carro existe
      const car = await this.prisma.car.findUnique({
        where: { id: input.carId },
      });

      this.errorUtils.validateEntityExists(car, 'Carro');

      // ✅ Validar relación 1:1 - No puede haber otro CarDetail para este carro
      const existingDetail = await this.prisma.carDetail.findUnique({
        where: { carId: input.carId },
      });

      if (existingDetail) {
        this.logger.warn('Ya existe un CarDetail para este carro', {
          carId: input.carId,
          existingDetailId: existingDetail.id,
        });

        this.errorUtils.checkConflict(existingDetail, 'CarDetail', 'carId');
      }

      // ✅ Crear el CarDetail
      const carDetail = await this.prisma.carDetail.create({
        data: input,
        include: {
          car: true, // ✅ Incluir info del carro
        },
      });

      this.logger.log('CarDetail creado exitosamente', {
        carDetailId: carDetail.id,
        carId: carDetail.carId,
        carPlate: carDetail.car?.plate || 'Desconocido',
      });

      return carDetail;
    });
  }

  async findAll(query: FindCarDetailsQueryDto): Promise<EnhancedPaginatedResponse<any>> {
    return this.errorUtils.withDatabaseErrorHandling('BuscarCarDetails', async () => {
      this.logger.log('Buscando CarDetails con paginación mejorada', {
        page: query.page,
        limit: query.limit,
        search: query.search,
        filters: query.getAppliedFilters(),
      });

      // Preparar where clause
      const where: Prisma.CarDetailWhereInput = {};

      // ✅ Búsqueda por notas o info del carro
      if (query.search) {
        const searchTerm = query.getNormalizedSearch();
        where.OR = [
          { notes: { contains: searchTerm!, mode: 'insensitive' } },
          {
            car: {
              OR: [
                { plate: { contains: searchTerm!, mode: 'insensitive' } },
                { brand: { contains: searchTerm!, mode: 'insensitive' } },
                { model: { contains: searchTerm!, mode: 'insensitive' } },
              ],
            },
          },
        ];
      }

      // ✅ Filtro por carId si se proporciona
      if (query.carId) {
        where.carId = query.carId;
      }

      // Preparar orderBy
      let orderBy: Prisma.CarDetailOrderByWithRelationInput = { id: 'desc' };
      const sortParams = query.getSortParams();

      if (sortParams) {
        const allowedFields = ['id', 'carId', 'createdAt'];
        if (allowedFields.includes(sortParams.field)) {
          orderBy = { [sortParams.field]: sortParams.direction };
        }
      }

      const skip = query.getSkip();
      const take = query.getTake();

      const [carDetails, total] = await Promise.all([
        this.prisma.carDetail.findMany({
          where,
          skip,
          take,
          include: {
            car: {
              select: {
                id: true,
                plate: true,
                brand: true,
                model: true,
                color: true,
              },
            },
          },
          orderBy,
        }),
        this.prisma.carDetail.count({ where }),
      ]);

      // ✅ Formatear respuesta
      return PaginationFormatter.formatEnhancedResponse(
        carDetails,
        query,
        total,
        '/api/car-detail',
        query.getAppliedFilters(),
      );
    });
  }

  async findOne(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('BuscarCarDetail', async () => {
      this.logger.debug('Buscando CarDetail por id', { id });

      const carDetail = await this.prisma.carDetail.findUnique({
        where: { id },
        include: {
          car: {
            include: {
              detail: false, // Evitar recursión
              orders: {
                take: 3, // Últimas 3 órdenes del carro
                orderBy: { date: 'desc' },
                select: {
                  id: true,
                  date: true,
                  status: true,
                  totalPrice: true,
                },
              },
            },
          },
        },
      });

      if (!carDetail) {
        this.logger.warn('CarDetail no encontrado', { id });
      }

      this.errorUtils.validateEntityExists(carDetail, 'CarDetail');

      this.logger.debug('CarDetail encontrado', {
        id,
        carId: carDetail?.carId,
        hasNotes: !!carDetail?.notes,
      });

      return carDetail;
    });
  }

  async update(id: number, input: UpdateCarDetailInput) {
    return this.errorUtils.withDatabaseErrorHandling('ActualizarCarDetail', async () => {
      this.logger.debug('Actualizando CarDetail', { id, input });

      // ✅ Verificar que existe
      const carDetail = await this.prisma.carDetail.findUnique({
        where: { id },
      });

      this.errorUtils.validateEntityExists(carDetail, 'CarDetail');

      // ✅ Validar que no se intente cambiar el carId (inmutable en relación 1:1)
      if ('carId' in input && input.carId !== undefined) {
        this.logger.warn('Intento de cambiar carId en CarDetail', {
          id,
          currentCarId: carDetail!.carId,
          newCarId: input.carId,
        });

        throw new BusinessRuleError(
          'CAR_DETAIL_CAR_IMMUTABLE',
          'No se puede cambiar el carId de un CarDetail existente (relación 1:1)',
          {
            currentCarId: carDetail!.carId,
            attemptedCarId: input.carId,
          },
        );
      }

      // ✅ Actualizar solo campos permitidos
      const updateData: Prisma.CarDetailUpdateInput = {};
      if (input.notes !== undefined) {
        updateData.notes = input.notes;
      }

      const updated = await this.prisma.carDetail.update({
        where: { id },
        data: updateData,
        include: {
          car: true,
        },
      });

      this.logger.log('CarDetail actualizado', {
        carDetailId: updated.id,
        carId: updated.carId,
        notesUpdated: input.notes !== undefined,
      });

      return updated;
    });
  }

  async remove(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('EliminarCarDetail', async () => {
      this.logger.debug('Eliminando CarDetail', { id });

      // ✅ Verificar que existe
      const carDetail = await this.prisma.carDetail.findUnique({
        where: { id },
        include: {
          car: {
            select: {
              plate: true,
            },
          },
        },
      });

      this.errorUtils.validateEntityExists(carDetail, 'CarDetail');

      // ✅ No hay reglas de negocio especiales para eliminar
      // (La relación 1:1 se elimina, pero el carro permanece)

      const deleted = await this.prisma.carDetail.delete({
        where: { id },
      });

      this.logger.log('CarDetail eliminado', {
        carDetailId: deleted.id,
        carId: deleted.carId,
        carPlate: carDetail?.car?.plate || 'Desconocido',
      });

      return deleted;
    });
  }

  // ✅ NUEVO: Buscar CarDetail por carId (útil para la relación 1:1)
  async findByCarId(carId: number) {
    return this.errorUtils.withDatabaseErrorHandling('BuscarCarDetailPorCarro', async () => {
      this.logger.log('Buscando CarDetail por carId', { carId });

      // ✅ Validar que el carro existe
      const car = await this.prisma.car.findUnique({
        where: { id: carId },
      });

      this.errorUtils.validateEntityExists(car, 'Carro');

      const carDetail = await this.prisma.carDetail.findUnique({
        where: { carId },
        include: {
          car: {
            select: {
              plate: true,
              brand: true,
              model: true,
              color: true,
            },
          },
        },
      });

      this.logger.debug('Resultado de búsqueda por carId', {
        carId,
        found: !!carDetail,
      });

      return {
        car: {
          id: car!.id,
          plate: car!.plate,
          brand: car!.brand,
          model: car!.model,
          color: car!.color,
        },
        detail: carDetail,
      };
    });
  }
}
