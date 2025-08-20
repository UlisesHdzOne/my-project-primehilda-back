import { Module } from '@nestjs/common';
import { AppController } from './modules/app/controllers/app.controller';
import { AppService } from './modules/app/services/app.service';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './modules/user/user.module';
import { AddressModule } from './modules/address/address.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [UserModule, AddressModule,AuthModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
