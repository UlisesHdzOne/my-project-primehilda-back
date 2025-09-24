import { PrismaService } from 'src/prisma/prisma.service';
import { throwBadRequest } from 'src/common/helper/error.helper';
import { comparePassword } from 'src/utils/auth.utils';
import { AUTH_MESSAGES } from 'src/common/constants/index';

export const AuthBusinessValidatorLogin = {
  /**
   * Función principal que valida las reglas de negocio para login
   */
  validar: async (email: string, password: string, prisma: PrismaService) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throwBadRequest(AUTH_MESSAGES.usuarioNoExiste);

    const isValid = await comparePassword(password, user.password);
    if (!isValid) throwBadRequest(AUTH_MESSAGES.passwordIncorrecta);

    return user;
  },
};
