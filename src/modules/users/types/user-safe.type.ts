import type { User } from '@prisma/client';

type sensitiveFields = 'password';
type AuthFields = 'createdAt' | 'updatedAt';

export type UserSafe = Omit<User, sensitiveFields | AuthFields>;
