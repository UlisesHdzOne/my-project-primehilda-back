import { Injectable, BadRequestException } from '@nestjs/common';
import { FreeOptionDto } from '../dto/free-option.dto';
import { ProductType } from 'src/common/constants/product-types.enum';
import { OrderType } from 'src/common/constants/order-type.enum';

@Injectable()
export class FreeOptionValidator {
  validate(freeOptions: FreeOptionDto[]): void {
    const errors: string[] = [];
    const uniqueOptions = new Set<string>();
    let totalQuantity = 0;

    freeOptions.forEach((opt, i) => {
      if (!Object.values(ProductType).includes(opt.category)) {
        errors.push(
          `freeOptions[${i}]: Categoría '${opt.category}' no es válida.`,
        );
      }

      if (!Object.values(OrderType).includes(opt.orderType)) {
        errors.push(
          `freeOptions[${i}]: Tipo de orden '${opt.orderType}' no es válido.`,
        );
      }

      // Validar duplicados
      const key = `${opt.category}:${opt.orderType}`;
      if (uniqueOptions.has(key)) {
        errors.push(
          `freeOptions[${i}]: Opción duplicada para Categoría '${opt.category}' y Tipo '${opt.orderType}'.`,
        );
      }
      uniqueOptions.add(key);

      totalQuantity += opt.quantity;
    });

    if (totalQuantity > 10) {
      errors.push('La cantidad total de productos gratis no puede exceder 10.');
    }

    if (errors.length) throw new BadRequestException(errors);
  }
}
