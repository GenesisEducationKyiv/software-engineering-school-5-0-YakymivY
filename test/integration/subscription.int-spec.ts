import { Server } from 'http';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource, Repository } from 'typeorm';

import { AppModule } from '../../src/app.module';
import { Subscription } from '../../src/subscription/entities/subscription.entity';

import { configureApp } from './configure-app';

describe('Subscription API', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let subscriptionRepo: Repository<Subscription>;

  const VALID_SUBSCRIPTION_BODY = {
    email: 'test@example.com',
    city: 'Berlin',
    frequency: 'daily',
  };

  async function createSubscription(): Promise<Subscription> {
    await request(app.getHttpServer() as Server)
      .post('/api/subscribe')
      .send(VALID_SUBSCRIPTION_BODY)
      .expect(201);

    return subscriptionRepo.findOneBy({
      email: VALID_SUBSCRIPTION_BODY.email,
    });
  }

  async function confirmSubscription(token: string): Promise<void> {
    await request(app.getHttpServer() as Server)
      .get(`/api/confirm/${token}`)
      .expect(200);
  }

  async function unsubscribe(token: string): Promise<void> {
    await request(app.getHttpServer() as Server)
      .get(`/api/unsubscribe/${token}`)
      .expect(200);
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await configureApp(app);

    dataSource = app.get(DataSource);
    subscriptionRepo = dataSource.getRepository(Subscription);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  beforeEach(async () => {
    await subscriptionRepo.query(
      `TRUNCATE TABLE "subscription" RESTART IDENTITY CASCADE`,
    );
  });

  it('POST /api/subscribe - should create a subscription', async () => {
    const createdSubscription = await createSubscription();
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
    const createdSubscription = await createSubscription();

    expect(createdSubscription).toBeDefined();
    expect(createdSubscription.confirmed).toBe(false);

    await confirmSubscription(createdSubscription.token);

    const confirmedSubscription = await subscriptionRepo.findOneBy({
      email: VALID_SUBSCRIPTION_BODY.email,
    });
    expect(confirmedSubscription).toBeDefined();
    expect(confirmedSubscription.confirmed).toBe(true);
  });

  it('GET /api/unsubscribe/:token - should unsubscribe a subscription', async () => {
    const createdSubscription = await createSubscription();

    expect(createdSubscription).toBeDefined();
    expect(createdSubscription.confirmed).toBe(false);

    await confirmSubscription(createdSubscription.token);

    const confirmedSubscription = await subscriptionRepo.findOneBy({
      email: VALID_SUBSCRIPTION_BODY.email,
    });
    expect(confirmedSubscription).toBeDefined();
    expect(confirmedSubscription.confirmed).toBe(true);

    await unsubscribe(confirmedSubscription.token);

    const unsubscribedSubscription = await subscriptionRepo.findOneBy({
      email: VALID_SUBSCRIPTION_BODY.email,
    });
    expect(unsubscribedSubscription).toBeNull();
  });
});
