import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { OutboxRepository } from './outbox.repository';
import { OutboxWorker } from './outbox.worker';

@Module({
    imports: [
        DatabaseModule,
        ClientsModule.registerAsync([
            {
                name: 'STORAGE_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get<string>('STORAGE_SERVICE_HOST', 'localhost'),
                        port: configService.get<number>('STORAGE_SERVICE_PORT', 3002),
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    providers: [OutboxRepository, OutboxWorker],
    exports: [OutboxRepository],
})
export class OutboxModule {}
