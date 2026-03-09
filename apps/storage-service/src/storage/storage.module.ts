import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { minioProviders } from './storage.provider';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
  ],
  controllers: [StorageController],
  providers: [...minioProviders, StorageService],
})
export class StorageModule {}