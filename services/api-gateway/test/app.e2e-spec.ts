import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('API Gateway foundation', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns live and ready without a domain dependency', async () => {
    await request(app.getHttpServer())
      .get('/health/live')
      .expect(200, { status: 'live' });
    await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200, { status: 'ready' });
  });

  it('preserves a valid correlation identifier', async () => {
    await request(app.getHttpServer())
      .get('/health/live')
      .set('X-Correlation-Id', 'lostlink-test-1')
      .expect('X-Correlation-Id', 'lostlink-test-1')
      .expect(200);
  });

  it('replaces an invalid correlation identifier', async () => {
    const response = await request(app.getHttpServer())
      .get('/health/live')
      .set('X-Correlation-Id', 'contains spaces')
      .expect(200);
    expect(response.headers['x-correlation-id']).toMatch(/^[0-9a-f-]{36}$/);
  });
});
