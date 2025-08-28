import { Module } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { JwtModule } from 'src/modules/auth/jwt/jwt.module';

@Module({
  imports: [JwtModule],
  providers: [JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard],
})
export class GuardsModule {}
