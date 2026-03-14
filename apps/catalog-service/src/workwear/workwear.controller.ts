import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WorkwearService } from './workwear.service';
import { CreateWorkwearDto } from './dto/create-workwear.dto';
import { UpdateWorkwearDto } from './dto/update-workwear.dto';

@Controller()
export class WorkwearController {
    constructor(private readonly workwearService: WorkwearService) { }

    @MessagePattern({ cmd: 'get_all_workwear' })
    getAll() {
        return this.workwearService.getAll();
    }

    @MessagePattern({ cmd: 'get_one_workwear' })
    getOne(@Payload() id: string) {
        return this.workwearService.getOne(id);
    }

    @MessagePattern({ cmd: 'create_workwear' })
    createOne(@Payload() payload: { dto: CreateWorkwearDto; imageUrls: string[] }) {
        return this.workwearService.createOne(payload.dto, payload.imageUrls);
    }

    @MessagePattern({ cmd: 'copy_workwear' })
    copyOne(@Payload() id: string) {
        return this.workwearService.copyOne(id);
    }

    @MessagePattern({ cmd: 'update_workwear' })
    updateOne(@Payload() payload: { id: string; dto: UpdateWorkwearDto; imageUrls?: string[] }) {
        return this.workwearService.updateOne(payload.id, payload.dto, payload.imageUrls);
    }

    @MessagePattern({ cmd: 'reorder_workwear' })
    reorder(@Payload() items: { id: string; order: number }[]) {
        return this.workwearService.reorder(items);
    }

    @MessagePattern({ cmd: 'delete_workwear' })
    deleteOne(@Payload() id: string) {
        return this.workwearService.deleteOne(id);
    }
    
    @MessagePattern({ cmd: 'get_workwear_images' })
    getImages(@Payload() id: string) {
        return this.workwearService.getImages(id);
    }
    
}