import { Module } from '@nestjs/common';
import { minioProviders } from './storage.provider';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';

@Module({
  controllers: [StorageController],
  providers: [...minioProviders, StorageService],
})
export class StorageModule {}