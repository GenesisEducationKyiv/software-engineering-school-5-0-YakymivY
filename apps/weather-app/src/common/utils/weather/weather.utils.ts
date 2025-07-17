import { fileLogger } from '../../utils/logger/logger.file';
import { WeatherResponse } from '../../../weather/domain/entities/weather.interface';

export function logResponse(provider: string, response: WeatherResponse): void {
  fileLogger.info(`${provider}: ${JSON.stringify(response)}`);
}
