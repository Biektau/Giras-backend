import {
    Inject,
    Injectable,
    Logger,
    OnApplicationBootstrap,
    OnApplicationShutdown,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { OutboxRepository } from './outbox.repository';
import { OutboxEvent } from './outbox-event.entity';

const POLL_INTERVAL_MS = 5_000;

@Injectable()
export class OutboxWorker implements OnApplicationBootstrap, OnApplicationShutdown {
    private readonly logger = new Logger(OutboxWorker.name);
    private intervalId: NodeJS.Timeout | null = null;

    constructor(
        private readonly outboxRepo: OutboxRepository,
        @Inject('STORAGE_SERVICE') private readonly storageClient: ClientProxy,
    ) {}

    onApplicationBootstrap() {
        this.intervalId = setInterval(() => this.processEvents(), POLL_INTERVAL_MS);
        this.logger.log(`OutboxWorker started — polling every ${POLL_INTERVAL_MS}ms`);
    }

    onApplicationShutdown() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.logger.log('OutboxWorker stopped');
        }
    }

    private async processEvents(): Promise<void> {
        const events = await this.outboxRepo.getPendingEvents();
        if (events.length === 0) return;

        this.logger.debug(`Processing ${events.length} outbox event(s)`);

        await Promise.allSettled(events.map(event => this.processEvent(event)));
    }

    private async processEvent(event: OutboxEvent): Promise<void> {
        try {
            await this.handleEvent(event);
            await this.outboxRepo.markProcessed(event.id);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const newRetryCount = event.retryCount + 1;

            await this.outboxRepo.markFailed(event.id, message, newRetryCount);

            if (newRetryCount >= this.outboxRepo.maxRetries) {
                this.logger.error(
                    `OutboxEvent ${event.id} (${event.type}) marked as failed after ${newRetryCount} retries. Last error: ${message}`,
                );
            } else {
                this.logger.warn(
                    `OutboxEvent ${event.id} (${event.type}) failed, retry ${newRetryCount}/${this.outboxRepo.maxRetries}: ${message}`,
                );
            }
        }
    }

    private handleEvent(event: OutboxEvent): Promise<unknown> {
        switch (event.type) {
            case 'DELETE_FILE':
                return firstValueFrom(
                    this.storageClient.send({ cmd: 'delete_file' }, event.payload['url']),
                );
            default:
                return Promise.reject(new Error(`Unknown outbox event type: ${event.type}`));
        }
    }
}
