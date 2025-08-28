// src/utils/address.utils.ts

import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from 'src/modules/address/dto/create-address.dto';
import { UpdateAddressDto } from 'src/modules/address/dto/update-address.dto';
import { GeocodingService } from 'src/modules/address/services/geocoding.service';
import { CacheService } from 'src/modules/address/services/cache.service';

// Normaliza las coordenadas para una mayor precisión.
export const normalizeCoordinates = (
  latitude: number,
  longitude: number,
  precision = 6,
): { latitude: number; longitude: number } | undefined => {
  if (latitude == null || longitude == null) return undefined;

  const lat = parseFloat(latitude.toFixed(precision));
  const lng = parseFloat(longitude.toFixed(precision));

  if (isNaN(lat) || isNaN(lng)) throw new BadRequestException('Coordenadas inválidas');

  return { latitude: lat, longitude: lng };
};

// Valida si un nombre de dirección ya existe para el usuario.
export const validateUniqueName = async (
  name: string,
  userId: number,
  prisma: PrismaService,
  excludeId?: number,
): Promise<void> => {
  const where: any = { userId, name };
  if (excludeId != null) where.id = { not: excludeId };

  const existing = await prisma.address.findFirst({ where });
  if (existing) {
    throw new BadRequestException('Ya existe una dirección con este nombre');
  }
};

// Valida si un par de coordenadas ya existe para el usuario.
export const validateUniqueCoordinates = async (
  latitude: number,
  longitude: number,
  userId: number,
  prisma: PrismaService,
  excludeId?: number,
): Promise<void> => {
  const where: any = { userId, latitude, longitude };
  if (excludeId != null) where.id = { not: excludeId };

  const existing = await prisma.address.findFirst({ where });
  if (existing) {
    throw new BadRequestException('Ya existe una dirección en estas coordenadas');
  }
};

// Valida si las coordenadas corresponden a una dirección real.
export const validateRealCoordinates = async (
  latitude: number,
  longitude: number,
  geo: GeocodingService,
  cache: CacheService,
): Promise<void> => {
  const cacheKey = `${latitude}:${longitude}`;
  const cached = cache.get(cacheKey);
  const isValid = cached !== null ? cached : await geo.isAddressFor(latitude, longitude);
  if (cached === null) cache.set(cacheKey, isValid);
  if (!isValid) throw new BadRequestException('Coordenadas no válidas');
};

// Valida si la nueva dirección debe ser la predeterminada.
export const shouldBeDefault = async (
  userId: number,
  prisma: PrismaService,
): Promise<boolean> => {
  const count = await prisma.address.count({ where: { userId } });
  return count === 0;
};

// Valida la propiedad de una dirección por parte del usuario.
export const validateAddressOwnership = async (
  addressId: number,
  userId: number,
  prisma: PrismaService,
) => {
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) {
    throw new BadRequestException('No puedes modificar esta dirección');
  }
  return address;
};

// Validación completa para la creación de una dirección.
export const validateCreateAddress = async (
  dto: CreateAddressDto,
  userId: number,
  prisma: PrismaService,
  geo: GeocodingService,
  cache: CacheService,
) => {
  const coords = normalizeCoordinates(dto.latitude, dto.longitude);
  if (!coords) throw new BadRequestException('Coordenadas inválidas');

  await validateRealCoordinates(coords.latitude, coords.longitude, geo, cache);
  await validateUniqueCoordinates(coords.latitude, coords.longitude, userId, prisma);

  if (dto.name) {
    await validateUniqueName(dto.name, userId, prisma);
  }

  return coords;
};

// Validación completa para la actualización de una dirección.
export const validateUpdateAddress = async (
  dto: Partial<UpdateAddressDto>,
  userId: number,
  id: number,
  prisma: PrismaService,
  geo: GeocodingService,
  cache: CacheService,
) => {
  let coords;
  if (dto.latitude != null && dto.longitude != null) {
    coords = normalizeCoordinates(dto.latitude, dto.longitude);
    if (!coords) throw new BadRequestException('Coordenadas inválidas');

    await validateRealCoordinates(coords.latitude, coords.longitude, geo, cache);
    await validateUniqueCoordinates(coords.latitude, coords.longitude, userId, prisma, id);
  }
  
  if (dto.name) {
    await validateUniqueName(dto.name, userId, prisma, id);
  }

  return coords;
};