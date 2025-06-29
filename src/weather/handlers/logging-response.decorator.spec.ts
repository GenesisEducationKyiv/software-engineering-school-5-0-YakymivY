import { fileLogger } from '../../../logger.file';
import { WeatherResponse } from '../interfaces/weather.interface';

import { LoggingResponseDecorator } from './logging-response.decorator';
import { WeatherProvider } from './weather-provider.interface';

jest.mock('../../../logger.file', () => ({
  fileLogger: {
    info: jest.fn(),
  },
}));

describe('LoggingResponseDecorator', () => {
  let mockProvider: jest.Mocked<WeatherProvider>;
  let decorator: LoggingResponseDecorator;

  beforeEach(() => {
    mockProvider = {
      getCurrentWeather: jest.fn(),
      getProviderName: jest.fn().mockReturnValue('MockProvider'),
      setNext: jest.fn().mockReturnThis(),
    };

    decorator = new LoggingResponseDecorator(mockProvider);
  });

  it('should delegate getCurrentWeather and log the response', async () => {
    const mockResponse: WeatherResponse = {
      temperature: 22,
      humidity: 60,
      description: 'Clear sky',
    };

    mockProvider.getCurrentWeather.mockResolvedValueOnce(mockResponse);

    const result = await decorator.getCurrentWeather('Kyiv');

    expect(mockProvider.getCurrentWeather).toHaveBeenCalledWith('Kyiv');
    expect(fileLogger.info).toHaveBeenCalledWith(
      'MockProvider: {"temperature":22,"humidity":60,"description":"Clear sky"}',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should delegate setNext', () => {
    const nextMock = {} as WeatherProvider;
    decorator.setNext(nextMock);
    expect(mockProvider.setNext).toHaveBeenCalledWith(nextMock);
  });

  it('should delegate getProviderName', () => {
    const name = decorator.getProviderName();
    expect(name).toBe('MockProvider');
  });
});
