import { PrismaService } from 'src/prisma/prisma.service';

/**
 * Conjunto de reglas reutilizables para validar usuarios.
 * Estas funciones son atómicas y pueden usarse en create, update o delete.
 */
export const UserRules = {
  /**
   * Verifica si el email es único al crear un usuario.
   */
  emailUniqueCreate: async (email: string, prisma: PrismaService) => {
    if (!email) return true; // si no hay email, no valida
    const existing = await prisma.user.findUnique({ where: { email } });
    return !existing; // true si NO existe, false si ya está ocupado
  },

  /**
   * Verifica si el email es único al actualizar un usuario (excluyendo el propio id).
   */
  emailUniqueUpdate: async (
    id: number,
    email: string | undefined,
    prisma: PrismaService,
  ) => {
    if (!email) return true;
    const existing = await prisma.user.findFirst({
      where: { email, NOT: { id } },
    });
    return !existing;
  },

  /**
   * Verifica si el teléfono es único al crear un usuario.
   */
  phoneUniqueCreate: async (phone: string, prisma: PrismaService) => {
    if (!phone) return true;
    const existing = await prisma.user.findUnique({ where: { phone } });
    return !existing;
  },

  /**
   * Verifica si el teléfono es único al actualizar un usuario (excluyendo el propio id).
   */
  phoneUniqueUpdate: async (
    id: number,
    phone: string | undefined,
    prisma: PrismaService,
  ) => {
    if (!phone) return true;
    const existing = await prisma.user.findFirst({
      where: { phone, NOT: { id } },
    });
    return !existing;
  },

  /**
   * Verifica si un usuario existe por su id.
   * Retorna el usuario si existe o null si no.
   */
  existsById: async (id: number, prisma: PrismaService) => {
    if (!id) return null;
    return prisma.user.findUnique({ where: { id } });
  },
};
