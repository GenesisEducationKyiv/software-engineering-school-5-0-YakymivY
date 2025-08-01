import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

// Filter function to skip NestJS system logs
const skipNestSystemLogs = winston.format((info) => {
  if (
    info.context &&
    typeof info.context === 'string' &&
    (info.context.startsWith('Nest') ||
      info.context.startsWith('InstanceLoader') ||
      info.context.startsWith('RoutesResolver') ||
      info.context.startsWith('RouterExplorer'))
  ) {
    return false;
  }
  return info;
});

export const winstonLoggerOptions: winston.LoggerOptions = {
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike('WeatherApp', {
          prettyPrint: true,
        }),
      ),
    }),

    new winston.transports.File({
      level: 'debug',
      filename: 'logs/app.log',
      format: winston.format.combine(
        skipNestSystemLogs(),
        winston.format.json(),
      ),
    }),

    new winston.transports.File({
      level: 'error',
      filename: 'logs/error.log',
      format: winston.format.combine(
        skipNestSystemLogs(),
        winston.format.json(),
      ),
    }),
  ],
};
