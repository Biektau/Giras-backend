import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { RegisterCommand } from './register.command';
import { UserRepository } from '../repositories/user.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { TokenService } from '../services/token.service';
import { UserRole } from '../user-role.enum';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand, { accessToken: string; refreshToken: string }> {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly refreshTokenRepo: RefreshTokenRepository,
        private readonly tokenService: TokenService,
    ) {}

    async execute(command: RegisterCommand): Promise<{ accessToken: string; refreshToken: string }> {
        const existing = await this.userRepo.findByEmail(command.dto.email);
        if (existing) {
            throw new RpcException({ statusCode: 409, message: 'Пользователь с таким email уже существует' });
        }

        const hashedPassword = await bcrypt.hash(command.dto.password, 10);
        const user = await this.userRepo.create({
            email: command.dto.email,
            password: hashedPassword,
            name: command.dto.name,
            role: UserRole.USER,
        });

        const { accessToken, refreshToken, expiresAt } = this.tokenService.createTokenPair(user);
        await this.refreshTokenRepo.saveToken(user, refreshToken, expiresAt);

        return { accessToken, refreshToken };
    }
}
