import { RegisterUserDto } from '../dto/register-user.dto';
import { AUTH_MESSAGES } from 'src/common/constants/index';
import { PrismaService } from 'src/prisma/prisma.service';
import { throwBadRequest } from 'src/common/helper/error.helper';

/**
 * Validaciones de negocio para el registro de usuario.
 * Dependen de la base de datos.
 */
export const AuthBusinessValidatorRegister = {
  /**
   * Función principal que orquesta las validaciones de negocio.
   * Se llama desde AuthService después de validar la entrada.
   */
  validar: async (
    dto: RegisterUserDto,
    prisma: PrismaService,
  ): Promise<void> => {
    await AuthBusinessValidatorRegister.emailUnico(dto.email, prisma);

    if (dto.phone) {
      await AuthBusinessValidatorRegister.telefonoUnico(dto.phone, prisma);
    }
  },

  // --- Funciones auxiliares ---

  /**
   * Verifica que el email no exista en la base de datos
   */
  emailUnico: async (email: string, prisma: PrismaService): Promise<void> => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) throwBadRequest(AUTH_MESSAGES.emailDuplicado);
  },

  /**
   * Verifica que el teléfono no exista en la base de datos
   */
  telefonoUnico: async (
    phone: string,
    prisma: PrismaService,
  ): Promise<void> => {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (user) throwBadRequest(AUTH_MESSAGES.telefonoDuplicado);
  },
};
