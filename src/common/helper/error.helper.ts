import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export function throwBadRequest(errors: string[]): never {
  throw new BadRequestException({ message: errors, error: 'BAD_REQUEST' });
}

export function throwNotFound(message: string): never {
  throw new NotFoundException(message);
}

export function throwUnauthorized(message: string): never {
  throw new UnauthorizedException(message);
}

// O usa assertion signatures:
export function assertUserExists(
  user: any,
): asserts user is NonNullable<typeof user> {
  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }
}
