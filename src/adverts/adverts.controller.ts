import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdvertsService } from './adverts.service';
import { Advert } from './entities/advert.entity';
import { AdvertsGetDto, AdvertsGetResponseDto } from './dto/get-adverts.dto';
import { CreateAdvertDto } from './dto/create-advert.dto';

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

    @Post()
    createAdvert(@Body() body: CreateAdvertDto): Promise<Advert> {
        return this.advertsService.create(body);
    }
}
