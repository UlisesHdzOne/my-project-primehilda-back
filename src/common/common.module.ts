import { Global, Module } from '@nestjs/common';
import { PasswordService } from './services/password.service';
import { CorsHeadersInterceptor } from './interceptors/cors.interceptor';

@Global() // ← Hace que PasswordService esté disponible en TODOS los módulos
@Module({
  providers: [PasswordService, CorsHeadersInterceptor],
  exports: [PasswordService, CorsHeadersInterceptor],
})
export class CommonModule {}
