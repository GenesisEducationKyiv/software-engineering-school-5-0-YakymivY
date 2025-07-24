import { Server } from 'http';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { DataSource } from 'typeorm';

import { AppModule } from '../../apps/weather-app/src/app.module';

import { configureApp, resetDatabase } from './configure-app';

describe('Weather API', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const mockResponse: AxiosResponse = {
    data: {
      current: {
        temp_c: 25,
        humidity: 55,
        condition: { text: 'Partly cloudy' },
      },
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {
      headers: {},
      method: 'get',
      url: '',
      transformRequest: [],
      transformResponse: [],
      timeout: 0,
    } as InternalAxiosRequestConfig,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpService)
      .useValue({
        get: jest.fn().mockReturnValue(of(mockResponse)),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await configureApp(app);

    dataSource = app.get(DataSource);
    await resetDatabase(dataSource);
  });

  afterAll(async () => {
    if (app) await app.close();
    if (dataSource && dataSource.isInitialized) await dataSource.destroy();
  });

  it('GET /api/weather - should return 200 and valid response', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/api/weather')
      .query({ city: 'London' })
      .expect(200);

    expect(response.body).toEqual({
      temperature: 25,
      humidity: 55,
      description: 'Partly cloudy',
    });
  });
});
