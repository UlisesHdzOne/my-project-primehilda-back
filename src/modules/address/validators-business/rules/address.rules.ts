import { PrismaService } from 'src/prisma/prisma.service';

import { haversineDistance } from 'src/utils/haversine.utils';

const BUSINESS_COORDS = { lat: 16.70186, lon: -93.00942 };
const MAX_DISTANCE_KM = 5;

export const AddressRules = {
  // 1. Solo una dirección default por usuario
  onlyOneDefault: async (userId: number, prisma: PrismaService) => {
    const existingDefault = await prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
    return !existingDefault; // true si NO hay default todavía
  },

  // 2. Nombre único de dirección por usuario
  nameUniquePerUser: async (
    userId: number,
    name: string,
    prisma: PrismaService,
  ) => {
    if (!name) return true; // si no hay nombre no valida
    const existing = await prisma.address.findFirst({
      where: { userId, name },
    });
    return !existing; // true si NO existe, false si ya está ocupado
  },

  // coordenadas distintas de (0,0)
  notZeroZero: (lat: number, lng: number) => {
    return !(lat === 0 && lng === 0);
  },

  // coordenadas dentro de un bounding box (ejemplo: México aproximado)
  // insideMexico: (lat: number, lng: number) => {
  //   return lat >= 14 && lat <= 33 && lng >= -118 && lng <= -86;
  // },

  insideServiceArea: (lat: number, lng: number) => {
    const distance = haversineDistance(
      BUSINESS_COORDS.lat,
      BUSINESS_COORDS.lon,
      lat,
      lng,
    );
    return distance <= MAX_DISTANCE_KM;
  },

  // 1. No permitir que el usuario se quede sin direcciones
  hasMoreThanOneAddress: async (userId: number, prisma: PrismaService) => {
    const count = await prisma.address.count({ where: { userId } });
    return count > 1; // true si hay más de una dirección
  },

  // 2. Si se borra la default, debe existir otra para reemplazar
  canDeleteDefault: async (
    id: number,
    userId: number,
    prisma: PrismaService,
  ) => {
    const address = await prisma.address.findFirst({ where: { id, userId } });
    if (!address) return true; // si no existe, que lo maneje el service
    if (!address.isDefault) return true; // si no es default, no hay problema

    // Si es default, revisar que haya otra dirección
    const another = await prisma.address.findFirst({
      where: { userId, NOT: { id } },
    });

    return !!another; // true si hay otra dirección que puede volverse default
  },
};
