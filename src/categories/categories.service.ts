import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateCategoryInput, UpdateCategoryInput } from './types/category.types';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateCategoryInput) {
    return this.prisma.category.create({ data: input });
  }

  findAll() {
    return this.prisma.category.findMany();
  }

  findOne(id: number) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  update(id: number, input: UpdateCategoryInput) {
    return this.prisma.category.update({ where: { id }, data: input });
  }

  remove(id: number) {
    return this.prisma.category.delete({ where: { id } });
  }
}
