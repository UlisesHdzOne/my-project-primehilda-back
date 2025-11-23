import { IsNumber, IsString, MinLength } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @MinLength(20)
  name: string;

  @IsNumber()
  age: number;
}
