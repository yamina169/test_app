import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  BACKEND_PORT: Joi.number().port(),

  FRONTEND_URL: Joi.string().uri().required(),

  // PostgreSQL
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().port(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
  POSTGRES_DB_TEST: Joi.string().when('NODE_ENV', {
    is: 'test',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  // MinIO
  MINIO_HOST: Joi.string().required(),
  MINIO_PORT: Joi.number().port(),
  MINIO_ROOT_USER: Joi.string().required(),
  MINIO_ROOT_PASSWORD: Joi.string().min(5).required(),
  MINIO_BUCKET: Joi.string().required(),
  MINIO_PUBLIC_URL: Joi.string().uri().required(),
  MINIO_USE_SSL: Joi.boolean().default(false),
}).options({ allowUnknown: true });
