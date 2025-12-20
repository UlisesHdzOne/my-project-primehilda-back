// src/modules/service-type/service-type.service.ts - VERSIÓN MEJORADA
import { Injectable } from '@nestjs/common';
import { Prisma, ServiceType } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma.service';
import { ErrorUtilsService } from '@/common/utils/error-utils.service';
import { AppLogger } from '@/core/logger/winston.config';
import { EnhancedPaginatedResponse } from '@/common/types/pagination.types';
import { PaginationFormatter } from '@/common/utils/pagination-formatter.utils';
import { CreateServiceTypeInput, UpdateServiceTypeInput } from './types/service-type.types';
import { FindServiceTypesQueryDto } from './dto/find-service-types-query.dto';
import { BusinessRuleError } from '@/core/errors/custom.errors';

@Injectable()
export class ServiceTypeService {
  private readonly logger = new AppLogger(ServiceTypeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtils: ErrorUtilsService,
  ) {}

  async create(input: CreateServiceTypeInput) {
    return this.errorUtils.withDatabaseErrorHandling('CrearServiceType', async () => {
      this.logger.log('Creando ServiceType', { input });

      // ✅ VALIDACIONES
      if (input.basePrice <= 0) {
        throw new BusinessRuleError('INVALID_PRICE', 'El precio base debe ser mayor a 0', {
          price: input.basePrice,
        });
      }

      if (input.duration <= 0) {
        throw new BusinessRuleError('INVALID_DURATION', 'La duración debe ser mayor a 0 minutos', {
          duration: input.duration,
        });
      }

      // ✅ VALIDAR NOMBRE ÚNICO
      await this.validateNameUnique(input.name);

      const serviceType = await this.prisma.serviceType.create({
        data: input,
      });

      this.logger.log('ServiceType creado', {
        serviceTypeId: serviceType.id,
        name: serviceType.name,
        price: serviceType.basePrice,
        duration: serviceType.duration,
      });

      return serviceType;
    });
  }

  async findAll(query: FindServiceTypesQueryDto): Promise<EnhancedPaginatedResponse<ServiceType>> {
    return this.errorUtils.withDatabaseErrorHandling('BuscarServiceTypes', async () => {
      this.logger.log('Buscando ServiceTypes con paginación mejorada', {
        page: query.page,
        limit: query.limit,
        search: query.search,
        filters: query.getAppliedFilters(),
      });

      // Preparar where clause
      const where: Prisma.ServiceTypeWhereInput = {};

      // ✅ Búsqueda por nombre
      if (query.search) {
        const searchTerm = query.getNormalizedSearch();
        where.name = { contains: searchTerm!, mode: 'insensitive' };
      }

      // ✅ Filtro por precio
      if (query.minPrice !== undefined || query.maxPrice !== undefined) {
        where.basePrice = {};

        if (query.minPrice !== undefined) {
          where.basePrice.gte = query.minPrice;
        }

        if (query.maxPrice !== undefined) {
          where.basePrice.lte = query.maxPrice;
        }
      }

      // ✅ Filtro por duración
      if (query.minDuration !== undefined || query.maxDuration !== undefined) {
        where.duration = {};

        if (query.minDuration !== undefined) {
          where.duration.gte = query.minDuration;
        }

        if (query.maxDuration !== undefined) {
          where.duration.lte = query.maxDuration;
        }
      }

      // Preparar orderBy
      let orderBy: Prisma.ServiceTypeOrderByWithRelationInput = { name: 'asc' };
      const sortParams = query.getSortParams();

      if (sortParams) {
        const allowedFields = ['id', 'name', 'basePrice', 'duration', 'createdAt'];
        if (allowedFields.includes(sortParams.field)) {
          orderBy = { [sortParams.field]: sortParams.direction };
        }
      }

      const skip = query.getSkip();
      const take = query.getTake();

      const [serviceTypes, total] = await Promise.all([
        this.prisma.serviceType.findMany({
          where,
          skip,
          take,
          orderBy,
          // ✅ Incluir estadísticas de uso
          include: {
            _count: {
              select: {
                orders: true, // Cuántas órdenes usan este servicio
              },
            },
          },
        }),
        this.prisma.serviceType.count({ where }),
      ]);

      return PaginationFormatter.formatEnhancedResponse(
        serviceTypes,
        query,
        total,
        '/api/service-type',
        query.getAppliedFilters(),
      );
    });
  }

  async findOne(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('BuscarServiceType', async () => {
      this.logger.debug('Buscando ServiceType por id', { id });

      const serviceType = await this.prisma.serviceType.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
          // ✅ Incluir últimas órdenes que usaron este servicio
          orders: {
            take: 5,
            orderBy: { order: { date: 'desc' } },
            include: {
              order: {
                include: {
                  car: true,
                  employee: true,
                },
              },
            },
          },
        },
      });

      if (!serviceType) {
        this.logger.warn('ServiceType no encontrado', { id });
      }

      this.errorUtils.validateEntityExists(serviceType, 'ServiceType');

      this.logger.debug('ServiceType encontrado', {
        id,
        usageCount: serviceType?._count?.orders || 0,
      });

      return serviceType;
    });
  }

  async update(id: number, input: UpdateServiceTypeInput) {
    return this.errorUtils.withDatabaseErrorHandling('ActualizarServiceType', async () => {
      this.logger.debug('Actualizando ServiceType', { id, input });

      // ✅ Validar precio si se actualiza
      if (input.basePrice !== undefined && input.basePrice <= 0) {
        throw new BusinessRuleError('INVALID_PRICE', 'El precio base debe ser mayor a 0', {
          price: input.basePrice,
        });
      }

      // ✅ Validar duración si se actualiza
      if (input.duration !== undefined && input.duration <= 0) {
        throw new BusinessRuleError('INVALID_DURATION', 'La duración debe ser mayor a 0 minutos', {
          duration: input.duration,
        });
      }

      // ✅ Validar nombre único si se actualiza
      if (input.name) {
        await this.validateNameUnique(input.name, id);
      }

      const updated = await this.prisma.serviceType.update({
        where: { id },
        data: input,
      });

      this.logger.log('ServiceType actualizado', {
        serviceTypeId: updated.id,
        name: updated.name,
      });

      return updated;
    });
  }

  async remove(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('EliminarServiceType', async () => {
      this.logger.debug('Eliminando ServiceType', { id });

      // ✅ Validar que no tenga órdenes asociadas
      const [serviceType, usageCount] = await Promise.all([
        this.prisma.serviceType.findUnique({ where: { id } }),
        this.prisma.washOrderService.count({ where: { serviceTypeId: id } }),
      ]);

      this.errorUtils.validateEntityExists(serviceType, 'ServiceType');

      // ✅ REGLA DE NEGOCIO: No eliminar servicios en uso
      if (usageCount > 0) {
        this.logger.warn('No se puede eliminar ServiceType con órdenes asociadas', {
          id,
          serviceName: serviceType!.name,
          usageCount,
        });

        throw new BusinessRuleError(
          'SERVICE_IN_USE',
          `No se puede eliminar el servicio "${serviceType!.name}" porque está siendo usado en ${usageCount} órdenes.`,
          {
            usageCount,
            serviceName: serviceType!.name,
            serviceId: serviceType!.id,
          },
        );
      }

      const deleted = await this.prisma.serviceType.delete({ where: { id } });

      this.logger.log('ServiceType eliminado', {
        serviceTypeId: deleted.id,
        name: deleted.name,
      });

      return deleted;
    });
  }

  // ✅ NUEVO: Método para validar múltiples servicios
  async validateServicesExist(serviceIds: number[]): Promise<boolean> {
    return this.errorUtils.withDatabaseErrorHandling('ValidarServiciosExisten', async () => {
      if (!serviceIds || serviceIds.length === 0) {
        return false;
      }

      const uniqueIds = [...new Set(serviceIds)];
      const existingServices = await this.prisma.serviceType.findMany({
        where: { id: { in: uniqueIds } },
        select: { id: true },
      });

      const existingIds = existingServices.map(s => s.id);
      const missingIds = uniqueIds.filter(id => !existingIds.includes(id));

      if (missingIds.length > 0) {
        this.logger.warn('Algunos servicios no existen', { missingIds });
        throw new BusinessRuleError(
          'SERVICES_NOT_FOUND',
          `Servicios no encontrados: ${missingIds.join(', ')}`,
          { missingIds },
        );
      }

      return true;
    });
  }

  // ✅ NUEVO: Obtener estadísticas de servicios
  async getServiceStatistics() {
    return this.errorUtils.withDatabaseErrorHandling('ObtenerEstadisticasServicios', async () => {
      this.logger.log('Obteniendo estadísticas de servicios');

      const [totalServices, priceStats, usageStats, mostUsedServices] = await Promise.all([
        // Total de servicios
        this.prisma.serviceType.count(),
        // Estadísticas de precios
        this.prisma.serviceType.aggregate({
          _avg: { basePrice: true },
          _min: { basePrice: true },
          _max: { basePrice: true },
          _sum: { basePrice: true },
        }),
        // Servicios más usados
        this.prisma.washOrderService.groupBy({
          by: ['serviceTypeId'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 5,
        }),
        // Servicios con detalles
        this.prisma.serviceType.findMany({
          include: {
            _count: {
              select: { orders: true },
            },
          },
          orderBy: { name: 'asc' },
        }),
      ]);

      // Mapear servicios más usados
      const mostUsed = await Promise.all(
        usageStats.map(async stat => {
          const service = await this.prisma.serviceType.findUnique({
            where: { id: stat.serviceTypeId },
          });
          return {
            serviceId: stat.serviceTypeId,
            serviceName: service?.name || 'Desconocido',
            usageCount: stat._count.id,
            price: service?.basePrice || 0,
          };
        }),
      );

      return {
        totalServices,
        priceStatistics: {
          average: priceStats._avg.basePrice || 0,
          min: priceStats._min.basePrice || 0,
          max: priceStats._max.basePrice || 0,
          totalSum: priceStats._sum.basePrice || 0,
        },
        mostUsedServices: mostUsed,
        allServices: mostUsedServices.map(service => ({
          id: service.id,
          name: service.name,
          price: service.basePrice,
          duration: service.duration,
          usageCount: service._count.orders,
        })),
      };
    });
  }

  // =========================
  // REGLAS DE NEGOCIO
  // =========================

  private async validateNameUnique(name: string, currentId?: number) {
    const existingService = await this.prisma.serviceType.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        ...(currentId && { id: { not: currentId } }),
      },
    });

    if (existingService) {
      this.logger.warn('Validación de nombre fallida: ya existe un servicio con el mismo nombre', {
        name,
        existingServiceId: existingService.id,
      });

      this.errorUtils.checkConflict(existingService, 'ServiceType', 'nombre');
    }
  }
}
