import { BadRequestException } from '@nestjs/common';
import { GeocodingService } from '../services/geocoding.service';
import { CacheService } from '../services/cache.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
 
export async function validateAddress(
  dto: CreateAddressDto | UpdateAddressDto,
  userId: number,
  prisma: PrismaService,
  geo: GeocodingService,
  cache: CacheService,
  isUpdate = false,
  currentId?: number, // id actual en caso de update
) {
  const PRECISION = 6;

  function key(lat: number, lng: number) {
    return `${lat.toFixed(PRECISION)}:${lng.toFixed(PRECISION)}`;
  }

  // --- Validar coordenadas (siempre obligatorias) ---
  if (dto.latitude == null || dto.longitude == null) {
    throw new BadRequestException('Faltan coordenadas');
  }

  const normalizedLat = parseFloat(dto.latitude.toFixed(PRECISION));
  const normalizedLng = parseFloat(dto.longitude.toFixed(PRECISION));

  // --- Validar que las coordenadas sean reales ---
  const cacheKey = key(normalizedLat, normalizedLng);
  const cached = cache.get(cacheKey);

  const isValid =
    cached !== null
      ? cached
      : await geo.isAddressFor(normalizedLat, normalizedLng);

  if (cached === null) cache.set(cacheKey, isValid);

  if (!isValid) {
    throw new BadRequestException('Coordenadas no válidas');
  }

  // --- Validar coordenadas únicas por usuario ---
  const existingCoords = await prisma.address.findFirst({
    where: {
      userId,
      latitude: normalizedLat,
      longitude: normalizedLng,
      ...(isUpdate && currentId != null ? { id: { not: currentId } } : {}),
    },
  });

  if (existingCoords) {
    throw new BadRequestException(
      'Ya tienes una dirección registrada en estas coordenadas',
    );
  }

  // --- Validar nombre único por usuario (si hay nombre) ---
  if (dto.name) {
    const where: any = { userId, name: dto.name };
    if (isUpdate && currentId != null) {
      where.id = { not: currentId };
    }

    const existingName = await prisma.address.findFirst({ where });

    if (existingName) {
      throw new BadRequestException('Ya tienes una dirección con este nombre');
    }
  }
}
