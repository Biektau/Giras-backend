import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WorkwearModule } from './workwear/workwear.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    WorkwearModule,
    AuthModule,
  ],
})
export class AppModule {}