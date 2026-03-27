import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { GetMeQuery } from './queries/get-me.query';
import { ValidateTokenQuery } from './queries/validate-token.query';

import { RegisterCommand } from './commands/register.command';
import { LoginCommand } from './commands/login.command';
import { RefreshTokenCommand } from './commands/refresh-token.command';
import { LogoutCommand } from './commands/logout.command';

@Controller()
export class AuthController {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) {}

    @MessagePattern({ cmd: 'get_me' })
    getMe(@Payload() id: string) {
        return this.queryBus.execute(new GetMeQuery(id));
    }

    @MessagePattern({ cmd: 'validate_token' })
    validateToken(@Payload() accessToken: string) {
        return this.queryBus.execute(new ValidateTokenQuery(accessToken));
    }

    @MessagePattern({ cmd: 'register' })
    register(@Payload() dto: RegisterDto) {
        return this.commandBus.execute(new RegisterCommand(dto));
    }

    @MessagePattern({ cmd: 'login' })
    login(@Payload() dto: LoginDto) {
        return this.commandBus.execute(new LoginCommand(dto));
    }

    @MessagePattern({ cmd: 'refresh' })
    refresh(@Payload() token: string) {
        return this.commandBus.execute(new RefreshTokenCommand(token));
    }

    @MessagePattern({ cmd: 'logout' })
    logout(@Payload() token: string) {
        return this.commandBus.execute(new LogoutCommand(token));
    }
}
