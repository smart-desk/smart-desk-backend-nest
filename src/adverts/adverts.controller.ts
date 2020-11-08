import { Controller, Get, Param, Query } from '@nestjs/common';
import { AdvertsService } from './adverts.service';
import { Advert } from './entities/advert.entity';
import { ApiTags } from '@nestjs/swagger';
import { AdvertsGetDto, AdvertsGetResponseDto } from './dto/advert.dto';

@Controller('adverts')
@ApiTags('Adverts')
export class AdvertsController {
    constructor(private advertsService: AdvertsService) {}

    @Get()
    getAll(@Query() options: AdvertsGetDto): Promise<AdvertsGetResponseDto> {
        return this.advertsService.getAll(options);
    }

    @Get(':id')
    getById(@Param('id') id: string): Promise<Advert> {
        return this.advertsService.getById(id);
    }
}
