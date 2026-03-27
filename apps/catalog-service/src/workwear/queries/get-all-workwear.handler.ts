import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllWorkwearQuery } from './get-all-workwear.query';
import { WorkwearRepository } from '../workwear.repository';
import { Workwear } from '../workwear.entity';

@QueryHandler(GetAllWorkwearQuery)
export class GetAllWorkwearHandler implements IQueryHandler<GetAllWorkwearQuery, Workwear[]> {
    constructor(private readonly repo: WorkwearRepository) {}

    execute(): Promise<Workwear[]> {
        return this.repo.findAll();
    }
}
