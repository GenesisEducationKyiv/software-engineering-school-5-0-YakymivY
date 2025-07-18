import { createLogger, transports, format } from 'winston';

export const fileLogger = createLogger({
  transports: [
    new transports.File({
      filename: 'logs/weather.log',
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});
