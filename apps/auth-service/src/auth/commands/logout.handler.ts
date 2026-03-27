import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from './logout.command';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, { message: string }> {
    constructor(private readonly refreshTokenRepo: RefreshTokenRepository) {}

    async execute(command: LogoutCommand): Promise<{ message: string }> {
        const tokenEntity = await this.refreshTokenRepo.findByToken(command.token);
        if (tokenEntity) {
            await this.refreshTokenRepo.remove(tokenEntity);
        }
        return { message: 'Выход выполнен успешно' };
    }
}
