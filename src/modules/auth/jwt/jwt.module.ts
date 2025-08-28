import { Module } from '@nestjs/common';
import { JwtService, JwtModule as NestJwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    NestJwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  providers: [JwtService],
  exports: [NestJwtModule, JwtService],
})
export class JwtModule {}
