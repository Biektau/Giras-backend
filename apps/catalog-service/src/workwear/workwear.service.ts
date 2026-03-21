import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { DataSource, Repository } from 'typeorm';
import { CreateWorkwearDto } from './dto/create-workwear.dto';
import { UpdateWorkwearDto } from './dto/update-workwear.dto';
import { Workwear } from './workwear.entity';

@Injectable()
export class WorkwearService {
    private readonly workwearRepository: Repository<Workwear>;

    constructor(@Inject('DATA_SOURCE') private readonly dataSource: DataSource) {
        this.workwearRepository = this.dataSource.getRepository(Workwear);
    }

    async getAll(): Promise<Workwear[]> {
        return this.workwearRepository.find({
            order: { order: 'ASC' },
        });
    }

    async getOne(id: string): Promise<Workwear> {
        const workwear = await this.workwearRepository.findOne({ where: { id } });
        if (!workwear) {
            throw new RpcException({
                statusCode: 404,
                message: `Спецодежда с id ${id} не найдена`,
            });
        }
        return workwear;
    }

    async createOne(
        dto: CreateWorkwearDto,
        imageUrls: string[],
    ): Promise<Workwear> {
        try {
            const workwear = this.workwearRepository.create({
                ...dto,
                images: imageUrls,
            });
            return await this.workwearRepository.save(workwear);
        } catch (error) {
            throw new RpcException({
                statusCode: 500,
                message: 'Ошибка при создании спецодежды',
            });
        }
    }

    async copyOne(id: string): Promise<Workwear> {
        const { id: _, createdAt, updatedAt, ...data } = await this.getOne(id);
        const copy = this.workwearRepository.create(data);
        console.log(copy);
        
        return this.workwearRepository.save(copy);
    }

    async updateOne(
        id: string,
        dto: UpdateWorkwearDto,
        imageUrls?: string[],
    ): Promise<Workwear> {
        const workwear = await this.getOne(id);

        try {
            Object.assign(workwear, dto);
            if (imageUrls && imageUrls.length > 0) {
                workwear.images = imageUrls;
            }
            return await this.workwearRepository.save(workwear);
        } catch (error) {
            throw new RpcException({
                statusCode: 500,
                message: 'Ошибка при обновлении спецодежды',
            });
        }
    }

    async reorder(items: { id: string; order: number }[]): Promise<void> {
        await this.workwearRepository.manager.transaction(async (manager) => {
            for (const item of items) {
                await manager.update(Workwear, item.id, { order: item.order });
            }
        });
    }

    async deleteOne(id: string): Promise<{ message: string }> {
        const workwear = await this.getOne(id);
        await this.workwearRepository.remove(workwear);
        return { message: `Спецодежда с id ${id} удалена` };
    }    

    async getImages(id: string): Promise<string[]> {
        const workwear = await this.workwearRepository.findOne({ where: { id } });
        return workwear?.images ?? [];
    }   
}
