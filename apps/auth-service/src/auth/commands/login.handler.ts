import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { LoginCommand } from './login.command';
import { UserRepository } from '../repositories/user.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { TokenService } from '../services/token.service';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, { accessToken: string; refreshToken: string }> {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly refreshTokenRepo: RefreshTokenRepository,
        private readonly tokenService: TokenService,
    ) {}

    async execute(command: LoginCommand): Promise<{ accessToken: string; refreshToken: string }> {
        const user = await this.userRepo.findByEmail(command.dto.email);
        if (!user) {
            throw new RpcException({ statusCode: 401, message: 'Неверный email или пароль' });
        }

        const isPasswordValid = await bcrypt.compare(command.dto.password, user.password);
        if (!isPasswordValid) {
            throw new RpcException({ statusCode: 401, message: 'Неверный email или пароль' });
        }

        const { accessToken, refreshToken, expiresAt } = this.tokenService.createTokenPair(user);
        await this.refreshTokenRepo.saveToken(user, refreshToken, expiresAt);

        return { accessToken, refreshToken };
    }
}
