import { Exclude } from 'class-transformer';

export class StudentResponseDto {
  id: number;
  name: string;

  @Exclude() // ← Esto NUNCA se enviará al cliente
  age: number;

  createdAt: Date;
  updatedAt: Date;
}

// import { Exclude } from 'class-transformer';

// export class StudentResponseDto {
//   id: number;
//   name: string;

//   @Exclude({ toPlainOnly: true })
//   age: number;

//   createdAt: Date;
//   updatedAt: Date;
// }
