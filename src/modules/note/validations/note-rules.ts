import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export type RuleParams = {
  userId: number;
  title?: string;
  extraParam?: number;
  extraParam2?: number;

  prisma: PrismaService;
};
export type Rule = (params: RuleParams) => Promise<void>;

// Validación: máximo 10 notas por usuario
export const maxNotesPerUser: Rule = async ({ userId, prisma }) => {
  const count = await prisma.notes.count({ where: { userId } });
  if (count >= 10) {
    throw new BadRequestException('Ya tienes 10 notas, no puedes crear más');
  }
};

// Validación: máximo 3 notas con el mismo título por usuario
export const maxNotesPerTitle: Rule = async ({ userId, title, prisma }) => {
  if (!title) return;
  const count = await prisma.notes.count({ where: { userId, title } });
  if (count >= 3) {
    throw new BadRequestException('Ya tienes 3 notas con este título');
  }
};

// Ejemplo: otra regla con tres parámetros
export const otherRuleNeedingThreeParams: Rule = async ({ extraParam }) => {
  if (extraParam && extraParam < 5) {
    throw new BadRequestException('Extra param no puede ser menor a 5');
  }
};
