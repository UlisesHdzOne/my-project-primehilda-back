import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import appConfig, { validationSchema } from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommonModule } from './common/common.module';
import { ProfileModule } from './modules/profile/profile.module';
import { CorsHeadersInterceptor } from './common/interceptors/cors.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true, // ← ¡ESTO ES CLAVE!
        abortEarly: false,
      },
      ignoreEnvFile: false,
      ignoreEnvVars: false,
    }),
    DatabaseModule,
    CommonModule,
    UsersModule,
    AuthModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CorsHeadersInterceptor,
    },
  ],
})
export class AppModule {}
