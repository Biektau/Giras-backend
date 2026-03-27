import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

export type OutboxEventType = 'DELETE_FILE';
export type OutboxEventStatus = 'pending' | 'processed' | 'failed';

@Entity('outbox_events')
export class OutboxEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    type: OutboxEventType;

    @Column('jsonb')
    payload: Record<string, unknown>;

    @Column({ default: 'pending' })
    status: OutboxEventStatus;

    @Column({ default: 0 })
    retryCount: number;

    @Column({ nullable: true, type: 'text' })
    lastError: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ nullable: true, type: 'timestamp' })
    processedAt: Date | null;
}
