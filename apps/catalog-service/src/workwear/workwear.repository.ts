import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Workwear } from './workwear.entity';
import { CreateWorkwearDto } from './dto/create-workwear.dto';
import { UpdateWorkwearDto } from './dto/update-workwear.dto';
import { OutboxRepository } from '../outbox/outbox.repository';

@Injectable()
export class WorkwearRepository {
    private readonly repo: Repository<Workwear>;

    constructor(
        @Inject('DATA_SOURCE') private readonly dataSource: DataSource,
        private readonly outboxRepo: OutboxRepository,
    ) {
        this.repo = dataSource.getRepository(Workwear);
    }

    findAll(): Promise<Workwear[]> {
        return this.repo.find({ order: { order: 'ASC' } });
    }

    async findById(id: string): Promise<Workwear> {
        const workwear = await this.repo.findOne({ where: { id } });
        if (!workwear) {
            throw new RpcException({ statusCode: 404, message: `Спецодежда с id ${id} не найдена` });
        }
        return workwear;
    }

    create(dto: CreateWorkwearDto, imageUrls: string[]): Promise<Workwear> {
        const entity = this.repo.create({ ...dto, images: imageUrls });
        return this.repo.save(entity);
    }

    async saveWithOutboxEvents(entity: Workwear, removedImages: string[]): Promise<Workwear> {
        return this.dataSource.transaction(async (manager: EntityManager) => {
            const saved = await manager.save(Workwear, entity);

            if (removedImages.length > 0) {
                await this.outboxRepo.createManyEvents(
                    manager,
                    'DELETE_FILE',
                    removedImages.map(url => ({ url })),
                );
            }

            return saved;
        });
    }

    async removeWithOutboxEvents(id: string): Promise<void> {
        const entity = await this.findById(id);
        const imagesToDelete = entity.images ?? [];

        await this.dataSource.transaction(async (manager: EntityManager) => {
            await manager.remove(Workwear, entity);

            if (imagesToDelete.length > 0) {
                await this.outboxRepo.createManyEvents(
                    manager,
                    'DELETE_FILE',
                    imagesToDelete.map(url => ({ url })),
                );
            }
        });
    }

    async getImages(id: string): Promise<string[]> {
        const entity = await this.repo.findOne({ where: { id } });
        return entity?.images ?? [];
    }

    async reorder(items: { id: string; order: number }[]): Promise<void> {
        await this.repo.manager.transaction(async (manager) => {
            for (const item of items) {
                await manager.update(Workwear, item.id, { order: item.order });
            }
        });
    }
}
