import { Module } from '@nestjs/common';
import { AppController } from './modules/app/controllers/app.controller';
import { AppService } from './modules/app/services/app.service';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './modules/user/user.module';
import { AddresModule } from './modules/address/address.module';

@Module({
  imports: [UserModule,AddresModule],
  controllers: [AppController],
  providers: [AppService,PrismaService],
})
export class AppModule {}
