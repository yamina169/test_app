import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  BACKEND_PORT: Joi.number().port().default(3000),

  FRONTEND_URL: Joi.string().uri().required(),

  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().port().default(5432),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
  POSTGRES_DB_TEST: Joi.string().when('NODE_ENV', {
    is: 'test',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  MINIO_HOST: Joi.string().required(),
  MINIO_PORT: Joi.number().port().default(9000),
  MINIO_ROOT_USER: Joi.string().required(),
  MINIO_ROOT_PASSWORD: Joi.string().min(5).required(),
  MINIO_BUCKET: Joi.string().required(),
  MINIO_PUBLIC_URL: Joi.string().uri().required(),
  MINIO_USE_SSL: Joi.boolean().default(false),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),

  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.number().port().required(),
  MAIL_SECURE: Joi.boolean().default(false),
  MAIL_USER: Joi.string().required(),
  MAIL_PASS: Joi.string().required(),
  MAIL_DEFAULT_FROM_NAME: Joi.string().required(),
  MAIL_NO_REPLY: Joi.string().email().required(),
  MAIL_CONTACT: Joi.string().email().required(),
  MAIL_FALLBACK_LOCALE: Joi.string().valid('en', 'fr', 'ar').default('en'),
  MAIL_TEMPLATES_BASE_PATH: Joi.string().default(
    'src/infrastructure/integrations/mail/templates',
  ),
});
