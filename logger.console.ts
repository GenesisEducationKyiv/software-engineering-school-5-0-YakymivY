import { createLogger, transports, format } from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

export const consoleLogger = createLogger({
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike('ConsoleLogger', {
          prettyPrint: true,
        }),
      ),
    }),
  ],
});
