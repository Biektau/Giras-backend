import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { minioProviders } from './storage.provider';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';

import { UploadFilesHandler } from './commands/upload-files.handler';
import { DeleteFileHandler } from './commands/delete-file.handler';
import { CopyFilesHandler } from './commands/copy-files.handler';

const CommandHandlers = [UploadFilesHandler, DeleteFileHandler, CopyFilesHandler];

@Module({
    imports: [CqrsModule],
    controllers: [StorageController],
    providers: [...minioProviders, StorageService, ...CommandHandlers],
})
export class StorageModule {}
