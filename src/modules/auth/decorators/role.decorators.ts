import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/common/constants/role.enum';
import { ROLES_KEY } from 'src/guards/roles.guard';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);