import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdvertsService } from './adverts.service';
import { Advert } from './entities/advert.entity';
import { AdvertsGetDto, AdvertsGetResponseDto, UpdateAdvertDto } from './dto/advert.dto';
import { CreateAdvertDto } from './dto/advert.dto';

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

    @Patch(':id')
    updateAdvert(@Param('id') id: string, @Body() body: UpdateAdvertDto): Promise<Advert> {
        return this.advertsService.update(id, body);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteModel(@Param('id') id: string) {
        await this.advertsService.delete(id);
    }
}
