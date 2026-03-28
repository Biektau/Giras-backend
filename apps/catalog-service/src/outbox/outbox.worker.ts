import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { OutboxRepository } from './outbox.repository';
import { OutboxEvent } from './outbox-event.entity';

/** Every 5 seconds (node-cron: second minute hour day month weekday). */
const OUTBOX_CRON = '*/5 * * * * *';

@Injectable()
export class OutboxWorker implements OnModuleInit {
    private readonly logger = new Logger(OutboxWorker.name);
    private processing = false;

    constructor(
        private readonly outboxRepo: OutboxRepository,
        @Inject('STORAGE_SERVICE') private readonly storageClient: ClientProxy,
    ) {}

    onModuleInit() {
        this.logger.log(`OutboxWorker scheduled — ${OUTBOX_CRON}`);
    }

    @Cron(OUTBOX_CRON)
    async flushOutbox(): Promise<void> {
        if (this.processing) {
            this.logger.debug('Outbox tick skipped: previous batch still running');
            return;
        }
        this.processing = true;
        try {
            await this.processEvents();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Outbox poll failed: ${message}`);
        } finally {
            this.processing = false;
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
