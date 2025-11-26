import { JwtConfigDto } from '../dto/jwt-config.dto';

export class ConfigValidation {
  static validateJwtConfig(config: any): JwtConfigDto {
    console.log('🔍 Validando JWT Config:', config); // ← DEBUG

    if (!config.secret) {
      throw new Error('❌ JWT_SECRET es requerido en las variables de entorno');
    }

    if (!config.expiresIn) {
      throw new Error('❌ JWT_EXPIRES_IN es requerido en las variables de entorno');
    }

    return {
      secret: config.secret,
      expiresIn: config.expiresIn,
    };
  }
}
