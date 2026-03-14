import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WorkwearController } from './workwear.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule.registerAsync([
      {
        name: 'CATALOG_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('CATALOG_SERVICE_HOST', 'localhost'),
            port: configService.get<number>('CATALOG_SERVICE_PORT', 3001),
          },
        }),
        inject: [ConfigService],
      },
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
  controllers: [WorkwearController],
})
export class WorkwearModule {}