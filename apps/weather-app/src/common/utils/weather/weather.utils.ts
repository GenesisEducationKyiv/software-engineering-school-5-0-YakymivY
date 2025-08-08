import { Logger } from '@nestjs/common';

import { WeatherResponse } from '../../../weather/domain/entities/weather.interface';

export function logResponse(provider: string, response: WeatherResponse): void {
  Logger.log(`${provider}: ${JSON.stringify(response)}`);
}
