import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { WorkwearController } from './workwear.controller';
import { WorkwearRepository } from './workwear.repository';
import { DatabaseModule } from '../database/database.module';
import { OutboxModule } from '../outbox/outbox.module';

import { GetAllWorkwearHandler } from './queries/get-all-workwear.handler';
import { GetOneWorkwearHandler } from './queries/get-one-workwear.handler';
import { GetWorkwearImagesHandler } from './queries/get-workwear-images.handler';

import { CreateWorkwearHandler } from './commands/create-workwear.handler';
import { UpdateWorkwearHandler } from './commands/update-workwear.handler';
import { DeleteWorkwearHandler } from './commands/delete-workwear.handler';
import { CopyWorkwearHandler } from './commands/copy-workwear.handler';
import { ReorderWorkwearHandler } from './commands/reorder-workwear.handler';

const QueryHandlers = [
    GetAllWorkwearHandler,
    GetOneWorkwearHandler,
    GetWorkwearImagesHandler,
];

const CommandHandlers = [
    CreateWorkwearHandler,
    UpdateWorkwearHandler,
    DeleteWorkwearHandler,
    CopyWorkwearHandler,
    ReorderWorkwearHandler,
];

@Module({
    imports: [DatabaseModule, CqrsModule, OutboxModule],
    controllers: [WorkwearController],
    providers: [WorkwearRepository, ...QueryHandlers, ...CommandHandlers],
})
export class WorkwearModule {}
