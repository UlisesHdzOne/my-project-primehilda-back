import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export const throwBadRequest = (errors: string[]) => {
  throw new BadRequestException({ message: errors, error: 'BAD_REQUEST' });
};

export const throwNotFound = (message: string): never => {
  throw new NotFoundException(message);
};

export const throwUnauthorized = (message: string): never => {
  throw new UnauthorizedException(message);
};
