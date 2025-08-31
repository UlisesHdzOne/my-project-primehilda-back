import { Auto } from '@prisma/client';
import { CreateAutoDto } from '../dto/create-auto.dto';
import { AUTO_MESSAGES, USER_MESSAGES } from 'src/common/constants/index';
import { throwBadRequest } from 'src/common/helper/error.helper';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * Validaciones que dependen de la base de datos (reglas de negocio)
 * Sirven para validar:
 * - que el usuario exista
 * - que no registre autos duplicados
 * - que no exceda el límite de autos
 */
export const AutoBusinessValidatorCreate = {
  /**
   * Función principal que orquesta todas las validaciones de negocio
   * Se llama desde AutoService después de validar la entrada
   */
  validar: async (
    dto: CreateAutoDto,
    userId: number,
    prisma: PrismaService,
  ): Promise<void> => {
    await AutoBusinessValidatorCreate.usuarioExiste(userId, prisma);
    const autos = await AutoBusinessValidatorCreate.obtenerAutosUsuario(
      dto,
      userId,
      prisma,
    );

    AutoBusinessValidatorCreate.checkPlacaDuplicada(dto, autos);
    AutoBusinessValidatorCreate.checkAutoDuplicado(dto, autos);
    AutoBusinessValidatorCreate.checkMaxAutos(autos);
  },

  // --- Funciones auxiliares ---

  /**
   * Verifica que el usuario exista en la base de datos
   */
  usuarioExiste: async (
    userId: number,
    prisma: PrismaService,
  ): Promise<void> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throwBadRequest(USER_MESSAGES.usuarioNoExiste);
  },

  /**
   * Obtiene autos del usuario que podrían causar conflicto
   * Para validar placas duplicadas o autos exactamente iguales
   */
  obtenerAutosUsuario: async (
    dto: CreateAutoDto,
    userId: number,
    prisma: PrismaService,
  ): Promise<Auto[]> =>
    prisma.auto.findMany({
      where: {
        userId,
        OR: [
          { placas: dto.placas }, // si ya existe la placa
          {
            marca: dto.marca,
            modelo: dto.modelo,
            color: dto.color,
            anio: dto.anio,
            placas: dto.placas,
          }, // si ya existe un auto exactamente igual
        ],
      },
    }),

  /**
   * Valida que la placa no esté duplicada
   */
  checkPlacaDuplicada: (dto: CreateAutoDto, autos: Auto[]): void => {
    if (autos.some((a) => a.placas === dto.placas))
      throwBadRequest(AUTO_MESSAGES.placaDuplicada);
  },

  /**
   * Valida que no haya un auto exactamente igual
   */
  checkAutoDuplicado: (dto: CreateAutoDto, autos: Auto[]): void => {
    if (
      autos.some(
        (a) =>
          a.marca === dto.marca &&
          a.modelo === dto.modelo &&
          a.color === dto.color &&
          a.anio === dto.anio &&
          a.placas === dto.placas,
      )
    )
      throwBadRequest(AUTO_MESSAGES.autoYaRegistrado);
  },

  /**
   * Valida que el usuario no tenga más de 10 autos
   */
  checkMaxAutos: (autos: Auto[]): void => {
    if (autos.length >= 10) throwBadRequest(AUTO_MESSAGES.maxAutos);
  },
};
