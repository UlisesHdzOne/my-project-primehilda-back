import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { DatabaseModule } from './database/database.module';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentModule } from './modules/student/student.module';

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
    StudentModule,

    // ✅ Aquí irán tus otros módulos después:
    // AuthModule,
    // UsersModule,
    // ProductsModule,
    // OrdersModule,
    // etc...
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
    // ✅ Global Guard (OPCIONAL - descomenta cuando tengas AuthModule)
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
  ],
})
export class AppModule {}
