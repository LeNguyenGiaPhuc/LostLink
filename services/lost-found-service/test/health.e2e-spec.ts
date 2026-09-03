import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ReadinessService } from '../src/health/readiness.service';

describe('Lost-and-Found Service health', () => {
  let app: INestApplication;
  let readiness: {
    checkDatabase: jest.Mock<Promise<void>, []>;
    checkObjectStorage: jest.Mock<Promise<void>, []>;
  };

  beforeAll(async () => {
    readiness = {
      checkDatabase: jest.fn<Promise<void>, []>(),
      checkObjectStorage: jest.fn<Promise<void>, []>(),
    };

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ReadinessService)
      .useValue(readiness)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('is ready only when database and object storage are reachable', async () => {
    readiness.checkDatabase.mockResolvedValue(undefined);
    readiness.checkObjectStorage.mockResolvedValue(undefined);

    await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200, { status: 'ready' });
  });

  it('does not expose storage errors when object storage is unavailable', async () => {
    readiness.checkDatabase.mockResolvedValue(undefined);
    readiness.checkObjectStorage.mockRejectedValue(new Error('secret endpoint detail'));

    await request(app.getHttpServer())
      .get('/health/ready')
      .expect(503, {
        status: 'not_ready',
        dependencies: { database: 'up', objectStorage: 'down' },
      });
  });

  it('remains live when a mandatory dependency is unavailable', async () => {
    readiness.checkObjectStorage.mockRejectedValue(new Error('storage unavailable'));

    await request(app.getHttpServer())
      .get('/health/live')
      .expect(200, { status: 'live' });
  });

  it('returns the validated correlation identifier', async () => {
    await request(app.getHttpServer())
      .get('/health/live')
      .set('X-Correlation-Id', 'lost-found-health-test')
      .expect('X-Correlation-Id', 'lost-found-health-test')
      .expect(200);
  });
});
