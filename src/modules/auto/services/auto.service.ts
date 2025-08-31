import { Auto } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
//import { validarAutoEntrada } from 'src/utils/auto.utils';
//import { validarAutoNegocio } from '../rules/auto.rules';
import { CreateAutoDto } from '../dto/create-auto.dto';
import { AutoResponseDto } from '../dto/auto-response.dto';
import { AUTO_MESSAGES } from 'src/common/constants/auto-messages';
import { AutoValidator } from 'src/utils/auto.utils';
import { AutoBusinessValidatorCreate } from '../rules/auto-create.rules';
import { UpdateAutoDto } from '../dto/update-auto.dto';
import { AutoBusinessValidatorUpdate } from '../rules/auto-update.rules';

@Injectable()
export class AutoService {
  constructor(private prisma: PrismaService) {}

  async crearAuto(
    dto: CreateAutoDto,
    userId: number,
  ): Promise<AutoResponseDto> {
    // validaciones puras
    AutoValidator.validarEntradaCreate(dto);

    // reglas de negocio con DB
    await AutoBusinessValidatorCreate.validar(dto, userId, this.prisma);

    // si pasa, creamos el auto
    const autoCreado = await this.prisma.auto.create({
      data: {
        ...dto,
        userId,
      },
    });

    return {
      id: autoCreado.id,
      marca: autoCreado.marca,
      modelo: autoCreado.modelo,
      color: autoCreado.color,
      anio: autoCreado.anio,
      placas: autoCreado.placas,
      precio: autoCreado.precio,
      message: AUTO_MESSAGES.autoCreado,
    };
  }

  async updateAuto(
    id: number,
    dto: UpdateAutoDto,
    userId: number,
  ): Promise<AutoResponseDto> {
    // validaciones puras
    AutoValidator.validarEntradaUpdate(dto);

    // reglas de negocio con DB
    await AutoBusinessValidatorUpdate.validar(dto, userId, this.prisma, id);

    const autoActualizado = await this.prisma.auto.update({
      where: { id },
      data: { ...dto },
    });

    return {
      id: autoActualizado.id,
      color: autoActualizado.color,
      precio: autoActualizado.precio,
      message: AUTO_MESSAGES.autoActualizado,
    };
  }
}
