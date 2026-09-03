import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ObjectStorageService } from '../storage/object-storage.service';

@Injectable()
export class ReadinessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly objectStorage: ObjectStorageService,
  ) {}

  async checkDatabase(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;
  }

  async checkObjectStorage(): Promise<void> {
    await this.objectStorage.check();
  }
}
