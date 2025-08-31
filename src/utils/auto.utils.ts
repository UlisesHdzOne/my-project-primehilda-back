import { UpdateAutoDto } from './../modules/auto/dto/update-auto.dto';
import { CreateAutoDto } from 'src/modules/auto/dto/create-auto.dto';
import { AUTO_MESSAGES } from 'src/common/constants/auto-messages';
import { throwBadRequest } from 'src/common/helper/error.helper';

/**
 * Objeto que agrupa todas las validaciones puras
 * No dependen de la base de datos, solo de los datos de entrada.
 */
export const AutoValidator = {
  // Validaciones individuales
  placa: (placa: string): boolean => /^[A-Z]{3}-\d{3}$/.test(placa), // formato AAA-123
  anio: (anio: number): boolean =>
    anio >= 1900 && anio <= new Date().getFullYear(), // año válido
  precio: (precio: number): boolean => precio > 0 && precio <= 1_000_000, // precio positivo y máximo permitido

  color: (color: string): boolean => color.trim().length > 0,

  // Funciones que lanzan errores si la validación falla
  checkPlaca: (placa: string): void => {
    if (!AutoValidator.placa(placa))
      throwBadRequest(AUTO_MESSAGES.placaInvalida);
  },
  checkAnio: (anio: number): void => {
    if (!AutoValidator.anio(anio))
      throwBadRequest(AUTO_MESSAGES.anioFueraRango);
  },
  checkPrecio: (precio: number): void => {
    if (!AutoValidator.precio(precio))
      throwBadRequest(AUTO_MESSAGES.precioInvalido);
  },
  checkColor: (color: string): void => {
    if (!AutoValidator.color(color))
      throwBadRequest(AUTO_MESSAGES.colorInvalido);
  },

  /**
   * Orquestador principal de validaciones puras
   * Esta función se llama en AutoService antes de tocar la base de datos
   */
  validarEntradaCreate: (dto: CreateAutoDto): void => {
    AutoValidator.checkPlaca(dto.placas);
    AutoValidator.checkAnio(dto.anio);
    AutoValidator.checkPrecio(dto.precio);
  },

  validarEntradaUpdate: (dto: UpdateAutoDto): void => {
    if (dto.precio !== undefined) AutoValidator.checkPrecio(dto.precio);
    if (dto.color !== undefined) AutoValidator.checkColor(dto.color);
  },
};
