import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig, { validationSchema } from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './categories/categories.module';
import { CommonModule } from './common/common.module';
import { SharedModule } from './shared/shared.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema,
    }),
    DatabaseModule,
    CommonModule, //modulo global para interceptores y filtros
    SharedModule, //modulo global para utils
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
