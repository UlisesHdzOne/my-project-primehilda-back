import { IsOptional, IsBoolean, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CategoryQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeProducts?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsIn(['name', 'id', 'createdAt'])
  orderBy?: string = 'name';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  name?: string;
}
