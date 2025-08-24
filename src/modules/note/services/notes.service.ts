import { NotesValidator } from './../validations/note-validations';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNoteDto } from '../dto/create-note.dto';

@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notesValidator: NotesValidator,
  ) {}

  async createNotes(dto: CreateNoteDto, userId: number) {
    const { title, content } = dto;

    await this.notesValidator.validateAll({
      userId,
      title,
      prisma: this.prisma,
    });

    const note = await this.prisma.notes.create({
      data: {
        title,
        content,
        userId,
      },
    });
    return note;
  }
}
