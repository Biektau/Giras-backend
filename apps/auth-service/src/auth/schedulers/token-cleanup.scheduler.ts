import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CleanExpiredTokensCommand } from '../commands/clean-expired-tokens.command';

@Injectable()
export class TokenCleanupScheduler {
    constructor(private readonly commandBus: CommandBus) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cleanExpiredTokens(): Promise<void> {
        await this.commandBus.execute(new CleanExpiredTokensCommand());
    }
}
