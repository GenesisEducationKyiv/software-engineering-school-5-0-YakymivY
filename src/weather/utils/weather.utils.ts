import { WeatherResponse } from '../interfaces/weather.interface';

export function formEmailContent(
  weather: WeatherResponse,
  city: string,
  token: string,
): string {
  return `<p>The current weather in <b>${city}</b> is ${weather.description}
            with a temperature of <b>${weather.temperature}°C</b> and a humidity of <b>${weather.humidity}%</b></p>
            <p>Click <a href="${process.env.BASE_URL}/unsubscribe/${token}">here</a> to unsubscribe</p>`;
}
