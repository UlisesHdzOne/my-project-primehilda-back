import { Auto } from '@prisma/client';
import { UpdateAutoDto } from '../dto/update-auto.dto';
import { AUTO_MESSAGES, USER_MESSAGES } from 'src/common/constants/index';
import { throwBadRequest } from 'src/common/helper/error.helper';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * Validaciones de negocio para actualizar autos
 * - Solo el dueño puede actualizar
 * - Se pueden agregar reglas extra para precio y color
 */
export const AutoBusinessValidatorUpdate = {
  validar: async (
    dto: UpdateAutoDto,
    userId: number,
    prisma: PrismaService,
    autoId: number,
  ): Promise<void> => {
    // Verifica que el usuario sea dueño y obtiene el auto
    const auto = await AutoBusinessValidatorUpdate.usuarioEsDueno(
      userId,
      prisma,
      autoId,
    );

    // Reglas de negocio sobre precio
    if (dto.precio !== undefined) {
      AutoBusinessValidatorUpdate.validarReduccionPrecio(
        dto.precio,
        auto.precio,
      );
      AutoBusinessValidatorUpdate.validarAumentoPrecio(dto.precio, auto.precio);
    }

    // Reglas de negocio sobre color
    if (dto.color !== undefined) {
      AutoBusinessValidatorUpdate.validarCambioColor(
        dto.color,
        auto.color,
        auto.updateAt,
      );
    }
  },

  /**
   * Verifica que el auto exista y que el usuario sea su dueño
   */
  usuarioEsDueno: async (
    userId: number,
    prisma: PrismaService,
    autoId: number,
  ): Promise<Auto> => {
    const auto = await prisma.auto.findUnique({ where: { id: autoId } });
    if (!auto) throwBadRequest(AUTO_MESSAGES.autoNoExiste);
    if (auto.userId !== userId)
      throwBadRequest(USER_MESSAGES.sinPermisoActualizarAuto);
    return auto;
  },

  /**
   * No permitir bajar más del 50% del precio actual
   */
  validarReduccionPrecio: (nuevoPrecio: number, precioActual: number): void => {
    if (nuevoPrecio < precioActual * 0.5)
      throwBadRequest(AUTO_MESSAGES.precioDemasiadoBajo);
  },

  /**
   * No permitir duplicar el precio de golpe
   */
  validarAumentoPrecio: (nuevoPrecio: number, precioActual: number): void => {
    if (nuevoPrecio > precioActual * 2)
      throwBadRequest(AUTO_MESSAGES.precioDemasiadoAlto);
  },

  /**
   * Evitar cambios frecuentes de color
   * No permitir cambiar el color más de 1 vez cada X días (ej: 7 días)
   */
  validarCambioColor: (
    nuevoColor: string,
    colorActual: string,
    ultimaActualizacion: Date,
  ): void => {
    const DIAS_MINIMOS = 7;
    const fechaLimite = new Date(ultimaActualizacion);
    fechaLimite.setDate(fechaLimite.getDate() + DIAS_MINIMOS);

    if (nuevoColor !== colorActual && new Date() < fechaLimite)
      throwBadRequest(AUTO_MESSAGES.cambioColorReciente);
  },
};
