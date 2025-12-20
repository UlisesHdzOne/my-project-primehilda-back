import { IsEnum, IsInt, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { EnhancedPaginationQueryDto } from '@/common/dto/enhanced-pagination-query.dto';
import { OrderStatus } from '@/common/enums';

export class FindWashOrdersQueryDto extends EnhancedPaginationQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus, {
    message: 'Estado inválido. Opciones válidas: pending, in_progress, done, delivered, cancelled',
  })
  status?: OrderStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  carId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  employeeId?: number;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  // Método para obtener filtros aplicados como strings (para metadata)
  getAppliedFilters(): string[] {
    const filters: string[] = [];

    if (this.status) filters.push(`status=${this.status}`);
    if (this.carId) filters.push(`carId=${this.carId}`);
    if (this.employeeId) filters.push(`employeeId=${this.employeeId}`);
    if (this.dateFrom) filters.push(`dateFrom=${this.dateFrom}`);
    if (this.dateTo) filters.push(`dateTo=${this.dateTo}`);

    // Agregar filtros base si existen
    if (this.search) filters.push(`search=${this.search}`);
    if (this.sort) filters.push(`sort=${this.sort}`);

    return filters;
  }

  // En find-wash-orders-query.dto.ts - AGREGAR estos métodos:

  // Método para parsear fechas a objetos Date (más seguro)
  getDateFromAsDate(): Date | undefined {
    if (!this.dateFrom) return undefined;

    try {
      const date = new Date(this.dateFrom);
      return isNaN(date.getTime()) ? undefined : date;
    } catch {
      return undefined;
    }
  }

  getDateToAsDate(): Date | undefined {
    if (!this.dateTo) return undefined;

    try {
      const date = new Date(this.dateTo);
      return isNaN(date.getTime()) ? undefined : date;
    } catch {
      return undefined;
    }
  }
}
