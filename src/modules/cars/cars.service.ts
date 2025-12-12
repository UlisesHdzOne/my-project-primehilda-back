import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { CreateCarInput, UpdateCarInput } from './types/car.types';

@Injectable()
export class CarsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateCarInput) {
    const car = await this.prisma.car.create({ data: input });
    return car;
  }

  async findAll() {
    const cars = this.prisma.car.findMany();
    return cars;
  }

  async findOne(id: number) {
    const car = await this.prisma.car.findUnique({ where: { id } });
    return car;
  }

  async update(id: number, input: UpdateCarInput) {
    const updateCar = await this.prisma.car.update({
      where: { id },
      data: input,
    });
    return updateCar;
  }

  async remove(id: number) {
    const car = await this.prisma.car.delete({ where: { id } });
    return car;
  }
}
