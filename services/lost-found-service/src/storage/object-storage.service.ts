import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';

export const OBJECT_STORAGE_BUCKET = Symbol('OBJECT_STORAGE_BUCKET');

@Injectable()
export class ObjectStorageService {
  constructor(
    private readonly client: S3Client,
    @Inject(OBJECT_STORAGE_BUCKET) private readonly bucket: string,
  ) {}

  async check(): Promise<void> {
    await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
  }
}
