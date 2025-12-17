import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig, { validationSchema } from './config/configuration';
import { DatabaseModule } from './core/database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { CarsModule } from './modules/cars/cars.module';
import { CarDetailModule } from './modules/car-detail/car-detail.module';
import { ServiceTypeModule } from './modules/service-type/service-type.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { WashOrderModule } from './modules/wash-order/wash-order.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema,
    }),
    DatabaseModule,
    CommonModule,
    CarsModule,
    CarDetailModule,
    ServiceTypeModule,
    EmployeeModule,
    WashOrderModule, //modulo global para interceptores y filtros
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
