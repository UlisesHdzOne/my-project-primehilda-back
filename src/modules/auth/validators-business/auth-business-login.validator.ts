// AuthBusinessValidatorLogin (Fail-fast)
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRules } from './rules/auth.rules';
import { ErrorHelper } from 'src/common/helper/error.helper';
import { AUTH_MESSAGES } from 'src/common/constants';
import { LoginUserDto } from '../dto/login-user.dto';
import { UserEntity } from '../entities/user.entity';

export const AuthBusinessValidatorLogin = {
  validate: async (
    dto: LoginUserDto,
    prisma: PrismaService,
  ): Promise<UserEntity> => {
    const user = await AuthRules.validateCredentials(
      dto.email,
      dto.password,
      prisma,
    );

    if (!user) {
      // Fail-fast: lanzamos de inmediato, no seguimos validando
      ErrorHelper.badRequestException(AUTH_MESSAGES.credencialesInvalidas);
    }

    return user;
  },
};
