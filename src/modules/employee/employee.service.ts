// src/modules/employee/employee.service.ts - VERSIÓN MEJORADA
import { Injectable } from '@nestjs/common';
import { Employee, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma.service';
import { AppLogger } from '@/core/logger/winston.config';
import { ErrorUtilsService } from '@/common/utils/error-utils.service';
import { EnhancedPaginatedResponse } from '@/common/types/pagination.types';
import { PaginationFormatter } from '@/common/utils/pagination-formatter.utils';
import { CreateEmployeeInput, UpdateEmployeeInput } from './types/employee.types';
import { FindEmployeesQueryDto } from './dto/find-employees-query.dto'; // ✅ Nuevo DTO
import { BusinessRuleError } from '@/core/errors/custom.errors';

@Injectable()
export class EmployeeService {
  private readonly logger = new AppLogger(EmployeeService.name); // ✅ Mejor: Usar clase.name

  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtils: ErrorUtilsService,
  ) {}

  async create(input: CreateEmployeeInput) {
    return this.errorUtils.withDatabaseErrorHandling('CrearEmpleado', async () => {
      this.logger.log('Creando empleado', { input });

      // ✅ VALIDACIÓN: Nombre no puede estar vacío
      if (!input.name || input.name.trim().length === 0) {
        throw this.errorUtils.validateEntityExists(null, 'Nombre de empleado');
      }

      const normalizedName = this.normalizeName(input.name);

      // ✅ VALIDACIÓN: Nombre único (opcional, según negocio)
      await this.validateNameUnique(normalizedName);

      const employee = await this.prisma.employee.create({
        data: { name: normalizedName },
      });

      this.logger.log('Empleado creado', {
        employeeId: employee.id,
        name: employee.name,
      });

      return employee;
    });
  }

  async findAll(query: FindEmployeesQueryDto): Promise<EnhancedPaginatedResponse<Employee>> {
    return this.errorUtils.withDatabaseErrorHandling('ListarEmpleados', async () => {
      this.logger.log('Buscando empleados con paginación mejorada', {
        page: query.page,
        limit: query.limit,
        search: query.search,
        filters: query.getAppliedFilters(),
      });

      // Preparar where clause con filtros
      const where: Prisma.EmployeeWhereInput = {};

      // ✅ Búsqueda por nombre (search general)
      if (query.search) {
        const searchTerm = query.getNormalizedSearch();
        where.name = { contains: searchTerm!, mode: 'insensitive' };
      }

      // ✅ Filtro específico por nombre (si se proporciona)
      if (query.name) {
        where.name = { contains: query.name, mode: 'insensitive' };
      }

      // Preparar orderBy
      let orderBy: Prisma.EmployeeOrderByWithRelationInput = { name: 'asc' };
      const sortParams = query.getSortParams();

      if (sortParams) {
        const allowedFields = ['id', 'name', 'createdAt'];
        if (allowedFields.includes(sortParams.field)) {
          orderBy = { [sortParams.field]: sortParams.direction };
        }
      }

      const skip = query.getSkip();
      const take = query.getTake();

      const [employees, total] = await Promise.all([
        this.prisma.employee.findMany({
          where,
          skip,
          take,
          orderBy,
          // ✅ Incluir estadísticas si es útil
          include: {
            _count: {
              select: {
                orders: true, // Cuántas órdenes ha atendido
              },
            },
          },
        }),
        this.prisma.employee.count({ where }),
      ]);

      // ✅ Formatear respuesta con metadata mejorada
      return PaginationFormatter.formatEnhancedResponse(
        employees,
        query,
        total,
        '/api/employee',
        query.getAppliedFilters(),
      );
    });
  }

  async findOne(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('BuscarEmpleado', async () => {
      this.logger.debug('Buscando empleado por id', { id });

      const employee = await this.prisma.employee.findUnique({
        where: { id },
        // ✅ Incluir información relacionada útil
        include: {
          orders: {
            take: 5, // Últimas 5 órdenes
            orderBy: { date: 'desc' },
            include: {
              car: true,
              services: { include: { service: true } },
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
      });

      if (!employee) {
        this.logger.warn('Empleado no encontrado', { id });
      }

      this.errorUtils.validateEntityExists(employee, 'Empleado');

      this.logger.debug('Empleado encontrado', {
        id,
        orderCount: employee?._count?.orders || 0,
      });

      return employee;
    });
  }

  async update(id: number, input: UpdateEmployeeInput) {
    return this.errorUtils.withDatabaseErrorHandling('ActualizarEmpleado', async () => {
      this.logger.debug('Actualizando empleado', { id, input });

      // ✅ Si se actualiza el nombre, normalizar y validar
      if (input.name) {
        input.name = this.normalizeName(input.name);
        await this.validateNameUnique(input.name, id);
      }

      const employee = await this.prisma.employee.update({
        where: { id },
        data: input,
      });

      this.logger.log('Empleado actualizado', {
        employeeId: employee.id,
        newName: employee.name,
      });

      return employee;
    });
  }

  async remove(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('EliminarEmpleado', async () => {
      this.logger.debug('Eliminando empleado', { id });

      // Obtener empleado y contar órdenes en paralelo
      const [employee, orderCount] = await Promise.all([
        this.prisma.employee.findUnique({ where: { id } }),
        this.prisma.washOrder.count({ where: { employeeId: id } }),
      ]);

      this.errorUtils.validateEntityExists(employee, 'Empleado');

      // REGLA DE NEGOCIO: No eliminar empleados con órdenes
      if (orderCount > 0) {
        this.logger.warn('No se puede eliminar empleado con órdenes asignadas', {
          id,
          employeeName: employee!.name,
          orderCount,
        });

        // ✅ BusinessRuleError sin `any`
        throw new BusinessRuleError(
          'EMPLOYEE_HAS_ORDERS',
          `No se puede eliminar el empleado "${employee!.name}" porque tiene ${orderCount} órdenes asignadas.`,
          {
            orderCount,
            employeeName: employee!.name,
            employeeId: employee!.id,
          },
        );
      }

      const deleted = await this.prisma.employee.delete({
        where: { id },
      });

      this.logger.log('Empleado eliminado', {
        employeeId: deleted.id,
        name: deleted.name,
      });

      return deleted;
    });
  }

  // ✅ NUEVO: Método para obtener estadísticas del empleado
  async getEmployeeStats(employeeId: number) {
    return this.errorUtils.withDatabaseErrorHandling('ObtenerEstadisticasEmpleado', async () => {
      this.logger.log('Obteniendo estadísticas del empleado', { employeeId });

      const employee = await this.prisma.employee.findUnique({
        where: { id: employeeId },
      });

      this.errorUtils.validateEntityExists(employee, 'Empleado');

      const [orderStats, revenueStats, recentOrders] = await Promise.all([
        // Total de órdenes por estado
        this.prisma.washOrder.groupBy({
          by: ['status'],
          where: { employeeId },
          _count: { id: true },
        }),
        // Ingresos generados
        this.prisma.washOrder.aggregate({
          where: { employeeId },
          _sum: { totalPrice: true },
        }),
        // Últimas 10 órdenes
        this.prisma.washOrder.findMany({
          where: { employeeId },
          take: 10,
          include: {
            car: true,
            services: { include: { service: true } },
          },
          orderBy: { date: 'desc' },
        }),
      ]);

      const statsByStatus: Record<string, number> = {};
      orderStats.forEach(stat => {
        statsByStatus[stat.status] = stat._count.id;
      });

      return {
        employeeId,
        name: employee!.name,
        totalOrders: orderStats.reduce((sum, stat) => sum + stat._count.id, 0),
        totalRevenue: revenueStats._sum.totalPrice || 0,
        ordersByStatus: statsByStatus,
        recentOrders,
      };
    });
  }

  // =========================
  // REGLAS DE NEGOCIO
  // =========================

  private normalizeName(name: string): string {
    // Capitalizar nombre: "juan perez" → "Juan Perez"
    return name
      .trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private async validateNameUnique(name: string, currentId?: number) {
    // Opcional: Validar que no exista otro empleado con mismo nombre
    const existingEmployee = await this.prisma.employee.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        ...(currentId && { id: { not: currentId } }),
      },
    });

    if (existingEmployee) {
      this.logger.warn('Validación de nombre fallida: ya existe un empleado con el mismo nombre', {
        name,
        existingEmployeeId: existingEmployee.id,
      });

      this.errorUtils.checkConflict(existingEmployee, 'Empleado', 'nombre');
    }
  }
}
