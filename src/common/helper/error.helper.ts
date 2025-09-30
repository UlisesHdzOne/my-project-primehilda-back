import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export function throwBadRequest(message: string | string[]): never {
  throw new BadRequestException({ message, error: 'BAD_REQUEST', code: 400 });
}

export const throwNotFound = (message: string): never => {
  throw new NotFoundException(message);
};

export const throwUnauthorized = (message: string): never => {
  throw new UnauthorizedException(message);
};
