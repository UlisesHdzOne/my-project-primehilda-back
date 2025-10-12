import { PrismaService } from 'src/prisma/prisma.service';
import { haversineDistance } from 'src/utils/haversine.utils';

const BUSINESS_COORDS = { lat: 16.70186, lon: -93.00942 };
const MAX_DISTANCE_KM = 5;

export const AddressRules = {
  // Solo puede existir una dirección default
  onlyOneDefault: async (userId: number, prisma: PrismaService) => {
    const existingDefault = await prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
    return !existingDefault;
  },

  // Nombre de dirección único por usuario
  nameUniquePerUser: async (
    userId: number,
    name: string,
    prisma: PrismaService,
  ) => {
    if (!name) return true;
    const existing = await prisma.address.findFirst({
      where: { userId, name },
    });
    return !existing;
  },

  // Coordenadas no pueden ser 0,0
  notZeroZero: (lat: number, lng: number) => !(lat === 0 && lng === 0),

  // Coordenadas dentro del área de servicio
  insideServiceArea: (lat: number, lng: number) => {
    const distance = haversineDistance(
      BUSINESS_COORDS.lat,
      BUSINESS_COORDS.lon,
      lat,
      lng,
    );
    return distance <= MAX_DISTANCE_KM;
  },

  // Usuario tiene más de una dirección
  hasMoreThanOneAddress: async (userId: number, prisma: PrismaService) => {
    const count = await prisma.address.count({ where: { userId } });
    return count > 1;
  },

  // Se puede eliminar la dirección default si hay otra
  canDeleteDefault: async (
    id: number,
    userId: number,
    prisma: PrismaService,
  ) => {
    const address = await prisma.address.findFirst({ where: { id, userId } });
    if (!address) return true;
    if (!address.isDefault) return true;
    const another = await prisma.address.findFirst({
      where: { userId, NOT: { id } },
    });
    return !!another;
  },
};
