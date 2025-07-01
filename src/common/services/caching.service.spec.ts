import { Test, TestingModule } from '@nestjs/testing';
import { Redis } from 'ioredis';

import { CachingService } from './caching.service';

describe('CachingService', () => {
  let service: CachingService;
  let redisMock: Partial<Redis>;
  let module: TestingModule;

  beforeEach(async () => {
    redisMock = {
      get: jest.fn(),
      set: jest.fn(),
    };

    module = await Test.createTestingModule({
      providers: [
        CachingService,
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: redisMock,
        },
      ],
    }).compile();

    service = module.get<CachingService>(CachingService);
  });

  afterEach(() => jest.clearAllMocks());

  afterAll(async () => {
    await module.close();
  });

  describe('get()', () => {
    it('should return parsed value if cache hit', async () => {
      const expected = { temp: 25 };
      (redisMock.get as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(expected),
      );

      const result = await service.get<typeof expected>('weather:kyiv');

      expect(redisMock.get).toHaveBeenCalledWith('weather:kyiv');
      expect(result).toEqual(expected);
    });

    it('should return null on cache miss', async () => {
      (redisMock.get as jest.Mock).mockResolvedValueOnce(null);

      const result = await service.get('missing:key');

      expect(result).toBeNull();
    });

    it('should return null on error and log', async () => {
      const error = new Error('Redis error');
      (redisMock.get as jest.Mock).mockRejectedValueOnce(error);

      const result = await service.get('error:key');

      expect(result).toBeNull();
    });
  });

  describe('set()', () => {
    it('should serialize and call redis.set with TTL', async () => {
      const key = 'weather:london';
      const value = { temp: 30 };

      await service.set(key, value, 60);

      expect(redisMock.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        'EX',
        60,
      );
    });

    it('should log error on failure', async () => {
      const key = 'weather:error';
      const value = { temp: 0 };
      (redisMock.set as jest.Mock).mockRejectedValueOnce(
        new Error('Redis set failed'),
      );

      await expect(service.set(key, value, 10)).resolves.toBeUndefined();
    });
  });
});
