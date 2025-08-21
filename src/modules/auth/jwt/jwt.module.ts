import { Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { JWT_EXPIRES_IN, JWT_SECRET } from './jwt.constants';


@Module({
  imports: [
    NestJwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRES_IN },
    }),
  ],
  exports: [NestJwtModule],
})
export class JwtModule {}
