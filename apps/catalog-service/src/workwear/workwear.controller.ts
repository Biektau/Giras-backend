import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateWorkwearDto } from './dto/create-workwear.dto';
import { UpdateWorkwearDto } from './dto/update-workwear.dto';

import { GetAllWorkwearQuery } from './queries/get-all-workwear.query';
import { GetOneWorkwearQuery } from './queries/get-one-workwear.query';
import { GetWorkwearImagesQuery } from './queries/get-workwear-images.query';

import { CreateWorkwearCommand } from './commands/create-workwear.command';
import { UpdateWorkwearCommand } from './commands/update-workwear.command';
import { DeleteWorkwearCommand } from './commands/delete-workwear.command';
import { CopyWorkwearCommand } from './commands/copy-workwear.command';
import { ReorderWorkwearCommand } from './commands/reorder-workwear.command';

@Controller()
export class WorkwearController {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) {}

    @MessagePattern({ cmd: 'get_all_workwear' })
    getAll() {
        return this.queryBus.execute(new GetAllWorkwearQuery());
    }

    @MessagePattern({ cmd: 'get_one_workwear' })
    getOne(@Payload() id: string) {
        return this.queryBus.execute(new GetOneWorkwearQuery(id));
    }

    @MessagePattern({ cmd: 'get_workwear_images' })
    getImages(@Payload() id: string) {
        return this.queryBus.execute(new GetWorkwearImagesQuery(id));
    }

    @MessagePattern({ cmd: 'create_workwear' })
    createOne(@Payload() payload: { dto: CreateWorkwearDto; imageUrls: string[] }) {
        return this.commandBus.execute(new CreateWorkwearCommand(payload.dto, payload.imageUrls));
    }

    @MessagePattern({ cmd: 'update_workwear' })
    updateOne(@Payload() payload: { id: string; dto: UpdateWorkwearDto; imageUrls: string[] }) {
        return this.commandBus.execute(new UpdateWorkwearCommand(payload.id, payload.dto, payload.imageUrls));
    }

    @MessagePattern({ cmd: 'delete_workwear' })
    deleteOne(@Payload() id: string) {
        return this.commandBus.execute(new DeleteWorkwearCommand(id));
    }

    @MessagePattern({ cmd: 'copy_workwear' })
    copyOne(@Payload() id: string) {
        return this.commandBus.execute(new CopyWorkwearCommand(id));
    }

    @MessagePattern({ cmd: 'reorder_workwear' })
    reorder(@Payload() items: { id: string; order: number }[]) {
        return this.commandBus.execute(new ReorderWorkwearCommand(items));
    }
}
