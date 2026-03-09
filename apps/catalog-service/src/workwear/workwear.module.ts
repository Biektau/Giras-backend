import { Module } from '@nestjs/common';
import { WorkwearController } from './workwear.controller';
import { WorkwearService } from './workwear.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [WorkwearController],
  providers: [WorkwearService],
})
export class WorkwearModule {}