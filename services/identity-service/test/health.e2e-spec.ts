import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseReadinessService } from '../src/health/database-readiness.service';

describe('Identity Service health', () => {
  let app: INestApplication;
  let databaseReadiness: { check: jest.Mock<Promise<void>, []> };

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://identity-test:identity-test@localhost:5432/lostlink';
    databaseReadiness = { check: jest.fn<Promise<void>, []>() };

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseReadinessService)
      .useValue(databaseReadiness)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    delete process.env.DATABASE_URL;
  });

  it('reports ready when its owned database connection succeeds', async () => {
    databaseReadiness.check.mockResolvedValue(undefined);
    await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200, { status: 'ready' });
  });

  it('reports unavailable when its owned database connection fails', async () => {
    databaseReadiness.check.mockRejectedValue(new Error('database unavailable'));
    await request(app.getHttpServer())
      .get('/health/ready')
      .expect(503, {
        status: 'not_ready',
        dependencies: { database: 'down' },
      });
  });

  it('remains live when its database is unavailable', async () => {
    databaseReadiness.check.mockRejectedValue(new Error('database unavailable'));
    await request(app.getHttpServer())
      .get('/health/live')
      .expect(200, { status: 'live' });
  });

  it('returns the validated correlation identifier', async () => {
    await request(app.getHttpServer())
      .get('/health/live')
      .set('X-Correlation-Id', 'identity-health-test')
      .expect('X-Correlation-Id', 'identity-health-test')
      .expect(200);
  });
});
