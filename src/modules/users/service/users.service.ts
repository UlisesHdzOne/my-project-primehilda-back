import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../repository/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from '../dto/response/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  // ==========================
  // CRUD / Operaciones principales
  // ==========================

  /**
   * Crea un nuevo usuario en la base de datos.
   * @param data - Datos del usuario a crear (CreateUserDto)
   * @returns Promise<UserResponseDto> - Usuario creado en formato DTO
   * @throws ConflictException si el teléfono ya está registrado
   */
  async createUser(data: CreateUserDto): Promise<UserResponseDto> {
    const exists = await this.userRepository.existsByPhone(data.phone);
    if (exists) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userRepository.create({ ...data, password: hashedPassword });

    return plainToInstance(UserResponseDto, user);
  }

  /**
   * Obtiene todos los usuarios de la base de datos.
   * @returns Promise<UserResponseDto[]> - Lista de usuarios en formato DTO
   */
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map(u => plainToInstance(UserResponseDto, u));
  }

  /**
   * Obtiene un usuario por su ID.
   * @param id - ID del usuario a buscar
   * @returns Promise<UserResponseDto> - Usuario encontrado en formato DTO
   * @throws NotFoundException si el usuario no existe
   */
  async getUserById(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    return plainToInstance(UserResponseDto, user);
  }

  /**
   * Obtiene un usuario junto con sus reservas.
   * @param id - ID del usuario
   * @returns Promise<UserResponseDto & { reservas: any[] }> - Usuario con reservas
   * @throws NotFoundException si el usuario no existe
   */
  async getUserWithReservations(id: number): Promise<UserResponseDto & { reservas: any[] }> {
    const user = await this.userRepository.findOneWithReservations(id);
    if (!user) throw new NotFoundException('User not found');

    return plainToInstance(UserResponseDto, user) as UserResponseDto & { reservas: any[] };
  }

  /**
   * Actualiza un usuario existente.
   * @param id - ID del usuario a actualizar
   * @param updateUserDto - Datos a actualizar (UpdateUserDto)
   * @returns Promise<UserResponseDto> - Usuario actualizado en formato DTO
   * @throws NotFoundException si el usuario no existe
   */
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    // Encriptar contraseña si se está actualizando
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userRepository.update(id, updateUserDto);
    return plainToInstance(UserResponseDto, updatedUser);
  }

  /**
   * Elimina un usuario de la base de datos.
   * @param id - ID del usuario a eliminar
   * @returns Promise<void>
   * @throws NotFoundException si el usuario no existe
   */
  async deleteUser(id: number): Promise<void> {
    const user = await this.userRepository.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    await this.userRepository.remove(id);
  }

  // ==========================
  // Métodos auxiliares / Utilities
  // ==========================

  /**
   * Verifica si un usuario existe por su ID.
   * @param id - ID del usuario
   * @returns Promise<boolean> - true si existe, false si no
   */
  async existsById(id: number): Promise<boolean> {
    return this.userRepository.existsById(id);
  }

  /**
   * Verifica si un usuario existe por su número de teléfono.
   * @param phone - Número de teléfono
   * @returns Promise<boolean> - true si existe, false si no
   */
  async existsByPhone(phone: string): Promise<boolean> {
    return this.userRepository.existsByPhone(phone);
  }
}
