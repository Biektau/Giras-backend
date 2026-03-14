import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WorkwearModule } from './workwear/workwear.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    WorkwearModule,
  ],
})
export class AppModule {}