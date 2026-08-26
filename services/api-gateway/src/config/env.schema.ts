import Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().integer().min(1).max(65535).default(3000),
  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
    .default('info'),
}).unknown(true);
