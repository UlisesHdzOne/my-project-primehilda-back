import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  maxNotesPerTitle,
  maxNotesPerUser,
  Rule,
  RuleParams,
} from './note-rules';

@Injectable()
export class NotesValidator {
  private rules: Rule[] = [];

  constructor(private readonly prisma: PrismaService) {
    // Registrar reglas
    this.rules.push(maxNotesPerUser);
    this.rules.push(maxNotesPerTitle);
  }

  async validateAll(params: RuleParams) {
    for (const rule of this.rules) {
      await rule(params);
    }
  }
}
