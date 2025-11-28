import { Global, Module } from '@nestjs/common';
import { PasswordService } from './services/password.service';

@Global() // ← Hace que PasswordService esté disponible en TODOS los módulos
@Module({
  providers: [PasswordService],
  exports: [PasswordService],
})
export class CommonModule {}
