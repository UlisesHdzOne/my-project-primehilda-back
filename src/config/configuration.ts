import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // Server
  port: parseInt(process.env.PORT || '3000', 10),

  // Database
  database: {
    url: process.env.DATABASE_URL,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },

  // CORS
  frontendUrl: process.env.FRONTEND_URL,
}));
