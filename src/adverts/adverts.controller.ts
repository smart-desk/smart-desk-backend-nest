import { Controller, Get, Param } from '@nestjs/common';
import { AdvertsService } from './adverts.service';
import { Advert } from './advert.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('adverts')
@ApiTags('Adverts')
export class AdvertsController {
    constructor(private advertsService: AdvertsService) {}

    @Get()
    getAll(): Promise<Advert[]> {
        return this.advertsService.getAll();
    }

    @Get(':id')
    getById(@Param('id') id: string): Promise<Advert> {
        return this.advertsService.getById(id);
    }
}
