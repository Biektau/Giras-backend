import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadFilesCommand } from './upload-files.command';
import { StorageService } from '../storage.service';

@CommandHandler(UploadFilesCommand)
export class UploadFilesHandler implements ICommandHandler<UploadFilesCommand, string[]> {
    constructor(private readonly storageService: StorageService) {}

    execute(command: UploadFilesCommand): Promise<string[]> {
        return this.storageService.uploadFiles(command.files);
    }
}
