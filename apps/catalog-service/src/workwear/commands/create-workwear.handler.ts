import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateWorkwearCommand } from './create-workwear.command';
import { WorkwearRepository } from '../workwear.repository';
import { Workwear } from '../workwear.entity';
import { Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@CommandHandler(CreateWorkwearCommand)
export class CreateWorkwearHandler implements ICommandHandler<CreateWorkwearCommand, Workwear> {
    private readonly logger = new Logger(CreateWorkwearHandler.name);

    constructor(private readonly repo: WorkwearRepository) {}

    async execute(command: CreateWorkwearCommand): Promise<Workwear> {
        try {
            return await this.repo.create(command.dto, command.imageUrls);
        } catch (error) {
            this.logger.error('Ошибка при создании спецодежды', error);
            throw new RpcException({ statusCode: 500, message: 'Ошибка при создании спецодежды' });
        }
    }
}
