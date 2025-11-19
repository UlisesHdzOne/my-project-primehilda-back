import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { AddressesRepository } from '../repositories/addresses.repository';
import { CreateAddressDto } from '../dtos/requests/create-address.dto';
import { UpdateAddressDto } from '../dtos/requests/update-address.dto';
import { AddressResponseDto } from '../dtos/responses/address-response.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly addressesRepository: AddressesRepository) {}

  async create(userId: number, createAddressDto: CreateAddressDto): Promise<AddressResponseDto> {
    const addressCount = await this.addressesRepository.countByUserId(userId);
    if (addressCount >= 10) {
      throw new ConflictException('Límite de direcciones alcanzado (máximo 10)');
    }

    const address = await this.addressesRepository.create(userId, createAddressDto);
    return new AddressResponseDto(address);
  }

  async findById(id: number, userId?: number): Promise<AddressResponseDto> {
    const address = await this.addressesRepository.findById(id);
    if (!address) {
      throw new NotFoundException('Dirección no encontrada');
    }

    if (userId && address.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para ver esta dirección');
    }

    return new AddressResponseDto(address);
  }

  async findByUserId(userId: number): Promise<AddressResponseDto[]> {
    const addresses = await this.addressesRepository.findByUserId(userId);
    return addresses.map(address => new AddressResponseDto(address));
  }

  async findDefaultByUserId(userId: number): Promise<AddressResponseDto | null> {
    const address = await this.addressesRepository.findDefaultByUserId(userId);
    return address ? new AddressResponseDto(address) : null;
  }

  async update(
    id: number,
    userId: number,
    updateAddressDto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    const existingAddress = await this.addressesRepository.findById(id);
    if (!existingAddress) {
      throw new NotFoundException('Dirección no encontrada');
    }

    if (existingAddress.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para editar esta dirección');
    }

    const updatedAddress = await this.addressesRepository.update(id, updateAddressDto);
    return new AddressResponseDto(updatedAddress);
  }

  async delete(id: number, userId: number): Promise<{ message: string }> {
    const existingAddress = await this.addressesRepository.findById(id);
    if (!existingAddress) {
      throw new NotFoundException('Dirección no encontrada');
    }

    if (existingAddress.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar esta dirección');
    }

    const addressCount = await this.addressesRepository.countByUserId(userId);
    if (addressCount <= 1) {
      throw new ConflictException('No puedes eliminar tu única dirección');
    }

    await this.addressesRepository.delete(id);
    return { message: 'Dirección eliminada exitosamente' };
  }

  async setDefault(id: number, userId: number): Promise<AddressResponseDto> {
    const existingAddress = await this.addressesRepository.findById(id);
    if (!existingAddress) {
      throw new NotFoundException('Dirección no encontrada');
    }

    if (existingAddress.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para editar esta dirección');
    }

    const updatedAddress = await this.addressesRepository.update(id, { isDefault: true });
    return new AddressResponseDto(updatedAddress);
  }
}
