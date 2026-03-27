import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CopyFilesCommand } from './copy-files.command';
import { StorageService } from '../storage.service';

@CommandHandler(CopyFilesCommand)
export class CopyFilesHandler implements ICommandHandler<CopyFilesCommand, string[]> {
    constructor(private readonly storageService: StorageService) {}

    execute(command: CopyFilesCommand): Promise<string[]> {
        return this.storageService.copyFiles(command.urls);
    }
}
