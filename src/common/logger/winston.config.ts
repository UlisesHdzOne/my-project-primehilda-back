import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const nodeEnv = process.env.NODE_ENV || 'development';
const isDevelopment = nodeEnv === 'development';

// Formato mejorado para consola
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, context, ...metadata }) => {
    // Formato: [HH:mm:ss] LEVEL: message {metadata}
    let metaString = '';

    // Solo mostrar context y metadata si existen
    const meta = { context, ...metadata };
    if (Object.keys(meta).length > 0) {
      // Filtrar undefined/null
      const filteredMeta = Object.fromEntries(
        Object.entries(meta).filter(([_, v]) => v !== undefined && v !== null),
      );
      if (Object.keys(filteredMeta).length > 0) {
        metaString = ` ${JSON.stringify(filteredMeta)}`;
      }
    }

    return `[${timestamp}] ${level}: ${message}${metaString}`;
  }),
);

// Formato para archivos (JSON completo)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

export const winstonLogger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: fileFormat,
  transports: [
    // Consola con formato mejorado
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // Archivo de errores
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
    }),

    // Archivo de todos los logs
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
    }),
  ],
});

// Clase wrapper para usar en servicios
export class AppLogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  log(message: string, metadata?: Record<string, unknown>): void {
    winstonLogger.info(message, { context: this.context, ...metadata });
  }

  error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    winstonLogger.error(message, {
      context: this.context,
      error: error?.message,
      stack: error?.stack,
      ...metadata,
    });
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    winstonLogger.warn(message, { context: this.context, ...metadata });
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    winstonLogger.debug(message, { context: this.context, ...metadata });
  }
}

// Exportar instancia global para uso rápido
export const logger = new AppLogger('Global');
