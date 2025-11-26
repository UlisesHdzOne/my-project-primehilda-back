import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { DatabaseModule } from './database/database.module';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { SalasModule } from './modules/salas/salas.module';
import { ReservaModule } from './modules/reservas/reservas.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    // ✅ Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    // ✅ Database module global
    DatabaseModule,

    // ✅ Tus módulos de funcionalidad
    AuthModule,
    UsersModule,
    SalasModule,
    ReservaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // ✅ Global Filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // ✅ Global Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    // ✅ Global Guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
