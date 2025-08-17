import 'dotenv/config';

const requiredEnv = ['DATABASE_URL', 'PORT'];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ La variable de entorno ${key} es requerida`);
    process.exit(1);
  }
}

console.log('✅ Variables de entorno validadas');
