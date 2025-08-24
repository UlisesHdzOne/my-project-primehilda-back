import { Body, Controller, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { NotesService } from '../services/notes.service';
import { CreateNoteDto } from '../dto/create-note.dto';
import type { AuthRequest } from 'src/types/express';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}
  @Post()
  async createNote(@Body() dto: CreateNoteDto, @Req() req: AuthRequest) {
    return this.notesService.createNotes(dto, req.user.id);
  }
}
         