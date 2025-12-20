import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { ErrorUtilsService } from '@/common/utils/error-utils.service';
import { AppLogger } from '@/core/logger/winston.config';
import type { CreateVehicleInput } from './types/vehicle.types';

@Injectable()
export class VehiclesService {
  private readonly logger = new AppLogger('VehiclesService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtils: ErrorUtilsService,
  ) {}

  async register(input: CreateVehicleInput) {
    return this.errorUtils.withDatabaseErrorHandling('RegistrarVehiculo', async () => {
      const plate = this.normalizePlate(input.plateNumber);

      this.logger.debug('Normalizando placa', {
        original: input.plateNumber,
        normalized: plate,
      });

      const existing = await this.prisma.vehicle.findUnique({
        where: { plateNumber: plate },
      });

      // 👉 existe y está activo → conflicto
      if (existing && existing.isActive) {
        this.logger.warn('Vehículo ya registrado y activo', {
          vehicleId: existing.id,
          plate,
        });
        this.errorUtils.checkConflict(existing, 'Vehículo', 'placa');
      }

      // 👉 existe pero inactivo → reactivar
      if (existing && !existing.isActive) {
        this.logger.log('Reactivando vehículo', {
          vehicleId: existing.id,
          plate,
        });

        return this.prisma.vehicle.update({
          where: { id: existing.id },
          data: {
            plateNumber: plate,
            brand: input.brand,
            model: input.model,
            color: input.color,
            notes: input.notes,
            isActive: true,
          },
        });
      }

      // 👉 no existe → crear
      return this.prisma.vehicle.create({
        data: {
          plateNumber: plate,
          brand: input.brand,
          model: input.model,
          color: input.color,
          notes: input.notes,
        },
      });
    });
  }

  private normalizePlate(plate: string): string {
    return plate.trim().toUpperCase();
  }
}
