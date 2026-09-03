import Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().integer().min(1).max(65535).default(3003),
  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
    .default('info'),
  DATABASE_URL: Joi.string().min(1).required(),
  AI_INFERENCE_URL: Joi.string().uri().optional(),
}).unknown(true);
