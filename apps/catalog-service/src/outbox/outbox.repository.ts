import { Inject, Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { OutboxEvent, OutboxEventType } from './outbox-event.entity';

const MAX_RETRIES = 5;
const BATCH_SIZE = 20;

@Injectable()
export class OutboxRepository {
    private readonly repo: Repository<OutboxEvent>;

    constructor(@Inject('DATA_SOURCE') private readonly dataSource: DataSource) {
        this.repo = dataSource.getRepository(OutboxEvent);
    }

    createEvent(
        manager: EntityManager,
        type: OutboxEventType,
        payload: Record<string, unknown>,
    ): Promise<OutboxEvent> {
        const event = manager.create(OutboxEvent, { type, payload, status: 'pending' });
        return manager.save(event);
    }

    createManyEvents(
        manager: EntityManager,
        type: OutboxEventType,
        payloads: Record<string, unknown>[],
    ): Promise<OutboxEvent[]> {
        const events = payloads.map(payload =>
            manager.create(OutboxEvent, { type, payload, status: 'pending' })
        );
        return manager.save(events);
    }

    getPendingEvents(): Promise<OutboxEvent[]> {
        return this.repo.find({
            where: { status: 'pending' },
            order: { createdAt: 'ASC' },
            take: BATCH_SIZE,
        });
    }

    markProcessed(id: string): Promise<void> {
        return this.repo.update(id, {
            status: 'processed',
            processedAt: new Date(),
            lastError: null,
        }).then();
    }

    async markFailed(id: string, error: string, retryCount: number): Promise<void> {
        const status = retryCount >= MAX_RETRIES ? 'failed' : 'pending';
        await this.repo.update(id, {
            status,
            retryCount,
            lastError: error,
        });
    }

    get maxRetries(): number {
        return MAX_RETRIES;
    }
}
