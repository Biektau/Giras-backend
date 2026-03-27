import { CreateWorkwearDto } from '../dto/create-workwear.dto';

export class CreateWorkwearCommand {
    constructor(
        public readonly dto: CreateWorkwearDto,
        public readonly imageUrls: string[],
    ) {}
}
