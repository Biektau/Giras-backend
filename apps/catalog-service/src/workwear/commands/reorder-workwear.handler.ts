import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReorderWorkwearCommand } from './reorder-workwear.command';
import { WorkwearRepository } from '../workwear.repository';

@CommandHandler(ReorderWorkwearCommand)
export class ReorderWorkwearHandler implements ICommandHandler<ReorderWorkwearCommand, { success: true }> {
    constructor(private readonly repo: WorkwearRepository) {}

    async execute(command: ReorderWorkwearCommand): Promise<{ success: true }> {
        await this.repo.reorder(command.items);
        return { success: true };
    }
}
