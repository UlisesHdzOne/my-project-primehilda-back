import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  // Método para calcular el offset
  getSkip(): number {
    return (this.page - 1) * this.limit;
  }

  // Método para obtener take
  getTake(): number {
    return this.limit;
  }
}
