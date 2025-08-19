import { registerAs } from '@nestjs/config';
import { URL } from 'url';
import chalk from 'chalk';

type AppNodeEnv = 'development' | 'production' | 'test';

export interface AppConfig {
  port: number;
  nodeEnv: AppNodeEnv;
  databaseUrl: string;
  isProduction: boolean;
}

interface ValidationResult<T> {
  value: T;
  errors: string[];
  warnings: string[];
  source?: string;
}

class ConfigValidationError extends Error {
  constructor(
    public errors: string[],
    private readonly nodeEnv: AppNodeEnv = 'development'
  ) {
    const errorList = errors.map(e => `- ${e}`).join('\n');
    super(
      nodeEnv === 'production'
        ? '❌ Error en configuración (ver logs)'
        : `${chalk.red.bold('❌ Errores en configuración:')}\n${chalk.red(errorList)}`
    );
    this.name = 'ConfigValidationError';
    if (nodeEnv !== 'production') console.error(this.message);
  }
}

const configLogger = {
  warn: (messages: string[], env: AppNodeEnv) => {
    if (!messages.length) return;
    const header = chalk.yellow.bold('⚠️ Advertencias:');
    const body = messages.map(m => chalk.yellow(`- ${m}`)).join('\n');
    if (env === 'development') console.warn(`\n${header}\n${body}\n`);
    else console.warn(chalk.bgYellow.black(' ADVERTENCIAS ') + ` ${messages.length} advertencias detectadas`);
  },
  success: (env: AppNodeEnv) => {
    if (env === 'development') console.log(chalk.green.bold('✅ Configuración cargada correctamente'));
  },
  error: (message: string, env: AppNodeEnv) => {
    if (env === 'development') console.error(chalk.red.bold(`❌ ${message}`));
    else console.error('❌ Error crítico en configuración');
  }
};

export function validateDatabaseUrl(dbUrl?: string, nodeEnv: AppNodeEnv = 'development'): ValidationResult<string> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const trimmed = dbUrl?.trim() || '';

  if (!trimmed) {
    errors.push('DATABASE_URL es requerida');
    return { value: '', errors, warnings, source: 'DATABASE_URL' };
  }

  if (trimmed.length < 20) warnings.push('URL muy corta');
  if (!/^postgres(ql)?:\/\//i.test(trimmed)) warnings.push("El formato debe comenzar con 'postgresql://' o 'postgres://'");

  try {
    const parsed = new URL(trimmed);
    const missing: string[] = [];
    if (!parsed.hostname) missing.push('host');
    if (!parsed.pathname || parsed.pathname === '/') missing.push('nombre de base de datos');
    if (missing.length) errors.push(`Componentes faltantes: ${missing.join(', ')}`);

    if (nodeEnv === 'production') {
      const creds: string[] = [];
      if (!parsed.username) creds.push('usuario');
      if (!parsed.password) creds.push('contraseña');
      if (creds.length) warnings.push(`Faltan credenciales en producción: ${creds.join(', ')}`);
    }
  } catch (e: any) {
    errors.push(`URL inválida: ${e.message}`);
  }

  return { value: trimmed, errors, warnings, source: 'DATABASE_URL' };
}

export function validatePort(portStr?: string): ValidationResult<number> {
  const DEFAULT_PORT = 3000;
  const warnings: string[] = [];
  const errors: string[] = [];
  const input = portStr?.trim() || '';

  let port = DEFAULT_PORT;
  if (input) {
    const parsed = parseInt(input, 10);
    if (isNaN(parsed)) {
      errors.push(`PORT debe ser número. Valor recibido: '${input}'`);
      warnings.push(`Usando puerto por defecto: ${DEFAULT_PORT}`);
    } else port = parsed;
  }

  if (!Number.isInteger(port)) warnings.push(`PORT debería ser entero. Valor: ${port}`);
  if (port < 1 || port > 65535) errors.push(`Fuera de rango (1-65535). Valor: ${port}`);
  else if (port < 1024) warnings.push(`Puerto ${port} es privilegiado`);

  return { value: port, warnings, errors, source: 'PORT' };
}

export function validateNodeEnv(nodeEnv?: string): ValidationResult<AppNodeEnv> {
  const validEnvs: AppNodeEnv[] = ['development', 'production', 'test'];
  const env = (nodeEnv ?? 'development').trim().toLowerCase() as AppNodeEnv;
  const errors: string[] = [];

  let value: AppNodeEnv = 'development';
  if (validEnvs.includes(env)) value = env;
  else errors.push(`NODE_ENV inválido: '${env}', usando 'development'`);

  return { value, errors, warnings: [], source: 'NODE_ENV' };
}

export default registerAs('app', (): AppConfig => {
  const envResult = validateNodeEnv(process.env.NODE_ENV);
  const nodeEnv: AppNodeEnv = envResult.value; // ✅ garantiza tipo

  const dbResult = validateDatabaseUrl(process.env.DATABASE_URL, nodeEnv);
  const portResult = validatePort(process.env.PORT);
    const passwordResult = validatePassword(process.env.POSTGRES_PASSWORD, nodeEnv);

  const allErrors = [...envResult.errors, ...dbResult.errors, ...portResult.errors, ...passwordResult.errors,];
  const allWarnings = [...envResult.warnings, ...dbResult.warnings, ...portResult.warnings, ...passwordResult.warnings,];

  configLogger.warn(allWarnings, nodeEnv);

  if (allErrors.length > 0) {
    configLogger.error('Errores de configuración detectados', nodeEnv);
    throw new ConfigValidationError(allErrors, nodeEnv);
  }

  configLogger.success(nodeEnv);

  return {
    port: portResult.value,
    nodeEnv,
    databaseUrl: dbResult.value,
    isProduction: nodeEnv === 'production',
  };
});


export function validatePassword(
  password?: string,
  nodeEnv: AppNodeEnv = 'development'
): ValidationResult<string> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const value = password?.trim() || '';

  if (!value) {
    errors.push('DB_PASSWORD es requerida');
    return { value: '', errors, warnings, source: 'DB_PASSWORD' };
  }

  if (nodeEnv === 'production') {
    if (value.length < 12) {
      errors.push('Password demasiado débil (mínimo 12 caracteres en producción)');
    }
    if (!/[A-Z]/.test(value)) warnings.push('Recomendado incluir mayúsculas en la password');
    if (!/[0-9]/.test(value)) warnings.push('Recomendado incluir números en la password');
    if (!/[^A-Za-z0-9]/.test(value)) warnings.push('Recomendado incluir caracteres especiales en la password');
  } else {
    if (value.length < 6) warnings.push('Password muy corta (mínimo recomendado 6 caracteres en desarrollo/test)');
  }

  return { value, errors, warnings, source: 'DB_PASSWORD' };
}
