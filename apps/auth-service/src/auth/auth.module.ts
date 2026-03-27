import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';

import { UserRepository } from './repositories/user.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { TokenService } from './services/token.service';
import { AdminSeeder } from './services/admin-seeder.service';
import { TokenCleanupScheduler } from './schedulers/token-cleanup.scheduler';

import { GetMeHandler } from './queries/get-me.handler';
import { ValidateTokenHandler } from './queries/validate-token.handler';

import { RegisterHandler } from './commands/register.handler';
import { LoginHandler } from './commands/login.handler';
import { RefreshTokenHandler } from './commands/refresh-token.handler';
import { LogoutHandler } from './commands/logout.handler';
import { CleanExpiredTokensHandler } from './commands/clean-expired-tokens.handler';

const QueryHandlers = [GetMeHandler, ValidateTokenHandler];

const CommandHandlers = [
    RegisterHandler,
    LoginHandler,
    RefreshTokenHandler,
    LogoutHandler,
    CleanExpiredTokensHandler,
];

@Module({
    imports: [
        DatabaseModule,
        CqrsModule,
        ScheduleModule.forRoot(),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_ACCESS_SECRET'),
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        UserRepository,
        RefreshTokenRepository,
        TokenService,
        AdminSeeder,
        TokenCleanupScheduler,
        ...QueryHandlers,
        ...CommandHandlers,
    ],
})
export class AuthModule {}
