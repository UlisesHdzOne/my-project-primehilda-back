import { Injectable, NotFoundException } from '@nestjs/common';
import { StudentRepository } from '../repository/student.repository';
import { CreateStudentDto } from '../dto/create-student.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';
import { StudentResponseDto } from '../dto/response/student-response.dto';

@Injectable()
export class StudentService {
  constructor(private readonly studentRepository: StudentRepository) {}

  // crear estudiante
  async create(data: CreateStudentDto): Promise<StudentResponseDto> {
    const student = await this.studentRepository.create(data);

    return {
      id: student.id,
      name: student.name,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }

  // obtener todos
  async findAll(): Promise<StudentResponseDto[]> {
    const students = await this.studentRepository.findAll();

    return students.map(s => ({
      id: s.id,
      name: s.name,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }

  // obtener uno por id
  async findOne(id: number): Promise<StudentResponseDto> {
    const student = await this.studentRepository.findOne(id);
    if (!student) throw new NotFoundException('Estudiante no encontrado');
    return {
      id: student.id,
      name: student.name,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }

  // actualizar estudiante
  async update(id: number, data: UpdateStudentDto): Promise<StudentResponseDto> {
    const exists = await this.studentRepository.exists(id);
    if (!exists) throw new NotFoundException('Estudiante no encontrado');

    const student = await this.studentRepository.update(id, data);
    return {
      id: student.id,
      name: student.name,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }

  // eliminar estudiante
  async remove(id: number): Promise<StudentResponseDto> {
    const exists = await this.studentRepository.exists(id);
    if (!exists) throw new NotFoundException('Estudiante no encontrado');

    const student = await this.studentRepository.remove(id);
    return {
      id: student.id,
      name: student.name,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }

  // buscar por nombre
  findByName(name: string) {
    return this.studentRepository.findByName(name);
  }

  // paginación
  findAllPagination(skip: number, take: number) {
    return this.studentRepository.findAllPagination(skip, take);
  }

  // contar estudiantes
  count() {
    return this.studentRepository.count();
  }

  // obtener estudiante con sus cursos
  async findWithCourses(id: number) {
    const student = await this.studentRepository.findWithCourses(id);
    if (!student) throw new NotFoundException('Estudiante no encontrado');
    return student;
  }

  // validar si un estudiante ya está inscrito a un curso
  async isEnrolled(studentId: number, courseId: number) {
    const student = await this.studentRepository.findWithCourses(studentId);
    if (!student) throw new NotFoundException('Estudiante no encontrado');

    return student.courses.some(c => c.id === courseId);
  }
}
