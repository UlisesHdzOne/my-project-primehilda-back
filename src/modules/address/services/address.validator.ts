import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { ADDRESS_MESSAGES } from 'src/common/constants';
import { Address } from '@prisma/client';
import { haversineDistance } from 'src/utils/haversine.utils';

const BUSINESS_COORDS = { lat: 16.70186, lon: -93.00942 };
const MAX_DISTANCE_KM = 5;

@Injectable()
export class AddressValidator {
  constructor(private readonly prisma: PrismaService) {}

  // --- Validación de Existencia y Pertenencia ---

  /**
   * Valida que la dirección existe y pertenece al usuario.
   * Retorna la dirección si existe, o lanza NotFoundException.
   */
  async validateExistsAndBelongsToUser(
    id: number,
    userId: number,
  ): Promise<Address> {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });
    if (!address) {
      throw new NotFoundException(ADDRESS_MESSAGES.direccionNoEncontrada);
    }
    return address;
  }

  // --- Validación para CREATE ---

  async validateCreate(dto: CreateAddressDto, userId: number): Promise<void> {
    const errors: string[] = [];

    // 1. Unicidad del nombre (solo si se proporciona)
    if (dto.name && !(await this.isNameUnique(userId, dto.name))) {
      errors.push(ADDRESS_MESSAGES.nombreDuplicado);
    }

    // 2. Coordenadas
    if (!this.notZeroZero(dto.latitude, dto.longitude)) {
      errors.push(ADDRESS_MESSAGES.coordenadaInvalida);
    }
    if (!this.insideServiceArea(dto.latitude, dto.longitude)) {
      errors.push(ADDRESS_MESSAGES.fueraDeZona);
    }

    // 3. Dirección por defecto: solo si se marca como default Y ya existe una.
    if (dto.isDefault && (await this.hasDefaultAddress(userId))) {
      // Nota: Aquí podrías decidir si es un error o si el servicio debe desmarcar la anterior.
      // Si es un error de negocio, lo lanzamos:
      errors.push(ADDRESS_MESSAGES.defaultDuplicado);
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors); // ✅ Compatible con el filtro
    }
  }

  // --- Validación para UPDATE ---

  async validateUpdate(
    id: number,
    dto: UpdateAddressDto,
    userId: number,
  ): Promise<void> {
    // Verificar que existe y pertenece al usuario
    await this.validateExistsAndBelongsToUser(id, userId);

    const errors: string[] = [];

    // 1. Unicidad del nombre (solo si se proporciona y es nuevo)
    if (dto.name) {
      const isUnique = await this.isNameUnique(userId, dto.name, id);
      if (!isUnique) {
        errors.push(ADDRESS_MESSAGES.nombreDuplicado);
      }
    }

    // 2. Coordenadas (si se proporcionan)
    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      if (!this.notZeroZero(dto.latitude, dto.longitude)) {
        errors.push(ADDRESS_MESSAGES.coordenadaInvalida);
      }
      if (!this.insideServiceArea(dto.latitude, dto.longitude)) {
        errors.push(ADDRESS_MESSAGES.fueraDeZona);
      }
    }
    // Nota: La validación de 'isDefault' no es necesaria aquí. El servicio manejará la desmarcación.

    if (errors.length > 0) {
      throw new BadRequestException(errors); // ✅ Compatible con el filtro
    }
  }

  // --- Validación para DELETE ---

  async validateDelete(id: number, userId: number): Promise<Address> {
    const address = await this.validateExistsAndBelongsToUser(id, userId);

    // Regla: No se puede eliminar la única dirección por defecto si no hay otra.
    if (address.isDefault) {
      const hasAnotherAddress = await this.hasMoreThanOneAddress(userId);
      if (!hasAnotherAddress) {
        throw new BadRequestException(
          ADDRESS_MESSAGES.noSePuedeEliminarDefault,
        );
      }
    }
    return address; // Retornamos la entidad para que el servicio no tenga que volver a buscarla.
  }

  // --- Métodos Auxiliares (Antiguas AddressRules) ---

  private async isNameUnique(
    userId: number,
    name: string,
    excludeId?: number,
  ): Promise<boolean> {
    const existing = await this.prisma.address.findFirst({
      where: {
        userId,
        name,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
    return !existing;
  }

  private async hasDefaultAddress(userId: number): Promise<boolean> {
    const existingDefault = await this.prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
    return !!existingDefault;
  }

  private notZeroZero(lat: number, lng: number): boolean {
    return !(lat === 0 && lng === 0);
  }

  private insideServiceArea(lat: number, lng: number): boolean {
    const distance = haversineDistance(
      BUSINESS_COORDS.lat,
      BUSINESS_COORDS.lon,
      lat,
      lng,
    );
    return distance <= MAX_DISTANCE_KM;
  }

  private async hasMoreThanOneAddress(userId: number): Promise<boolean> {
    const count = await this.prisma.address.count({ where: { userId } });
    return count > 1;
  }
}
