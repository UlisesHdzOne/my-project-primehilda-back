import { Injectable } from '@nestjs/common';
import { CreateEmployeeInput, UpdateEmployeeInput } from './types/employee.types';
import { PrismaService } from '@/core/database/prisma.service';
import { AppLogger } from '@/core/logger/winston.config';
import { ErrorUtilsService } from '@/common/utils/error-utils.service';
import { PaginatedResponse } from '@/common/types/pagination.types';
import { Employee } from '@prisma/client';
import { PaginationUtils } from '@/common/utils/pagination.utils';

@Injectable()
export class EmployeeService {
  private readonly logger = new AppLogger('EmployeeService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtils: ErrorUtilsService,
  ) {}

  create(input: CreateEmployeeInput) {
    return this.errorUtils.withDatabaseErrorHandling('CrearEmpleado', async () => {
      const employee = await this.prisma.employee.create({ data: input });
      this.logger.log('Empleado creado', { employeeId: employee.id });
      return employee;
    });
  }

  findAll(page = 1, limit = 10): Promise<PaginatedResponse<Employee>> {
    return this.errorUtils.withDatabaseErrorHandling('ListarEmpleados', async () => {
      this.logger.debug('Listando empleados con paginación', { page, limit });

      const skip = (page - 1) * limit;

      const [employees, total] = await Promise.all([
        this.prisma.employee.findMany({
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        this.prisma.employee.count(),
      ]);

      return PaginationUtils.createResponse(employees, page, limit, total);
    });
  }

  findOne(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('BuscarEmpleado', async () => {
      this.logger.debug('Buscando empleado por id', { id });
      const employee = await this.prisma.employee.findUnique({ where: { id } });

      if (!employee) this.logger.warn('Empleado no encontrado', { id });

      this.errorUtils.validateEntityExists(employee, 'Empleado');
      return employee;
    });
  }

  update(id: number, input: UpdateEmployeeInput) {
    return this.errorUtils.withDatabaseErrorHandling('ActualizarEmpleado', async () => {
      this.logger.debug('Actualizando empleado', { id });

      const employee = await this.prisma.employee.update({
        where: { id },
        data: input,
      });

      this.logger.log('Empleado actualizado', { employeeId: employee.id });
      return employee;
    });
  }

  remove(id: number) {
    return this.errorUtils.withDatabaseErrorHandling('EliminarEmpleado', async () => {
      this.logger.debug('Eliminando empleado', { id });

      const deleted = await this.prisma.employee.delete({
        where: { id },
      });

      this.logger.log('Empleado eliminado', { employeeId: deleted.id });
      return deleted;
    });
  }
}
