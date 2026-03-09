import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket = 'workwear';

  constructor(
    @Inject('MINIO_CLIENT') private readonly minioClient: Minio.Client,
  ) {}

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    const exists = await this.minioClient.bucketExists(this.bucket);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucket);
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucket}/*`],
          },
        ],
      };
      await this.minioClient.setBucketPolicy(
        this.bucket,
        JSON.stringify(policy),
      );
      this.logger.log(`Бакет "${this.bucket}" создан`);
    }
  }

  async uploadFile(file: {
    buffer: any;
    originalname: string;
    mimetype: string;
    size: number;
  }): Promise<string> {
    const ext = file.originalname.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;

    const buffer = Buffer.isBuffer(file.buffer)
      ? file.buffer
      : Buffer.from(file.buffer.data ?? file.buffer);

    await this.minioClient.putObject(this.bucket, filename, buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    const endpoint = process.env.MINIO_ENDPOINT ?? 'localhost';
    const port = process.env.MINIO_PORT ?? '9000';
    return `http://${endpoint}:${port}/${this.bucket}/${filename}`;
  }

  async uploadFiles(
    files: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    }[],
  ): Promise<string[]> {
    return Promise.all(files.map((file) => this.uploadFile(file)));
  }

  async deleteFile(url: string): Promise<void> {
    const filename = url.split('/').pop();
    if (filename) {
      await this.minioClient.removeObject(this.bucket, filename);
    }
  }
}
