import { UpdateWorkwearDto } from '../dto/update-workwear.dto';

export class UpdateWorkwearCommand {
    constructor(
        public readonly id: string,
        public readonly dto: UpdateWorkwearDto,
        public readonly imageUrls: string[],
    ) {}
}
