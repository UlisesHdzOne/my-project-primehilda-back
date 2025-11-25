import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================
  // CRUD (Create, Read, Update, Delete)
  // ==========================

  /**
   * Crea un nuevo usuario en la base de datos.
   * @param data - Datos del usuario a crear (CreateUserDto)
   * @returns Promise<User> - Usuario creado
   */
  create(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({ data });
  }

  /**
   * Obtiene todos los usuarios de la base de datos.
   * @returns Promise<User[]> - Lista de usuarios
   */
  findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  /**
   * Busca un usuario por su ID.
   * @param id - ID del usuario
   * @returns Promise<User | null> - Usuario encontrado o null si no existe
   */
  findOne(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Busca un usuario por su número de teléfono.
   * @param phone - Número de teléfono del usuario
   * @returns Promise<User | null> - Usuario encontrado o null si no existe
   */
  findOneByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  /**
   * Obtiene un usuario junto con sus reservas.
   * @param id - ID del usuario
   * @returns Promise<User | null> - Usuario con reservas o null si no existe
   */
  findOneWithReservations(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { reservas: true },
    });
  }

  /**
   * Actualiza un usuario existente.
   * @param id - ID del usuario a actualizar
   * @param data - Datos a actualizar (UpdateUserDto)
   * @returns Promise<User> - Usuario actualizado
   */
  update(id: number, data: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  /**
   * Elimina un usuario de la base de datos.
   * @param id - ID del usuario a eliminar
   * @returns Promise<User> - Usuario eliminado
   */
  remove(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

  // ==========================
  // Utilities / Métodos auxiliares
  // ==========================

  /**
   * Verifica si un usuario existe por su ID.
   * @param id - ID del usuario
   * @returns Promise<boolean> - true si existe, false si no
   */
  async existsById(id: number): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { id } });
    return count > 0;
  }

  /**
   * Verifica si un usuario existe por su número de teléfono.
   * @param phone - Número de teléfono del usuario
   * @returns Promise<boolean> - true si existe, false si no
   */
  async existsByPhone(phone: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { phone } });
    return count > 0;
  }
}
