import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig, { validationSchema } from './config/configuration';
import { DatabaseModule } from './core/database/database.module';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema,
    }),
    DatabaseModule,
    CommonModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
