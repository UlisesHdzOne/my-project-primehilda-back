// src/modules/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
//import { Role } from '@prisma/client';
import { ROLES_KEY } from '../guards/roles.guard';
import { Role } from 'src/common/constants/role.enum';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);