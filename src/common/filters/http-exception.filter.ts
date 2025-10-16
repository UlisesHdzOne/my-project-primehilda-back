// src/common/filters/http-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Interfaz que define la estructura del payload de error nativo de NestJS.
 * Cuando falla la validación de DTO (400 Bad Request), 'message' es un array de strings.
 */
interface NestExceptionResponse {
  message?: string | string[]; // Array de strings para validación, string para errores manuales
  error?: string;
  statusCode?: number;
  [key: string]: unknown; // Permite otras propiedades internas de NestJS
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Determinar el estado HTTP
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string[] = [];
    let error = 'ERROR';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();

      // La respuesta de la excepción de NestJS puede ser un string (simple) o un objeto (complejo)
      if (typeof res === 'string') {
        // Ejemplo: throw new BadRequestException('Email no válido');
        message = [res];
        error = exception.name.toUpperCase();
      } else if (Array.isArray(res)) {
        // Esta ruta es poco común, pero se maneja si la respuesta es solo un array
        message = res as string[];
        error = exception.name.toUpperCase();
      } else if (res && typeof res === 'object') {
        // Maneja el formato de error más común (ej. 400 ValidationPipe o errores de servicio manuales)
        const typedRes = res as NestExceptionResponse;
        const maybeMsg = typedRes.message;

        // El campo 'message' es el array de errores de validación de DTO (o un string simple)
        if (Array.isArray(maybeMsg)) {
          message = maybeMsg;
        } else if (typeof maybeMsg === 'string') {
          message = [maybeMsg];
        } else {
          // Si no hay mensaje claro, usar el error por defecto de la excepción
          message = [typedRes.error || exception.name];
        }

        error = typedRes.error || exception.name.toUpperCase();
      } else {
        message = ['Unexpected error'];
      }
    } else {
      // Manejar excepciones no HTTP (errores de código/runtime)
      // Nota: En producción, es mejor no exponer 'exception.toString()'
      message = ['Internal Server Error'];
      error = 'INTERNAL_SERVER_ERROR';
    }

    // 🌟 Estructura final de la respuesta JSON (tu formato deseado)
    response.status(status).json({
      success: false,
      message, // Array de strings que puede contener los mensajes de class-validator
      error,
      code: status,
    });
  }
}
