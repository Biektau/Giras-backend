import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CopyWorkwearCommand } from './copy-workwear.command';
import { WorkwearRepository } from '../workwear.repository';
import { Workwear } from '../workwear.entity';

@CommandHandler(CopyWorkwearCommand)
export class CopyWorkwearHandler implements ICommandHandler<CopyWorkwearCommand, Workwear> {
    constructor(private readonly repo: WorkwearRepository) {}

    async execute(command: CopyWorkwearCommand): Promise<Workwear> {
        const { id: _, createdAt, updatedAt, images: _images, order: _order, ...data } = await this.repo.findById(command.id);
        return this.repo.create(data, command.imageUrls);
    }
}
