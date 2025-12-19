// src/modules/wash-order/wash-order.service.ts - VERSIÓN CON TIPOS ESTRICTOS
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma.service';
import { ErrorUtilsService } from '@/common/utils/error-utils.service';
import { Logger } from '@nestjs/common';
import {
  CreateWashOrderInput,
  UpdateWashOrderInput,
  WashOrderWithRelations,
} from './types/wash-order.types';
import { BusinessRuleError } from '@/core/errors/custom.errors';
import { OrderStatus } from '@/common/enums';

@Injectable()
export class WashOrderService {
  private readonly logger = new Logger(WashOrderService.name);

  // FLUJO DE ESTADOS ACTUALIZADO con CANCELLED
  private readonly VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
    [OrderStatus.IN_PROGRESS]: [OrderStatus.DONE, OrderStatus.CANCELLED],
    [OrderStatus.DONE]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtils: ErrorUtilsService,
  ) {}

  async create(input: CreateWashOrderInput): Promise<WashOrderWithRelations> {
    return this.errorUtils.withDatabaseErrorHandling('CrearWashOrder', async () => {
      this.logger.log('Creando WashOrder', input);

      // ✅ VALIDACIÓN: Debe tener al menos 1 servicio
      if (!input.services || input.services.length === 0) {
        throw new BusinessRuleError('NO_SERVICES', 'Una orden debe tener al menos un servicio');
      }

      // ✅ VALIDAR CAR
      const car = await this.prisma.car.findUnique({
        where: { id: input.carId },
      });
      this.errorUtils.validateEntityExists(car, 'Carro');

      // ✅ VALIDAR EMPLOYEE
      const employee = await this.prisma.employee.findUnique({
        where: { id: input.employeeId },
      });
      this.errorUtils.validateEntityExists(employee, 'Empleado');

      // ✅ VALIDAR QUE TODOS LOS SERVICIOS EXISTEN
      const serviceIds = input.services.map(s => s.serviceTypeId);
      const existingServices = await this.prisma.serviceType.findMany({
        where: { id: { in: serviceIds } },
      });

      if (existingServices.length !== serviceIds.length) {
        const missing = serviceIds.filter(id => !existingServices.some(s => s.id === id));
        throw new BusinessRuleError(
          'SERVICES_NOT_FOUND',
          `Servicios no encontrados: ${missing.join(', ')}`,
        );
      }

      // ✅ CALCULAR TOTAL PRICE
      const totalPrice = existingServices.reduce((sum, service) => sum + service.basePrice, 0);

      // ✅ PREPARAR TIMESTAMP si empieza inmediatamente
      const startedAt = input.status === OrderStatus.IN_PROGRESS ? new Date() : null;

      // ✅ Definir datos con tipo explícito
      const washOrderData: Prisma.WashOrderCreateInput = {
        car: { connect: { id: input.carId } },
        employee: { connect: { id: input.employeeId } },
        totalPrice,
        status: input.status || OrderStatus.PENDING,
        startedAt,
        services: {
          create: input.services.map(s => ({
            service: { connect: { id: s.serviceTypeId } },
          })),
        },
      };

      const washOrder = await this.prisma.washOrder.create({
        data: washOrderData,
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
      });

      this.logger.log(`WashOrder creada exitosamente`, {
        id: washOrder.id,
        total: washOrder.totalPrice,
        status: washOrder.status,
      });

      return washOrder as WashOrderWithRelations;
    });
  }

  async findAll(): Promise<WashOrderWithRelations[]> {
    return this.errorUtils.withDatabaseErrorHandling('ListarWashOrders', async () => {
      this.logger.log('Buscando todas las WashOrders');

      const washOrders = await this.prisma.washOrder.findMany({
        include: {
          car: true,
          employee: true,
          services: { include: { service: true } },
          payments: true,
        },
        orderBy: { date: 'desc' },
      });

      this.logger.debug('Cantidad de WashOrders encontradas', {
        count: washOrders.length,
      });

      return washOrders as WashOrderWithRelations[];
    });
  }

  async findOne(id: number): Promise<WashOrderWithRelations> {
    return this.errorUtils.withDatabaseErrorHandling('BuscarWashOrder', async () => {
      this.logger.log('Buscando WashOrder por id', { id });

      const washOrder = await this.prisma.washOrder.findUnique({
        where: { id },
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
      });

      this.errorUtils.validateEntityExists(washOrder, 'WashOrder');
      return washOrder as WashOrderWithRelations;
    });
  }

  async updateStatus(orderId: number, newStatus: OrderStatus): Promise<WashOrderWithRelations> {
    return this.errorUtils.withDatabaseErrorHandling('CambiarEstadoOrden', async () => {
      const order = await this.prisma.washOrder.findUnique({
        where: { id: orderId },
        include: { payments: true },
      });

      this.errorUtils.validateEntityExists(order, 'WashOrder');

      // ✅ VALIDAR TRANSICIÓN DE ESTADO
      const allowedTransitions = this.VALID_TRANSITIONS[order!.status as OrderStatus];
      if (!allowedTransitions.includes(newStatus)) {
        throw new BusinessRuleError(
          'INVALID_STATUS_TRANSITION',
          `No se puede cambiar de ${order!.status} a ${newStatus}. ` +
            `Transiciones válidas: ${allowedTransitions.join(', ')}`,
        );
      }

      // ✅ REGLAS ESPECIALES PARA DELIVERED
      if (newStatus === OrderStatus.DELIVERED) {
        // Verificar pago completo antes de entregar
        const totalPaid = order!.payments.reduce((sum, p) => sum + p.amount, 0);
        if (totalPaid < order!.totalPrice) {
          const remaining = order!.totalPrice - totalPaid;
          throw new BusinessRuleError(
            'UNPAID_ORDER',
            `No se puede entregar una orden sin pagar completamente. ` +
              `Falta: $${remaining.toFixed(2)}`,
          );
        }
      }

      // ✅ PREPARAR DATA CON TIMESTAMPS - SIN USAR ANY
      type UpdateData = {
        status: OrderStatus;
        startedAt?: Date;
        completedAt?: Date;
        deliveredAt?: Date;
      };

      const updateData: UpdateData = { status: newStatus };

      switch (newStatus) {
        case OrderStatus.IN_PROGRESS:
          updateData.startedAt = new Date();
          break;
        case OrderStatus.DONE:
          updateData.completedAt = new Date();
          break;
        case OrderStatus.DELIVERED:
          updateData.deliveredAt = new Date();
          break;
      }

      const updatedOrder = await this.prisma.washOrder.update({
        where: { id: orderId },
        data: updateData,
        include: {
          car: true,
          employee: true,
          services: { include: { service: true } },
          payments: true,
        },
      });

      this.logger.log(`Estado de orden ${orderId} actualizado`, {
        from: order!.status,
        to: newStatus,
      });

      return updatedOrder as WashOrderWithRelations;
    });
  }

  async update(id: number, input: UpdateWashOrderInput): Promise<WashOrderWithRelations> {
    return this.errorUtils.withDatabaseErrorHandling('ActualizarWashOrder', async () => {
      const washOrder = await this.prisma.washOrder.findUnique({
        where: { id },
      });

      this.errorUtils.validateEntityExists(washOrder, 'WashOrder');

      // ✅ Si se está cambiando el estado, usar updateStatus
      if (input.status && input.status !== washOrder!.status) {
        return this.updateStatus(id, input.status);
      }

      // ✅ Si no hay cambios de estado, devolver la orden actual
      return this.findOne(id);
    });
  }

  async remove(id: number): Promise<WashOrderWithRelations> {
    return this.errorUtils.withDatabaseErrorHandling('EliminarWashOrder', async () => {
      this.logger.log('Eliminando WashOrder', { id });

      // ✅ Primero verificar que existe
      const order = await this.prisma.washOrder.findUnique({
        where: { id },
        include: { payments: true },
      });

      this.errorUtils.validateEntityExists(order, 'WashOrder');

      // ✅ No permitir eliminar órdenes con pagos registrados
      if (order!.payments && order!.payments.length > 0) {
        throw new BusinessRuleError(
          'ORDER_HAS_PAYMENTS',
          'No se puede eliminar una orden que ya tiene pagos registrados. ' +
            'En su lugar, cancélela.',
        );
      }

      // ✅ Eliminar servicios primero (debido a relaciones)
      await this.prisma.washOrderService.deleteMany({
        where: { orderId: id },
      });

      const deleted = await this.prisma.washOrder.delete({
        where: { id },
        include: {
          car: true,
          employee: true,
        },
      });

      this.logger.log('WashOrder eliminada', {
        orderId: deleted.id,
        car: deleted.car.plate,
      });

      return deleted as WashOrderWithRelations;
    });
  }

  // ✅ NUEVO: Buscar órdenes por auto
  async findOrdersByCar(carId: number): Promise<WashOrderWithRelations[]> {
    return this.errorUtils.withDatabaseErrorHandling('BuscarOrdenesPorAuto', async () => {
      this.logger.log('Buscando órdenes por carId', { carId });

      const orders = await this.prisma.washOrder.findMany({
        where: { carId },
        include: {
          car: true,
          employee: true,
          services: { include: { service: true } },
          payments: true,
        },
        orderBy: { date: 'desc' },
      });

      this.logger.debug('Órdenes encontradas para el auto', {
        carId,
        count: orders.length,
      });

      return orders as WashOrderWithRelations[];
    });
  }

  // ✅ NUEVO: Obtener estadísticas básicas
  async getDashboardStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    ordersByStatus: Record<string, number>;
    recentOrders: WashOrderWithRelations[];
  }> {
    return this.errorUtils.withDatabaseErrorHandling('ObtenerEstadisticas', async () => {
      const [totalOrders, totalRevenueResult, ordersByStatus, recentOrders] = await Promise.all([
        this.prisma.washOrder.count(),
        this.prisma.washOrder.aggregate({
          _sum: { totalPrice: true },
        }),
        this.prisma.washOrder.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        this.prisma.washOrder.findMany({
          take: 10,
          include: {
            car: true,
            employee: true,
            services: { include: { service: true } },
            payments: true,
          },
          orderBy: { date: 'desc' },
        }),
      ]);

      // Formatear estadísticas - con tipo explícito
      const statusCounts: Record<string, number> = {};
      ordersByStatus.forEach(item => {
        statusCounts[item.status] = item._count.id;
      });

      return {
        totalOrders,
        totalRevenue: totalRevenueResult._sum.totalPrice || 0,
        ordersByStatus: statusCounts,
        recentOrders: recentOrders as WashOrderWithRelations[],
      };
    });
  }
}
