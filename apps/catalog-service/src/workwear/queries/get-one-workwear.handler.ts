import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOneWorkwearQuery } from './get-one-workwear.query';
import { WorkwearRepository } from '../workwear.repository';
import { Workwear } from '../workwear.entity';

@QueryHandler(GetOneWorkwearQuery)
export class GetOneWorkwearHandler implements IQueryHandler<GetOneWorkwearQuery, Workwear> {
    constructor(private readonly repo: WorkwearRepository) {}

    execute(query: GetOneWorkwearQuery): Promise<Workwear> {
        return this.repo.findById(query.id);
    }
}
