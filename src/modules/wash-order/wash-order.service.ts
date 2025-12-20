// src/modules/wash-order/wash-order.service.ts - VERSIÓN MEJORADA
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma.service';
import { ErrorUtilsService } from '@/common/utils/error-utils.service';
import { AppLogger } from '@/core/logger/winston.config'; // ✅ Cambiar a AppLogger
import {
  CreateWashOrderInput,
  UpdateWashOrderInput,
  WashOrderWithRelations,
} from './types/wash-order.types';
import { BusinessRuleError } from '@/core/errors/custom.errors';
import { OrderStatus } from '@/common/enums';
import { EnhancedPaginatedResponse } from '@/common/types/pagination.types';
import { PaginationFormatter } from '@/common/utils/pagination-formatter.utils';
import { FindWashOrdersQueryDto } from './dto/find-wash-orders-query.dto';

@Injectable()
export class WashOrderService {
  private readonly logger = new AppLogger(WashOrderService.name); // ✅ AppLogger

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

  // ✅ FUNCIÓN DE CONVERSIÓN (como en CarsService)
  private toWashOrderWithRelations(
    order: Prisma.WashOrderGetPayload<{
      include: {
        car: true;
        employee: true;
        services: { include: { service: true } };
        payments: true;
      };
    }>,
  ): WashOrderWithRelations {
    return {
      id: order.id,
      date: order.date,
      totalPrice: order.totalPrice,
      status: order.status as OrderStatus,
      startedAt: order.startedAt,
      completedAt: order.completedAt,
      deliveredAt: order.deliveredAt,
      carId: order.carId,
      employeeId: order.employeeId,
      car: order.car,
      employee: order.employee,
      services: order.services.map(service => ({
        id: service.id,
        service: service.service,
      })),
      payments: order.payments.map(payment => ({
        id: payment.id,
        date: payment.date,
        amount: payment.amount,
        method: payment.method,
      })),
    };
  }

  async create(input: CreateWashOrderInput): Promise<WashOrderWithRelations> {
    return this.errorUtils.withDatabaseErrorHandling('CrearWashOrder', async () => {
      this.logger.log('Creando WashOrder', { input });

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

      // ✅ USAR FUNCIÓN DE CONVERSIÓN (no casting directo)
      return this.toWashOrderWithRelations(washOrder);
    });
  }

  async findAll(
    query: FindWashOrdersQueryDto,
  ): Promise<EnhancedPaginatedResponse<WashOrderWithRelations>> {
    return this.errorUtils.withDatabaseErrorHandling('ListarWashOrders', async () => {
      this.logger.log('Buscando todas las WashOrders con paginación mejorada', {
        page: query.page,
        limit: query.limit,
        filters: query.getAppliedFilters(),
      });

      // Preparar where clause con filtros
      const where: Prisma.WashOrderWhereInput = {};

      // Aplicar filtro por status
      if (query.status) {
        where.status = query.status;
      }

      // Aplicar filtro por carId
      if (query.carId) {
        where.carId = query.carId;
      }

      // Aplicar filtro por employeeId
      if (query.employeeId) {
        where.employeeId = query.employeeId;
      }

      // Aplicar filtro por rango de fechas
      if (query.dateFrom || query.dateTo) {
        where.date = {};

        if (query.dateFrom) {
          where.date.gte = query.getDateFromAsDate();
        }

        if (query.dateTo) {
          where.date.lte = query.getDateToAsDate();
        }
      }

      // Aplicar búsqueda (opcional)
      if (query.search) {
        const searchTerm = query.getNormalizedSearch();
        where.OR = [
          { car: { plate: { contains: searchTerm!, mode: 'insensitive' } } },
          { car: { brand: { contains: searchTerm!, mode: 'insensitive' } } },
          { car: { model: { contains: searchTerm!, mode: 'insensitive' } } },
        ];
      }

      // Preparar orderBy
      let orderBy: Prisma.WashOrderOrderByWithRelationInput = { date: 'desc' };

      const sortParams = query.getSortParams();
      if (sortParams) {
        // Validar campo de ordenamiento permitido
        const allowedSortFields = ['id', 'date', 'totalPrice', 'status'];
        if (allowedSortFields.includes(sortParams.field)) {
          orderBy = { [sortParams.field]: sortParams.direction };
        }
      }

      // Calcular paginación
      const skip = query.getSkip();
      const take = query.getTake();

      // ✅ DEFINIR TIPO EXPLÍCITO (como en CarsService)
      type OrderWithRelations = Prisma.WashOrderGetPayload<{
        include: {
          car: true;
          employee: true;
          services: { include: { service: true } };
          payments: true;
        };
      }>;

      const [washOrders, total] = await Promise.all([
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
        }) as Promise<OrderWithRelations[]>,
        this.prisma.washOrder.count({ where }),
      ]);

      // ✅ USAR FUNCIÓN DE CONVERSIÓN
      const typedOrders: WashOrderWithRelations[] = washOrders.map(order =>
        this.toWashOrderWithRelations(order),
      );

      // Usar el nuevo formatter mejorado
      return PaginationFormatter.formatEnhancedResponse(
        typedOrders,
        query,
        total,
        '/api/wash-order',
        query.getAppliedFilters(),
      );
    });
  }

  async findOne(id: number): Promise<WashOrderWithRelations> {
    return this.errorUtils.withDatabaseErrorHandling('BuscarWashOrder', async () => {
      this.logger.log('Buscando WashOrder por id', { id });

      // ✅ TIPO EXPLÍCITO
      type OrderWithRelations = Prisma.WashOrderGetPayload<{
        include: {
          car: true;
          employee: true;
          services: { include: { service: true } };
          payments: true;
        };
      }>;

      const washOrder = (await this.prisma.washOrder.findUnique({
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
      })) as OrderWithRelations | null;

      this.errorUtils.validateEntityExists(washOrder, 'WashOrder');

      // ✅ USAR FUNCIÓN DE CONVERSIÓN
      return this.toWashOrderWithRelations(washOrder!);
    });
  }

  async updateStatus(orderId: number, newStatus: OrderStatus): Promise<WashOrderWithRelations> {
    return this.errorUtils.withDatabaseErrorHandling('CambiarEstadoOrden', async () => {
      // ✅ TIPO PARA ORDER CON PAGOS
      type OrderWithPayments = Prisma.WashOrderGetPayload<{
        include: { payments: true };
      }>;

      const order = (await this.prisma.washOrder.findUnique({
        where: { id: orderId },
        include: { payments: true },
      })) as OrderWithPayments | null;

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

      // ✅ PREPARAR DATA CON TIMESTAMPS
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

      // ✅ TIPO PARA ORDER ACTUALIZADO
      type UpdatedOrderWithRelations = Prisma.WashOrderGetPayload<{
        include: {
          car: true;
          employee: true;
          services: { include: { service: true } };
          payments: true;
        };
      }>;

      const updatedOrder = (await this.prisma.washOrder.update({
        where: { id: orderId },
        data: updateData,
        include: {
          car: true,
          employee: true,
          services: { include: { service: true } },
          payments: true,
        },
      })) as UpdatedOrderWithRelations;

      this.logger.log(`Estado de orden ${orderId} actualizado`, {
        from: order!.status,
        to: newStatus,
      });

      return this.toWashOrderWithRelations(updatedOrder);
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

      // ✅ TIPO PARA ORDER CON PAGOS
      type OrderWithPayments = Prisma.WashOrderGetPayload<{
        include: { payments: true };
      }>;

      const order = (await this.prisma.washOrder.findUnique({
        where: { id },
        include: { payments: true },
      })) as OrderWithPayments | null;

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

      // ✅ TIPO PARA ORDER ELIMINADO
      type DeletedOrder = Prisma.WashOrderGetPayload<{
        include: {
          car: true;
          employee: true;
        };
      }>;

      const deleted = (await this.prisma.washOrder.delete({
        where: { id },
        include: {
          car: true,
          employee: true,
        },
      })) as DeletedOrder;

      this.logger.log('WashOrder eliminada', {
        orderId: deleted.id,
        car: deleted.car.plate,
      });

      // ✅ CONVERTIR A WashOrderWithRelations
      return {
        id: deleted.id,
        date: deleted.date,
        totalPrice: deleted.totalPrice,
        status: deleted.status as OrderStatus,
        startedAt: deleted.startedAt,
        completedAt: deleted.completedAt,
        deliveredAt: deleted.deliveredAt,
        carId: deleted.carId,
        employeeId: deleted.employeeId,
        car: deleted.car,
        employee: deleted.employee,
        services: [],
        payments: [],
      };
    });
  }

  async findOrdersByCar(
    carId: number,
    query: FindWashOrdersQueryDto,
  ): Promise<EnhancedPaginatedResponse<WashOrderWithRelations>> {
    return this.errorUtils.withDatabaseErrorHandling('BuscarOrdenesPorAuto', async () => {
      this.logger.log('Buscando órdenes por carId con paginación mejorada', {
        carId,
        page: query.page,
        limit: query.limit,
        filters: query.getAppliedFilters(),
      });

      // Preparar where clause con filtros
      const where: Prisma.WashOrderWhereInput = {
        carId,
      };

      // Aplicar filtro por status (además del carId)
      if (query.status) {
        where.status = query.status;
      }

      // Aplicar filtro por employeeId
      if (query.employeeId) {
        where.employeeId = query.employeeId;
      }

      // Aplicar filtro por rango de fechas
      if (query.dateFrom || query.dateTo) {
        where.date = {};

        if (query.dateFrom) {
          const dateFrom = query.getDateFromAsDate();
          if (dateFrom) {
            where.date.gte = dateFrom;
          }
        }

        if (query.dateTo) {
          const dateTo = query.getDateToAsDate();
          if (dateTo) {
            where.date.lte = dateTo;
          }
        }
      }

      // Preparar orderBy
      let orderBy: Prisma.WashOrderOrderByWithRelationInput = { date: 'desc' };

      const sortParams = query.getSortParams();
      if (sortParams) {
        const allowedFields = ['id', 'date', 'totalPrice', 'status'];
        if (allowedFields.includes(sortParams.field)) {
          orderBy = { [sortParams.field]: sortParams.direction };
        }
      }

      const skip = query.getSkip();
      const take = query.getTake();

      // ✅ TIPO EXPLÍCITO
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
        }) as Promise<OrderWithRelations[]>,
        this.prisma.washOrder.count({ where }),
      ]);

      // ✅ USAR FUNCIÓN DE CONVERSIÓN
      const typedOrders: WashOrderWithRelations[] = orders.map(order =>
        this.toWashOrderWithRelations(order),
      );

      return PaginationFormatter.formatEnhancedResponse(
        typedOrders,
        query,
        total,
        `/api/wash-order/car/${carId}`,
        query.getAppliedFilters(),
      );
    });
  }

  async getDashboardStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    ordersByStatus: Record<string, number>;
    recentOrders: WashOrderWithRelations[];
  }> {
    return this.errorUtils.withDatabaseErrorHandling('ObtenerEstadisticas', async () => {
      // ✅ TIPO PARA ORDENES RECIENTES
      type RecentOrder = Prisma.WashOrderGetPayload<{
        include: {
          car: true;
          employee: true;
          services: { include: { service: true } };
          payments: true;
        };
      }>;

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
        }) as Promise<RecentOrder[]>,
      ]);

      // Formatear estadísticas
      const statusCounts: Record<string, number> = {};
      ordersByStatus.forEach(item => {
        statusCounts[item.status] = item._count.id;
      });

      // ✅ CONVERTIR ORDENES RECIENTES
      const typedRecentOrders: WashOrderWithRelations[] = recentOrders.map(order =>
        this.toWashOrderWithRelations(order),
      );

      return {
        totalOrders,
        totalRevenue: totalRevenueResult._sum.totalPrice || 0,
        ordersByStatus: statusCounts,
        recentOrders: typedRecentOrders,
      };
    });
  }
}
