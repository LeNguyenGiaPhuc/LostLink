import Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().integer().min(1).max(65535).default(3002),
  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
    .default('info'),
  DATABASE_URL: Joi.string().min(1).required(),
  S3_ENDPOINT: Joi.string().uri().required(),
  S3_REGION: Joi.string().min(1).required(),
  S3_BUCKET: Joi.string().min(1).required(),
  S3_ACCESS_KEY_ID: Joi.string().min(1).required(),
  S3_SECRET_ACCESS_KEY: Joi.string().min(1).required(),
}).unknown(true);
