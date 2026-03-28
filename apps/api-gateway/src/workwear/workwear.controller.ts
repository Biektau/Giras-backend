import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors, UploadedFiles, Inject, Patch, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FilesInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import { CreateWorkwearDto } from './dto/create-workwear.dto';
import { UpdateWorkwearDto } from './dto/update-workwear.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/user-role.enum';

@Controller('workwear')
export class WorkwearController {
    constructor(
        @Inject('CATALOG_SERVICE') private readonly catalogClient: ClientProxy,
        @Inject('STORAGE_SERVICE') private readonly storageClient: ClientProxy,
    ) { }

    @Get('get-all')
    async getAll() {
        return firstValueFrom(this.catalogClient.send({ cmd: 'get_all_workwear' }, {}));
    }

    @Get('get-one/:id')
    async getOne(@Param('id') id: string) {
        return firstValueFrom(this.catalogClient.send({ cmd: 'get_one_workwear' }, id));
    }

    @Post('create-one')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @UseInterceptors(FilesInterceptor('images', 10))
    async createOne(
        @Body() dto: CreateWorkwearDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        let imageUrls: string[] = [];

        if (files?.length > 0) {
            const serializedFiles = files.map((file) => ({
                buffer: file.buffer,
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
            }));

            imageUrls = await firstValueFrom(
                this.storageClient.send({ cmd: 'upload_files' }, serializedFiles),
            );
        }

        try {
            return await firstValueFrom(
                this.catalogClient.send({ cmd: 'create_workwear' }, { dto, imageUrls }),
            );
        } catch (error) {
            if (imageUrls.length > 0) {
                await Promise.allSettled(
                    imageUrls.map((url) =>
                        firstValueFrom(this.storageClient.send({ cmd: 'delete_file' }, url)),
                    ),
                );
            }
            throw error;
        }
    }

    @Post('copy-one/:id')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async copyOne(@Param('id') id: string) {
        const originalImages: string[] = await firstValueFrom(
            this.catalogClient.send({ cmd: 'get_workwear_images' }, id),
        );

        const imageUrls: string[] = originalImages.length > 0
            ? await firstValueFrom(this.storageClient.send({ cmd: 'copy_files' }, originalImages))
            : [];

        return await firstValueFrom(
            this.catalogClient.send({ cmd: 'copy_workwear' }, { id, imageUrls }),
        );
    }

    @Put('update-one/:id')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @UseInterceptors(FilesInterceptor('images', 10))
    async updateOne(
        @Param('id') id: string,
        @Body() dto: UpdateWorkwearDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        const { existingImages = [], ...restDto } = dto;
        let newImageUrls: string[] = [];

        if (files?.length > 0) {
            const serializedFiles = files.map((file) => ({
                buffer: file.buffer,
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
            }));

            newImageUrls = await firstValueFrom(
                this.storageClient.send({ cmd: 'upload_files' }, serializedFiles),
            );
        }

        const imageUrls = [...existingImages, ...newImageUrls];

        try {
            return await firstValueFrom(
                this.catalogClient.send({ cmd: 'update_workwear' }, { id, dto: restDto, imageUrls }),
            );
        } catch (error) {
            if (newImageUrls.length > 0) {
                await Promise.allSettled(
                    newImageUrls.map((url) =>
                        firstValueFrom(this.storageClient.send({ cmd: 'delete_file' }, url)),
                    ),
                );
            }
            throw error;
        }
    }

    @Patch('reorder')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async reorder(@Body() items: { id: string; order: number }[]) {
        return firstValueFrom(this.catalogClient.send({ cmd: 'reorder_workwear' }, items));
    }

    @Delete('delete-one/:id')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async deleteOne(@Param('id') id: string) {
        return firstValueFrom(this.catalogClient.send({ cmd: 'delete_workwear' }, id));
    }
}