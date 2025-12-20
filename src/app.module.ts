import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig, { validationSchema } from './config/configuration';
import { DatabaseModule } from './core/database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema,
    }),
    DatabaseModule,
    CommonModule,
    VehiclesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
