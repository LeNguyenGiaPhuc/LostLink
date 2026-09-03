import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseReadinessService } from '../src/health/database-readiness.service';

describe('Matching Service health', () => {
  let app: INestApplication;
  let databaseReadiness: { check: jest.Mock<Promise<void>, []> };

  beforeAll(async () => {
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
  });

  it('reports ready when its database is available and AI URL is absent', async () => {
    databaseReadiness.check.mockResolvedValue(undefined);

    await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200, { status: 'ready' });
  });

  it('does not include AI in mandatory readiness dependencies', async () => {
    databaseReadiness.check.mockResolvedValue(undefined);

    const response = await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200);

    expect(response.body).toEqual({ status: 'ready' });
    expect(JSON.stringify(response.body)).not.toContain('ai');
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
      .set('X-Correlation-Id', 'matching-health-test')
      .expect('X-Correlation-Id', 'matching-health-test')
      .expect(200);
  });
});
