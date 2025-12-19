import { Injectable } from '@nestjs/common';
import { CreateServiceTypeInput, UpdateServiceTypeInput } from './types/service-type.types';
import { PrismaService } from '@/core/database/prisma.service';
import { ErrorUtilsService } from '@/common/utils/error-utils.service';
import { AppLogger } from '@/core/logger/winston.config';
import { PaginatedResponse } from '@/common/types/pagination.types';
import { ServiceType } from '@prisma/client';
import { PaginationUtils } from '@/common/utils/pagination.utils';

@Injectable()
export class ServiceTypeService {
  private readonly logger = new AppLogger('ServiceTypeService');
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtils: ErrorUtilsService,
  ) {}

  create(input: CreateServiceTypeInput) {
    return this.errorUtils.withDatabaseErrorHandling('CrearServiceType', async () => {
      this.logger.log('serviceType creado', { name: input.name });
      return this.prisma.serviceType.create({ data: input });
    });
  }

  findAll(page = 1, limit = 10): Promise<PaginatedResponse<ServiceType>> {
    return this.errorUtils.withDatabaseErrorHandling('BuscarServiceTypes', async () => {
      this.logger.debug('Buscando todos los ServiceTypes con paginación', { page, limit });

      const skip = (page - 1) * limit;

      const [serviceTypes, total] = await Promise.all([
        this.prisma.serviceType.findMany({
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        this.prisma.serviceType.count(),
      ]);

      return PaginationUtils.createResponse(serviceTypes, page, limit, total);
    });
  }

  findOne(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('BuscarServiceType', async () => {
      this.logger.debug('Buscando ServiceType por id', { id });
      const serviceType = await this.prisma.serviceType.findUnique({ where: { id } });

      if (!serviceType) this.logger.warn('serviceType no encontrado', { id });
      this.errorUtils.validateEntityExists(serviceType, 'ServiceType');
      return serviceType;
    });
  }

  update(id: number, input: UpdateServiceTypeInput) {
    return this.errorUtils.withDatabaseErrorHandling('ActualizarServiceType', async () => {
      this.logger.debug('Actualizando ServiceType', { id });

      const updated = await this.prisma.serviceType.update({
        where: { id },
        data: input,
      });

      this.logger.log('ServiceType actualizado', { serviceTypeId: updated.id });
      return updated;
    });
  }

  remove(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('EliminarServiceType', async () => {
      this.logger.debug('Eliminando ServiceType', { id });

      const deleted = await this.prisma.serviceType.delete({ where: { id } });

      this.logger.log('ServiceType eliminado', { serviceTypeId: deleted.id });
      return deleted;
    });
  }
}
