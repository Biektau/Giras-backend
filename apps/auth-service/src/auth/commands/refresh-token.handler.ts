import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RpcException } from '@nestjs/microservices';
import { RefreshTokenCommand } from './refresh-token.command';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { TokenService } from '../services/token.service';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand, { accessToken: string; refreshToken: string }> {
    constructor(
        private readonly refreshTokenRepo: RefreshTokenRepository,
        private readonly tokenService: TokenService,
    ) {}

    async execute(command: RefreshTokenCommand): Promise<{ accessToken: string; refreshToken: string }> {
        const tokenEntity = await this.refreshTokenRepo.findByToken(command.token);

        if (!tokenEntity) {
            throw new RpcException({ statusCode: 401, message: 'Refresh token не найден' });
        }

        if (tokenEntity.expiresAt < new Date()) {
            await this.refreshTokenRepo.remove(tokenEntity);
            throw new RpcException({ statusCode: 401, message: 'Refresh token истёк' });
        }

        await this.refreshTokenRepo.remove(tokenEntity);

        const { accessToken, refreshToken, expiresAt } = this.tokenService.createTokenPair(tokenEntity.user);
        await this.refreshTokenRepo.saveToken(tokenEntity.user, refreshToken, expiresAt);

        return { accessToken, refreshToken };
    }
}
