import { Module } from '@nestjs/common';
import { NotesService } from './services/notes.service';
import { NotesValidator } from './validations/note-validations';

@Module({
  providers: [NotesService, NotesValidator],
  controllers: [],
})
export class NotesModule {}
