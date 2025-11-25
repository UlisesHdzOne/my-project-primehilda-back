import { PrismaService } from '@/database/prisma.service';
import { Student } from '@prisma/client';
import { CreateStudentDto } from '../dto/create-student.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class StudentRepository {
  constructor(private readonly prisma: PrismaService) {}

  //crud
  // crea un nuevo registro
  create(data: CreateStudentDto): Promise<Student> {
    return this.prisma.student.create({ data });
  }

  // lista todos los registros
  findAll(): Promise<Student[]> {
    return this.prisma.student.findMany();
  }

  // busca un registro por id
  findOne(id: number): Promise<Student | null> {
    return this.prisma.student.findUnique({ where: { id } });
  }

  // actualiza un registro
  update(id: number, data: UpdateStudentDto): Promise<Student> {
    return this.prisma.student.update({ where: { id }, data });
  }

  // elimina un registro
  async remove(id: number): Promise<Student> {
    try {
      return await this.prisma.student.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
      }
      throw error;
    }
  }

  // --- CONSULTAS ADICIONALES ---
  // busca registros por nombre
  findByName(name: string): Promise<Student[]> {
    return this.prisma.student.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
    });
  }

  // busca registros por paginación
  findAllPagination(skip: number, take: number): Promise<Student[]> {
    return this.prisma.student.findMany({ skip, take });
  }

  // --- UTILIDADES ---
  // valida si existe un estudiante por ID
  async exists(id: number): Promise<boolean> {
    return this.prisma.student.count({ where: { id } }).then(count => count > 0);
  }

  // contar todos los registros
  count(): Promise<number> {
    return this.prisma.student.count();
  }

  // --- RELACIONES ---
  // busca un estudiante e incluye sus cursos relacionados
  findWithCourses(id: number) {
    return this.prisma.student.findUnique({
      where: { id },
      include: { courses: true },
    });
  }
}
