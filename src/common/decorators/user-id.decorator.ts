import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthRequest } from 'src/types/express';

export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    return request.user?.id;
  },
);
