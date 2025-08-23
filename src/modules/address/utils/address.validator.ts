import { BadRequestException } from '@nestjs/common';
import { GeocodingService } from '../services/geocoding.service';
import { CacheService } from '../services/cache.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { normalizeCoordinates } from './coords.helper';

// --- Función auxiliar: validar coords reales ---
async function validateRealCoordinates(
  latitude: number,
  longitude: number,
  geo: GeocodingService,
  cache: CacheService,
) {
  const cacheKey = `${latitude}:${longitude}`;
  const cached = cache.get(cacheKey);
  const isValid =
    cached !== null ? cached : await geo.isAddressFor(latitude, longitude);
  if (cached === null) cache.set(cacheKey, isValid);
  if (!isValid) throw new BadRequestException('Coordenadas no válidas');
}

// --- Función auxiliar: validar coords únicas ---
async function validateUniqueCoordinates(
  latitude: number,
  longitude: number,
  userId: number,
  prisma: PrismaService,
  excludeId?: number,
) {
  const where: any = { userId, latitude, longitude };
  if (excludeId != null) where.id = { not: excludeId };

  const existing = await prisma.address.findFirst({ where });
  if (existing)
    throw new BadRequestException(
      'Ya existe una dirección en estas coordenadas',
    );
}

// --- Función auxiliar: validar nombre único ---
async function validateUniqueName(
  name: string,
  userId: number,
  prisma: PrismaService,
  excludeId?: number,
) {
  const where: any = { userId, name };
  if (excludeId != null) where.id = { not: excludeId };

  const existing = await prisma.address.findFirst({ where });
  if (existing)
    throw new BadRequestException('Ya existe una dirección con este nombre');
}

// --- Validación para crear dirección ---
export async function validateCreateAddress(
  dto: CreateAddressDto,
  userId: number,
  prisma: PrismaService,
  geo: GeocodingService,
  cache: CacheService,
) {
  if (dto.latitude == null || dto.longitude == null) {
    throw new BadRequestException('Las coordenadas son obligatorias');
  }

  const coords = normalizeCoordinates(dto.latitude, dto.longitude);
  if (!coords) throw new BadRequestException('Coordenadas inválidas');

  await validateRealCoordinates(coords.latitude, coords.longitude, geo, cache);
  await validateUniqueCoordinates(
    coords.latitude,
    coords.longitude,
    userId,
    prisma,
  );

  if (dto.name) {
    await validateUniqueName(dto.name, userId, prisma);
  }

  return coords;
}

// --- Validación para actualizar dirección ---
export async function validateUpdateAddress(
  dto: UpdateAddressDto,
  userId: number,
  id: number,
  prisma: PrismaService,
  geo: GeocodingService,
  cache: CacheService,
) {
  let coords: { latitude: number; longitude: number } | undefined;

  if (dto.latitude != null && dto.longitude != null) {
    coords = normalizeCoordinates(dto.latitude, dto.longitude);
    if (!coords) throw new BadRequestException('Coordenadas inválidas');

    await validateRealCoordinates(
      coords.latitude,
      coords.longitude,
      geo,
      cache,
    );
    await validateUniqueCoordinates(
      coords.latitude,
      coords.longitude,
      userId,
      prisma,
      id,
    );
  }

  if (dto.name) {
    await validateUniqueName(dto.name, userId, prisma, id);
  }

  return coords;
}
