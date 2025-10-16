import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { USER_MESSAGES } from 'src/common/constants';
import { Role } from 'src/common/constants/role.enum';

@Injectable()
export class UserValidator {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida la creación de un usuario
   */
  async validateCreate(dto: CreateUserDto): Promise<void> {
    const errors: string[] = [];

    // 1. Validaciones de formato básico
    if (!dto.name || dto.name.trim().length < 2) {
      errors.push(USER_MESSAGES.nombreInvalido);
    }

    if (!dto.lastName || dto.lastName.trim().length < 2) {
      errors.push(USER_MESSAGES.apellidoInvalido);
    }

    if (!dto.email || !this.isValidEmail(dto.email)) {
      errors.push(USER_MESSAGES.emailInvalido);
    }

    if (!dto.phone || !this.isValidPhone(dto.phone)) {
      errors.push(USER_MESSAGES.telefonoInvalido);
    }

    if (!dto.password || dto.password.length < 8) {
      errors.push(USER_MESSAGES.passwordDebil);
    }

    // 2. Validaciones de negocio (solo si el formato es correcto)
    if (errors.length === 0) {
      const [emailExists, phoneExists] = await Promise.all([
        this.isEmailUnique(dto.email),
        this.isPhoneUnique(dto.phone),
      ]);

      if (!emailExists) {
        errors.push(USER_MESSAGES.emailDuplicado);
      }

      if (!phoneExists) {
        errors.push(USER_MESSAGES.telefonoDuplicado);
      }
    }

    // 3. Lanzar excepción si hay errores
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }

  /**
   * Valida la actualización de un usuario
   */
  async validateUpdate(id: number, dto: UpdateUserDto): Promise<void> {
    const errors: string[] = [];

    // 1. Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(USER_MESSAGES.usuarioNoExiste);
    }

    // 2. Validaciones de formato (solo campos proporcionados)
    if (dto.name !== undefined && (!dto.name || dto.name.trim().length < 2)) {
      errors.push(USER_MESSAGES.nombreInvalido);
    }

    if (
      dto.lastName !== undefined &&
      (!dto.lastName || dto.lastName.trim().length < 2)
    ) {
      errors.push(USER_MESSAGES.apellidoInvalido);
    }

    if (
      dto.email !== undefined &&
      (!dto.email || !this.isValidEmail(dto.email))
    ) {
      errors.push(USER_MESSAGES.emailInvalido);
    }

    if (
      dto.phone !== undefined &&
      (!dto.phone || !this.isValidPhone(dto.phone))
    ) {
      errors.push(USER_MESSAGES.telefonoInvalido);
    }

    if (
      dto.password !== undefined &&
      (!dto.password || dto.password.length < 8)
    ) {
      errors.push(USER_MESSAGES.passwordDebil);
    }

    // 3. Validaciones de unicidad (excluyendo el usuario actual)
    if (dto.email !== undefined) {
      const emailAvailable = await this.isEmailUnique(dto.email, id);
      if (!emailAvailable) {
        errors.push(USER_MESSAGES.emailDuplicado);
      }
    }

    if (dto.phone !== undefined) {
      const phoneAvailable = await this.isPhoneUnique(dto.phone, id);
      if (!phoneAvailable) {
        errors.push(USER_MESSAGES.telefonoDuplicado);
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }

  /**
   * Valida que se puede eliminar un usuario
   */
  async validateDelete(id: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        createdOrders: true,
        customerOrders: true,
      },
    });

    if (!user) {
      throw new NotFoundException(USER_MESSAGES.usuarioNoExiste);
    }

    // Reglas de negocio para eliminación
    const errors: string[] = [];

    if (user.addresses.length > 0) {
      errors.push(
        'No se puede eliminar un usuario con direcciones registradas',
      );
    }

    if (user.createdOrders.length > 0 || user.customerOrders.length > 0) {
      errors.push('No se puede eliminar un usuario con pedidos históricos');
    }

    // No eliminar el único admin
    if (user.role === (Role.ADMIN as string)) {
      const adminCount = await this.prisma.user.count({
        where: { role: Role.ADMIN as string },
      });

      if (adminCount <= 1) {
        errors.push('No se puede eliminar el único administrador del sistema');
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }

  /**
   * Valida que un usuario existe por ID
   */
  async validateUserExists(id: number): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(USER_MESSAGES.usuarioNoExiste);
    }
  }

  /**
   * Valida que un usuario existe por teléfono
   */
  async validateUserExistsByPhone(phone: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      throw new NotFoundException(`Usuario con teléfono ${phone} no existe`);
    }
  }

  // Métodos auxiliares privados
  private async isEmailUnique(
    email: string,
    excludeId?: number,
  ): Promise<boolean> {
    const existing = await this.prisma.user.findFirst({
      where: {
        email,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
    return !existing;
  }

  private async isPhoneUnique(
    phone: string,
    excludeId?: number,
  ): Promise<boolean> {
    const existing = await this.prisma.user.findFirst({
      where: {
        phone,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
    return !existing;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isValidPhone(phone: string): boolean {
    return /^\d{10,15}$/.test(phone);
  }
}
