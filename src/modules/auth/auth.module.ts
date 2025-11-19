import { forwardRef, Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.get<string>('app.jwt.secret');
        const expiresIn = config.get<number>('app.jwt.expiresIn');

        if (!secret) {
          throw new Error('JWT_SECRET no está configurado en las variables de entorno');
        }

        if (!expiresIn) {
          throw new Error('JWT_EXPIRES_IN no está configurado');
        }

        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
    forwardRef(() => UsersModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
