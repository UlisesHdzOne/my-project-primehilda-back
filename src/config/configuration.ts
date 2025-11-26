import { registerAs } from '@nestjs/config';
import { JwtConfigDto } from './dto/jwt-config.dto';
import { ConfigValidation } from './validation/config.validation';

export default registerAs('app', () => {
  const jwtConfig: JwtConfigDto = ConfigValidation.validateJwtConfig({
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return {
    // Server
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    database: {
      url: process.env.DATABASE_URL,
    },

    // JWT - Configuración validada
    jwt: jwtConfig,

    // Business Rules
    business: {
      minEventTotal: 1000,
      maxDeliveryDistance: 5,
      businessCoordinates: {
        lat: 16.70186,
        lon: -93.00942,
      },
    },

    // CORS
    frontendUrl: process.env.FRONTEND_URL,
  };
});
