import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

// Interfaz para errores de campos específicos (formulario)
export interface ApiError {
  field?: string; // Campo relacionado al error, opcional
  message: string; // Mensaje de error claro y legible
  code?: string; // Código interno opcional
}

export class ErrorHelper {
  /**
   * Fail-fast o UX con múltiples errores
   * Bad Request: la petición contiene datos inválidos o errores de validación.
   * Puede incluir múltiples errores de campos (ApiError[]).
   */
  static badRequestException(message: string, errors?: ApiError[]): never {
    throw new BadRequestException({
      success: false,
      message: errors ? errors.map((e) => e.message) : [message],
      errors: errors || [],
      code: 400,
    });
  }

  /**
   * Not Found: el recurso solicitado no existe.
   * Ejemplo: usuario, producto o dirección no encontrados.
   */
  static notFoundException(message: string): never {
    throw new NotFoundException({ success: false, message, code: 404 });
  }

  /**
   * Forbidden: el usuario autenticado no tiene permisos suficientes
   * para realizar la acción solicitada.
   */
  static forbiddenException(message: string): never {
    throw new ForbiddenException({ success: false, message, code: 403 });
  }

  /**
   * Unauthorized: no hay token de autenticación o es inválido.
   * El usuario no está autenticado.
   */
  static unauthorizedException(message: string): never {
    throw new UnauthorizedException({ success: false, message, code: 401 });
  }
}
