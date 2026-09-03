import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { CorrelationContextMiddleware } from './common/correlation-context.middleware';
import { envValidationSchema } from './config/env.schema';
import { PrismaService } from './database/prisma.service';
import { DatabaseReadinessService } from './health/database-readiness.service';
import { HealthController } from './health/health.controller';

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
    DatabaseReadinessService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationContextMiddleware).forRoutes('*');
  }
}
