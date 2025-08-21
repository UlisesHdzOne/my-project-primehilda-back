// src/modules/address/utils/address.validator.ts
import { BadRequestException } from '@nestjs/common';
import { GeocodingService } from '../services/geocoding.service';
import { CacheService } from '../services/cache.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';

const PRECISION = 6;

function key(lat: number, lng: number) {
  return `${lat.toFixed(PRECISION)}:${lng.toFixed(PRECISION)}`;
}

export async function validateAddress(
  dto: CreateAddressDto | UpdateAddressDto,
  userId: number,
  prisma: PrismaService,
  geo: GeocodingService,
  cache: CacheService,
  isUpdate = false,
) {
  // Validar coordenadas
  if (dto.latitude == null || dto.longitude == null) {
    throw new BadRequestException('Faltan coordenadas');
  }

  const normalizedLat = parseFloat(dto.latitude.toFixed(PRECISION));
  const normalizedLng = parseFloat(dto.longitude.toFixed(PRECISION));

  const cacheKey = key(normalizedLat, normalizedLng);
  const cached = cache.get(cacheKey);

  const isValid =
    cached !== null
      ? cached
      : await geo.isAddressFor(normalizedLat, normalizedLng);

  if (cached === null) cache.set(cacheKey, isValid);

  if (!isValid) throw new BadRequestException('Coordenadas no válidas');

  // Validar nombre único por usuario
  const existing = await prisma.address.findFirst({
    where: { name: dto.name, userId },
  });

  if (existing && !isUpdate) {
    throw new BadRequestException('Ya tienes una dirección con este nombre');
  }
}
