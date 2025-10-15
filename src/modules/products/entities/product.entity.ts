// src/modules/products/entities/product.entity.ts

// Definimos la interfaz para la estructura de FreeOption que viene de Prisma
interface FreeOptionPrisma {
  id: number;
  category: string;
  quantity: number;
  orderType: string;
}

// Definimos la interfaz para el Payload completo que viene de Prisma (incluye 'null')
interface ProductPayload {
  id: number;
  name: string;
  description: string | null; // Acepta 'null'
  price: number;
  category: string;
  image: string | null; // Acepta 'null'
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  freeOptions: FreeOptionPrisma[];
}

export class ProductEntity {
  id: number;
  name: string;
  description?: string; // Espera 'undefined'
  price: number;
  category: string;
  image?: string; // Espera 'undefined'
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  freeOptions?: FreeOptionPrisma[];

  // El constructor ahora acepta el payload de Prisma y realiza la limpieza de nulos
  constructor(partial: ProductPayload) {
    // 1. Asignar todos los campos
    Object.assign(this, partial);

    // 2. Conversión de Nulos: Convertir los campos opcionales (que son 'null' en BD)
    // a 'undefined' para coincidir con el tipado de la clase.
    this.description = partial.description ?? undefined;
    this.image = partial.image ?? undefined;
  }
}
