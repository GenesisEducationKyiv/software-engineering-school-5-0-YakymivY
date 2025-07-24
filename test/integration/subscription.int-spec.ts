import { Server } from 'http';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource, Repository } from 'typeorm';

import { AppModule } from '../../apps/weather-app/src/app.module';
import { Subscription } from '../../apps/weather-app/src/subscription/domain/entities/subscription.entity';

import { configureApp, resetDatabase } from './configure-app';

describe('Subscription API', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let subscriptionRepo: Repository<Subscription>;

  const VALID_SUBSCRIPTION_BODY = {
    email: 'test@gmail.com',
    city: 'Berlin',
    frequency: 'daily',
  };

  async function waitForSubscription(
    email: string,
    timeout = 10000,
  ): Promise<Subscription | null> {
    const start = Date.now();
    let result: Subscription | null = null;

    while (Date.now() - start < timeout) {
      result = await subscriptionRepo.findOneBy({ email });
      if (result) return result;
      await new Promise((res) => setTimeout(res, 100)); // wait 100ms
    }

    return null;
  }

  async function testCreateSubscription(code: number): Promise<Subscription> {
    await request(app.getHttpServer() as Server)
      .post('/api/subscribe')
      .send(VALID_SUBSCRIPTION_BODY)
      .expect(code);

    const subscription = await waitForSubscription(
      VALID_SUBSCRIPTION_BODY.email,
    );
    if (!subscription) {
      throw new Error('Subscription not found after waiting.');
    }

    return subscription;
  }

  async function testConfirmSubscription(
    token: string,
    code: number,
  ): Promise<void> {
    await request(app.getHttpServer() as Server)
      .get(`/api/confirm/${token}`)
      .expect(code);
  }

  async function testUnsubscribe(token: string, code: number): Promise<void> {
    await request(app.getHttpServer() as Server)
      .get(`/api/unsubscribe/${token}`)
      .expect(code);
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await configureApp(app);

    dataSource = app.get(DataSource);
    await resetDatabase(dataSource);
    subscriptionRepo = dataSource.getRepository(Subscription);
  });

  afterAll(async () => {
    if (app) await app.close();
    if (dataSource && dataSource.isInitialized) await dataSource.destroy();
  });

  beforeEach(async () => {
    await subscriptionRepo.query(
      `TRUNCATE TABLE "subscription" RESTART IDENTITY CASCADE`,
    );
  });

  it('POST /api/subscribe - should create a subscription', async () => {
    const createdSubscription = await testCreateSubscription(201);
    expect(createdSubscription).toBeDefined();
    expect(createdSubscription.email).toBe(VALID_SUBSCRIPTION_BODY.email);
    expect(createdSubscription.city).toBe(VALID_SUBSCRIPTION_BODY.city);
    expect(createdSubscription.frequency).toBe(
      VALID_SUBSCRIPTION_BODY.frequency,
    );
    expect(createdSubscription.token).toBeDefined();
    expect(createdSubscription.confirmed).toBe(false);
    expect(createdSubscription.createdAt).toBeDefined();
  });

  it('POST /api/subscribe - should return 400 for invalid body', async () => {
    const invalidBody = {
      email: 'test@example.com',
      city: 'Berlin',
      frequency: 'INVALID',
    };

    await request(app.getHttpServer() as Server)
      .post('/api/subscribe')
      .send(invalidBody)
      .expect(400);

    const createdSubscription = await subscriptionRepo.findOneBy({
      email: invalidBody.email,
    });
    expect(createdSubscription).toBeNull();
  });

  it('GET /api/confirm/:token - should confirm a subscription', async () => {
    const createdSubscription = await testCreateSubscription(201);

    expect(createdSubscription).toBeDefined();
    expect(createdSubscription.confirmed).toBe(false);

    await testConfirmSubscription(createdSubscription.token, 200);

    const confirmedSubscription = await subscriptionRepo.findOneBy({
      email: VALID_SUBSCRIPTION_BODY.email,
    });
    expect(confirmedSubscription).toBeDefined();
    expect(confirmedSubscription.confirmed).toBe(true);
  });

  it('GET /api/confirm/:token - should return 404 for invalid token', async () => {
    const createdSubscription = await testCreateSubscription(201);

    expect(createdSubscription).toBeDefined();
    expect(createdSubscription.confirmed).toBe(false);

    const invalidToken = '550e8400-e29b-41d4-a716-446655440000';
    await testConfirmSubscription(invalidToken, 404);

    const confirmedSubscription = await subscriptionRepo.findOneBy({
      email: createdSubscription.email,
    });
    expect(confirmedSubscription).toBeDefined();
    expect(confirmedSubscription.confirmed).toBe(false);
  });

  it('GET /api/unsubscribe/:token - should unsubscribe a subscription', async () => {
    const createdSubscription = await testCreateSubscription(201);

    expect(createdSubscription).toBeDefined();
    expect(createdSubscription.confirmed).toBe(false);

    await testConfirmSubscription(createdSubscription.token, 200);

    const confirmedSubscription = await subscriptionRepo.findOneBy({
      email: VALID_SUBSCRIPTION_BODY.email,
    });
    expect(confirmedSubscription).toBeDefined();
    expect(confirmedSubscription.confirmed).toBe(true);

    await testUnsubscribe(confirmedSubscription.token, 200);

    const unsubscribedSubscription = await subscriptionRepo.findOneBy({
      email: VALID_SUBSCRIPTION_BODY.email,
    });
    expect(unsubscribedSubscription).toBeNull();
  });

  it('GET /api/unsubscribe/:token - should return 404 for invalid token', async () => {
    const createdSubscription = await testCreateSubscription(201);

    expect(createdSubscription).toBeDefined();
    expect(createdSubscription.confirmed).toBe(false);

    await testConfirmSubscription(createdSubscription.token, 200);

    const confirmedSubscription = await subscriptionRepo.findOneBy({
      email: VALID_SUBSCRIPTION_BODY.email,
    });
    expect(confirmedSubscription).toBeDefined();
    expect(confirmedSubscription.confirmed).toBe(true);

    const invalidToken = '550e8400-e29b-41d4-a716-446655440000';
    await testUnsubscribe(invalidToken, 404);

    const unsubscribedSubscription = await subscriptionRepo.findOneBy({
      email: VALID_SUBSCRIPTION_BODY.email,
    });
    expect(unsubscribedSubscription).toBeDefined();
    expect(unsubscribedSubscription.confirmed).toBe(true);
  });
});
