// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../../shared/constants/role.enum';
import { ROLES_KEY } from '../guards/roles.guard';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);