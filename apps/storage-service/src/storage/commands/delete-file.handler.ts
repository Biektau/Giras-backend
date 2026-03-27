import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteFileCommand } from './delete-file.command';
import { StorageService } from '../storage.service';

@CommandHandler(DeleteFileCommand)
export class DeleteFileHandler implements ICommandHandler<DeleteFileCommand, void> {
    constructor(private readonly storageService: StorageService) {}

    execute(command: DeleteFileCommand): Promise<void> {
        return this.storageService.deleteFile(command.url);
    }
}
