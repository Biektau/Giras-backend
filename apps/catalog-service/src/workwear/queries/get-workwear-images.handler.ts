import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetWorkwearImagesQuery } from './get-workwear-images.query';
import { WorkwearRepository } from '../workwear.repository';

@QueryHandler(GetWorkwearImagesQuery)
export class GetWorkwearImagesHandler implements IQueryHandler<GetWorkwearImagesQuery, string[]> {
    constructor(private readonly repo: WorkwearRepository) {}

    execute(query: GetWorkwearImagesQuery): Promise<string[]> {
        return this.repo.getImages(query.id);
    }
}
