import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { LoggerModule } from 'nestjs-pino';
import { CorrelationContextMiddleware } from './common/correlation-context.middleware';
import { envValidationSchema } from './config/env.schema';
import { PrismaService } from './database/prisma.service';
import { HealthController } from './health/health.controller';
import { ReadinessService } from './health/readiness.service';
import {
  OBJECT_STORAGE_BUCKET,
  ObjectStorageService,
} from './storage/object-storage.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: envValidationSchema,
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.get<string>('LOG_LEVEL') ?? 'info',
          serializers: {
            req: (request) => ({
              id: request.id,
              method: request.method,
              url: request.url,
            }),
          },
        },
      }),
    }),
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: PrismaService,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new PrismaService(configService.getOrThrow<string>('DATABASE_URL')),
    },
    {
      provide: S3Client,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new S3Client({
          endpoint: configService.getOrThrow<string>('S3_ENDPOINT'),
          region: configService.getOrThrow<string>('S3_REGION'),
          forcePathStyle: true,
          credentials: {
            accessKeyId: configService.getOrThrow<string>('S3_ACCESS_KEY_ID'),
            secretAccessKey: configService.getOrThrow<string>(
              'S3_SECRET_ACCESS_KEY',
            ),
          },
        }),
    },
    {
      provide: OBJECT_STORAGE_BUCKET,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getOrThrow<string>('S3_BUCKET'),
    },
    ObjectStorageService,
    ReadinessService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationContextMiddleware).forRoutes('*');
  }
}
