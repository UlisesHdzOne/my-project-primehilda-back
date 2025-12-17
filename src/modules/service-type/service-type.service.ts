import { Injectable } from '@nestjs/common';
import { CreateServiceTypeInput, UpdateServiceTypeInput } from './types/service-type.types';
import { PrismaService } from '@/core/database/prisma.service';
import { ErrorUtilsService } from '@/common/utils/error-utils.service';
import { AppLogger } from '@/core/logger/winston.config';

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

  findAll() {
    return this.errorUtils.withDatabaseErrorHandling('BuscarServiceTypes', async () => {
      this.logger.debug('Buscando todos los ServiceTypes');
      const serviceTypes = await this.prisma.serviceType.findMany();
      this.logger.debug('cantidad de serviceType encontrados', { count: serviceTypes.length });
      return serviceTypes;
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
      this.logger.debug('Buscando serviceType para actualizar', { id });
      const serviceType = await this.prisma.serviceType.findUnique({ where: { id } });
      if (!serviceType) this.logger.warn('serviceType no encontrado', { id });

      this.errorUtils.validateEntityExists(serviceType, 'ServiceType');
      this.logger.log('ServiceType actalizado', { id });
      return this.prisma.serviceType.update({ where: { id }, data: input });
    });
  }

  remove(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('EliminarServiceType', async () => {
      this.logger.debug('Buscando serviceType  para eliminar', { id });

      const serviceType = await this.prisma.serviceType.findUnique({ where: { id } });
      if (!serviceType) this.logger.warn('serviceType no encontrado', { id });

      this.errorUtils.validateEntityExists(serviceType, 'ServiceType');
      this.logger.log('ServiceType Eliminando', { id });
      return this.prisma.serviceType.delete({ where: { id } });
    });
  }
}
