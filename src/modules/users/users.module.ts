import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersAdminController } from './controllers/users.admin.controller';
import { UsersService } from './services/users.service';
import { UsersRepository } from './repositories/users.repository';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [JwtModule.register({}), forwardRef(() => AuthModule)],
  controllers: [UsersController, UsersAdminController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
