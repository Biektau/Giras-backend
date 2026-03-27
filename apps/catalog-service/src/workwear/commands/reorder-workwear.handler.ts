import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReorderWorkwearCommand } from './reorder-workwear.command';
import { WorkwearRepository } from '../workwear.repository';

@CommandHandler(ReorderWorkwearCommand)
export class ReorderWorkwearHandler implements ICommandHandler<ReorderWorkwearCommand, void> {
    constructor(private readonly repo: WorkwearRepository) {}

    execute(command: ReorderWorkwearCommand): Promise<void> {
        return this.repo.reorder(command.items);
    }
}
