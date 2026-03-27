import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CleanExpiredTokensCommand } from './clean-expired-tokens.command';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';

@CommandHandler(CleanExpiredTokensCommand)
export class CleanExpiredTokensHandler implements ICommandHandler<CleanExpiredTokensCommand, void> {
    private readonly logger = new Logger(CleanExpiredTokensHandler.name);

    constructor(private readonly refreshTokenRepo: RefreshTokenRepository) {}

    async execute(): Promise<void> {
        const deleted = await this.refreshTokenRepo.deleteExpired();
        this.logger.log(`Удалено истёкших токенов: ${deleted}`);
    }
}
