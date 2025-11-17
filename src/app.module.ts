import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { DatabaseModule } from './database/database.module';
import configuration from './config/configuration';

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

    // ✅ Aquí irán tus otros módulos después:
    // AuthModule,
    // UsersModule,
    // ProductsModule,
    // OrdersModule,
    // etc...
  ],
  providers: [
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
  ],
})
export class AppModule {}
