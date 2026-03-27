import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateWorkwearCommand } from './update-workwear.command';
import { WorkwearRepository } from '../workwear.repository';
import { Workwear } from '../workwear.entity';
import { Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@CommandHandler(UpdateWorkwearCommand)
export class UpdateWorkwearHandler implements ICommandHandler<UpdateWorkwearCommand, Workwear> {
    private readonly logger = new Logger(UpdateWorkwearHandler.name);

    constructor(private readonly repo: WorkwearRepository) {}

    async execute(command: UpdateWorkwearCommand): Promise<Workwear> {
        const workwear = await this.repo.findById(command.id);

        const removedImages = (workwear.images ?? []).filter(
            url => !command.imageUrls.includes(url),
        );

        try {
            Object.assign(workwear, command.dto);
            workwear.images = command.imageUrls;
            return await this.repo.saveWithOutboxEvents(workwear, removedImages);
        } catch (error) {
            this.logger.error('Ошибка при обновлении спецодежды', error);
            throw new RpcException({ statusCode: 500, message: 'Ошибка при обновлении спецодежды' });
        }
    }
}
