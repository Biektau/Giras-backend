import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WorkwearController } from './workwear.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule.register([
      {
        name: 'CATALOG_SERVICE',
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3001 },
      },
      {
        name: 'STORAGE_SERVICE',
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3002 },
      },
    ]),
  ],
  controllers: [WorkwearController],
})
export class WorkwearModule {}