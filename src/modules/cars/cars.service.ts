import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { CreateCarInput, UpdateCarInput } from './types/car.types';
import { ErrorUtilsService } from '@/common/utils/error-utils.service';
import { AppLogger } from '@/core/logger/winston.config'; // ✅ MANTENER AppLogger
import { Car, Prisma } from '@prisma/client';
import { EnhancedPaginatedResponse } from '@/common/types/pagination.types';
import { PaginationFormatter } from '@/common/utils/pagination-formatter.utils';
import { FindWashOrdersQueryDto } from '@/modules/wash-order/dto/find-wash-orders-query.dto';
import { FindCarsQueryDto } from './dto/find-cars-query.dto';
import {
  toWashOrderWithCarResponse,
  WashOrderWithCarResponse,
} from '@/shared/types/wash-order-response.types';

@Injectable()
export class CarsService {
  private readonly logger = new AppLogger(CarsService.name); // ✅ MANTENER AppLogger
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtils: ErrorUtilsService,
  ) {}

  async create(input: CreateCarInput) {
    return this.errorUtils.withDatabaseErrorHandling('CrearCarro', async () => {
      const normalizedPlate = this.normalizePlate(input.plate);
      this.logger.debug('Normalizando placa', { plate: input.plate, normalizedPlate });

      await this.validatePlateUnique(normalizedPlate);

      this.logger.log('Carro creado', { plate: normalizedPlate });
      return this.prisma.car.create({
        data: {
          ...input,
          plate: normalizedPlate,
        },
      });
    });
  }

  async findAll(query: FindCarsQueryDto): Promise<EnhancedPaginatedResponse<Car>> {
    return this.errorUtils.withDatabaseErrorHandling('BuscarCarros', async () => {
      this.logger.log('Buscando carros con paginación mejorada', {
        page: query.page,
        limit: query.limit,
        search: query.search,
        filters: query.getAppliedFilters(),
      });

      // Preparar where clause con búsqueda
      const where: Prisma.CarWhereInput = {};

      if (query.search) {
        const searchTerm = query.getNormalizedSearch();
        where.OR = [
          { plate: { contains: searchTerm!, mode: 'insensitive' } },
          { brand: { contains: searchTerm!, mode: 'insensitive' } },
          { model: { contains: searchTerm!, mode: 'insensitive' } },
          { color: { contains: searchTerm!, mode: 'insensitive' } },
        ];
      }

      // Preparar orderBy
      let orderBy: Prisma.CarOrderByWithRelationInput = { createdAt: 'desc' };
      const sortParams = query.getSortParams();
      if (sortParams) {
        const allowedFields = ['id', 'plate', 'brand', 'model', 'color', 'createdAt'];
        if (allowedFields.includes(sortParams.field)) {
          orderBy = { [sortParams.field]: sortParams.direction };
        }
      }

      const skip = query.getSkip();
      const take = query.getTake();

      const [cars, total] = await Promise.all([
        this.prisma.car.findMany({
          where,
          skip,
          take,
          include: {
            detail: true,
          },
          orderBy,
        }),
        this.prisma.car.count({ where }),
      ]);

      return PaginationFormatter.formatEnhancedResponse(
        cars,
        query,
        total,
        '/api/cars',
        query.getAppliedFilters(),
      );
    });
  }

  async findOne(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('BuscarCarro', async () => {
      this.logger.debug('Buscando carro por id', { id });
      const car = await this.prisma.car.findUnique({ where: { id } });

      if (!car) this.logger.warn('Carro no encontrado', { id });

      this.errorUtils.validateEntityExists(car, 'Carro');
      return car;
    });
  }

  async update(id: number, input: UpdateCarInput) {
    return this.errorUtils.withDatabaseErrorHandling('ActualizarCarro', async () => {
      if (input.plate) {
        input.plate = this.normalizePlate(input.plate);
        await this.validatePlateUnique(input.plate, id);
      }

      this.logger.debug('Actualizando carro', { id });

      const car = await this.prisma.car.update({
        where: { id },
        data: input,
      });

      this.logger.log('Carro actualizado', { id: car.id });
      return car;
    });
  }

  async remove(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('EliminarCarro', async () => {
      this.logger.debug('Eliminando carro', { id });

      const deleted = await this.prisma.car.delete({
        where: { id },
      });

      this.logger.log('Carro eliminado', { carId: deleted.id });
      return deleted;
    });
  }

  // ✅ MÉTODO ACTUALIZADO CON PAGINACIÓN
  // En cars.service.ts - MÉTODO CORREGIDO 100%

  async findOrdersByCar(
    carId: number,
    query?: FindWashOrdersQueryDto,
  ): Promise<EnhancedPaginatedResponse<WashOrderWithCarResponse>> {
    return this.errorUtils.withDatabaseErrorHandling('BuscarOrdenesPorAuto', async () => {
      this.logger.log('Buscando órdenes por carId con paginación', {
        carId,
        filters: query?.getAppliedFilters() || [],
      });

      // Validar que el carro existe
      const car = await this.prisma.car.findUnique({ where: { id: carId } });
      this.errorUtils.validateEntityExists(car, 'Carro');

      // Usar el query o crear uno por defecto
      const paginationQuery = query || new FindWashOrdersQueryDto();
      paginationQuery.carId = carId;

      const where: Prisma.WashOrderWhereInput = { carId };

      // Aplicar filtros del query
      if (paginationQuery.status) {
        where.status = paginationQuery.status;
      }

      if (paginationQuery.employeeId) {
        where.employeeId = paginationQuery.employeeId;
      }

      // Filtro por fechas
      if (paginationQuery.dateFrom || paginationQuery.dateTo) {
        where.date = {};

        if (paginationQuery.dateFrom) {
          const dateFrom = paginationQuery.getDateFromAsDate();
          if (dateFrom) {
            where.date.gte = dateFrom;
          }
        }

        if (paginationQuery.dateTo) {
          const dateTo = paginationQuery.getDateToAsDate();
          if (dateTo) {
            where.date.lte = dateTo;
          }
        }
      }

      // Preparar orderBy
      let orderBy: Prisma.WashOrderOrderByWithRelationInput = { date: 'desc' };
      const sortParams = paginationQuery.getSortParams();
      if (sortParams) {
        const allowedFields = ['id', 'date', 'totalPrice', 'status'];
        if (allowedFields.includes(sortParams.field)) {
          orderBy = { [sortParams.field]: sortParams.direction };
        }
      }

      const skip = paginationQuery.getSkip();
      const take = paginationQuery.getTake();

      // ✅ DEFINIR EL TIPO DE LA QUERY EXPLÍCITAMENTE
      type OrderWithRelations = Prisma.WashOrderGetPayload<{
        include: {
          car: true;
          employee: true;
          services: { include: { service: true } };
          payments: true;
        };
      }>;

      const [orders, total] = await Promise.all([
        this.prisma.washOrder.findMany({
          where,
          skip,
          take,
          include: {
            car: true,
            employee: true,
            services: {
              include: {
                service: true,
              },
            },
            payments: true,
          },
          orderBy,
        }) as Promise<OrderWithRelations[]>, // ✅ Type assertion explícita
        this.prisma.washOrder.count({ where }),
      ]);

      // ✅ CONVERSIÓN SEGURA SIN `any`
      const typedOrders: WashOrderWithCarResponse[] = orders.map(order =>
        toWashOrderWithCarResponse(order),
      );

      return PaginationFormatter.formatEnhancedResponse(
        typedOrders,
        paginationQuery,
        total,
        `/api/cars/${carId}/orders`,
        paginationQuery.getAppliedFilters(),
      );
    });
  }

  // =========================
  // REGLAS DE NEGOCIO
  // =========================

  private normalizePlate(plate: string): string {
    return plate.toUpperCase();
  }

  private async validatePlateUnique(plate: string, currentId?: number) {
    const existsCar = await this.prisma.car.findUnique({ where: { plate } });

    if (existsCar && existsCar.id !== currentId) {
      this.logger.warn('Validación de placa fallida: ya existe un carro con la misma placa', {
        plate,
        existsCarId: existsCar.id,
      });
      this.errorUtils.checkConflict(existsCar, 'Carro', 'placa');
    }
  }
}
