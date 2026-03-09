import { Module } from '@nestjs/common';
import { WorkwearModule } from './workwear/workwear.module';

@Module({
  imports: [WorkwearModule],
})
export class AppModule {}