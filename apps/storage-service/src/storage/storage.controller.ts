import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { UploadFilesCommand } from './commands/upload-files.command';
import { DeleteFileCommand } from './commands/delete-file.command';
import { CopyFilesCommand } from './commands/copy-files.command';

type FilePayload = {
    buffer: Buffer | { data: number[] };
    originalname: string;
    mimetype: string;
    size: number;
};

@Controller()
export class StorageController {
    constructor(private readonly commandBus: CommandBus) {}

    @MessagePattern({ cmd: 'upload_files' })
    uploadFiles(@Payload() files: FilePayload[]) {
        return this.commandBus.execute(new UploadFilesCommand(files));
    }

    @MessagePattern({ cmd: 'delete_file' })
    deleteFile(@Payload() url: string) {
        return this.commandBus.execute(new DeleteFileCommand(url));
    }

    @MessagePattern({ cmd: 'copy_files' })
    copyFiles(@Payload() urls: string[]) {
        return this.commandBus.execute(new CopyFilesCommand(urls));
    }
}
