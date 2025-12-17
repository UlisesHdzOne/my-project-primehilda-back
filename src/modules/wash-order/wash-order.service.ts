import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { ErrorUtilsService } from '@/common/utils/error-utils.service';
import { Logger } from '@nestjs/common';
import { CreateWashOrderInput, UpdateWashOrderInput } from './types/wash-order.types';
import { BusinessRuleError } from '@/core/errors/custom.errors';
import type { OrderStatus } from '@prisma/client';

@Injectable()
export class WashOrderService {
  private readonly logger = new Logger(WashOrderService.name);

  private readonly ORDER_STATUS_FLOW: Record<OrderStatus, readonly OrderStatus[]> = {
    pending: ['in_progress'],
    in_progress: ['done'],
    done: ['delivered'],
    delivered: [],
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtils: ErrorUtilsService,
  ) {}

  create(input: CreateWashOrderInput) {
    return this.errorUtils.withDatabaseErrorHandling('CrearWashOrder', async () => {
      this.logger.log('Creando WashOrder', input);

      // Validar Car
      const car = await this.prisma.car.findUnique({
        where: { id: input.carId },
      });
      this.errorUtils.validateEntityExists(car, 'Carro');

      // Validar Employee
      const employee = await this.prisma.employee.findUnique({
        where: { id: input.employeeId },
      });
      this.errorUtils.validateEntityExists(employee, 'Empleado');

      // Calcular totalPrice sumando los basePrice de cada servicio
      const totalPrice = await Promise.all(
        input.services?.map(async s => {
          const serviceType = await this.prisma.serviceType.findUnique({
            where: { id: s.serviceTypeId },
          });

          this.errorUtils.validateEntityExists(serviceType, 'ServiceType');

          return serviceType!.basePrice;
        }) ?? [],
      ).then(prices => prices.reduce((a, b) => a + b, 0));

      return this.prisma.washOrder.create({
        data: {
          carId: input.carId,
          employeeId: input.employeeId,
          totalPrice,
          status: input.status ?? 'pending',
          services: {
            create: input.services?.map(s => ({ serviceTypeId: s.serviceTypeId })) ?? [],
          },
        },
        include: {
          car: true,
          employee: true,
          services: { include: { service: true } },
          payments: true,
        },
      });
    });
  }

  findAll() {
    return this.errorUtils.withDatabaseErrorHandling('ListandoWashOrder', async () => {
      this.logger.log('Buscando todos los WashOrder');
      const washOrders = await this.prisma.washOrder.findMany();
      this.logger.debug('Cantidad de WashOrder encontrados', { count: washOrders.length });
      return washOrders;
    });
  }

  findOne(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('BuscarWashOrder', async () => {
      this.logger.log('Buscando WashOrder por id', { id });

      const washOrder = await this.prisma.washOrder.findUnique({
        where: { id },
        include: {
          car: true,
          employee: true,
          services: { include: { service: true } },
          payments: true,
        },
      });

      this.errorUtils.validateEntityExists(washOrder, 'WashOrder');
      return washOrder;
    });
  }

  update(id: number, input: UpdateWashOrderInput) {
    return this.errorUtils.withDatabaseErrorHandling('ActualizarWashOrder', async () => {
      const washOrder = await this.prisma.washOrder.findUnique({ where: { id } });

      this.errorUtils.validateEntityExists(washOrder, 'WashOrder');

      const currentStatus = washOrder!.status;
      const allowedNext = this.ORDER_STATUS_FLOW[currentStatus];

      if (input.status && !allowedNext.includes(input.status)) {
        throw new BusinessRuleError(
          'INVALID_ORDER_STATUS_TRANSITION',
          `No se puede cambiar de ${currentStatus} a ${input.status}`,
        );
      }

      return this.prisma.washOrder.update({
        where: { id },
        data: {
          status: input.status,
        },
      });
    });
  }

  remove(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('EliminarWashOrder', async () => {
      this.logger.log('Eliminando WashOrder', { id });

      const washOrder = await this.prisma.washOrder.delete({ where: { id } });
      this.logger.log('WashOrder eliminado', { carDetailId: washOrder.id });

      return washOrder;
    });
  }
}
