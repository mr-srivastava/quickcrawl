import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDevelopment ? 'debug' : 'info'),
  base: {
    env: process.env.NODE_ENV ?? 'development',
  },
  transport:
    isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

export type Logger = pino.Logger;

export function createModuleLogger(module: string): pino.Logger {
  return logger.child({ module });
}
