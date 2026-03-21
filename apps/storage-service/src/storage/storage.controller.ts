import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StorageService } from './storage.service';

@Controller()
export class StorageController {
  constructor(private readonly storageService: StorageService) { }

  @MessagePattern({ cmd: 'upload_files' })
  uploadFiles(@Payload() files: { buffer: Buffer; originalname: string; mimetype: string; size: number }[]) {
    return this.storageService.uploadFiles(files);
  }

  @MessagePattern({ cmd: 'delete_file' })
  deleteFile(@Payload() url: string) {
    return this.storageService.deleteFile(url);
  }

  @MessagePattern({ cmd: 'copy_files' })
  copyFiles(@Payload() urls: string[]) {
    return this.storageService.copyFiles(urls);
  }
}