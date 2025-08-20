// src/modules/address/utils/address.validator.ts
import { BadRequestException } from '@nestjs/common';
import { GeocodingService } from '../services/geocoding.service';
import { CacheService } from '../services/cache.service';

const PRECISION = 6;

function key(lat: number, lng: number) {
  return `${lat.toFixed(PRECISION)}:${lng.toFixed(PRECISION)}`;
}

export async function validateCoordinates(
  lat: number | undefined,
  lng: number | undefined,
  geo: GeocodingService,
  cache: CacheService,
): Promise<{ latitude: number; longitude: number }> {
  if (lat == null || lng == null) {
    throw new BadRequestException('Faltan coordenadas');
  }

  const normalizedLat = parseFloat(lat.toFixed(PRECISION));
  const normalizedLng = parseFloat(lng.toFixed(PRECISION));

  const cacheKey = key(normalizedLat, normalizedLng);
  const cached = cache.get(cacheKey);

  if (cached !== null && !cached) {
    throw new BadRequestException('Coordenadas inválidas (cache)');
  }

  const isValid =
    cached !== null ? cached : await geo.isAddressFor(normalizedLat, normalizedLng);

  if (cached === null) {
    cache.set(cacheKey, isValid);
  }

  if (!isValid) {
    throw new BadRequestException('Coordenadas no válidas');
  }

  return { latitude: normalizedLat, longitude: normalizedLng };
}
