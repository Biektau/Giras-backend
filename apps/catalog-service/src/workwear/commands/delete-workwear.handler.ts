import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteWorkwearCommand } from './delete-workwear.command';
import { WorkwearRepository } from '../workwear.repository';

@CommandHandler(DeleteWorkwearCommand)
export class DeleteWorkwearHandler implements ICommandHandler<DeleteWorkwearCommand, { message: string }> {
    constructor(private readonly repo: WorkwearRepository) {}

    async execute(command: DeleteWorkwearCommand): Promise<{ message: string }> {
        await this.repo.removeWithOutboxEvents(command.id);
        return { message: `Спецодежда с id ${command.id} удалена` };
    }
}
