process.env.DATABASE_URL ??= 'postgresql://lost-found-test:lost-found-test@localhost:5432/lostlink';
process.env.S3_ENDPOINT ??= 'http://localhost:3900';
process.env.S3_REGION ??= 'local';
process.env.S3_BUCKET ??= 'lostlink-test';
process.env.S3_ACCESS_KEY_ID ??= 'lost-found-test';
process.env.S3_SECRET_ACCESS_KEY ??= 'lost-found-test-secret';
