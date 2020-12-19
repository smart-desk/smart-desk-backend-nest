import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ACGuard } from 'nest-access-control';
import { Request } from 'express';
import { AdvertsService } from './adverts.service';
import { Advert } from './entities/advert.entity';
import { AdvertsGetDto, AdvertsGetResponseDto, UpdateAdvertDto } from './dto/advert.dto';
import { CreateAdvertDto } from './dto/advert.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JWTUserPayload } from '../auth/jwt.strategy';

@Controller('adverts')
@ApiTags('Adverts')
export class AdvertsController {
    constructor(private advertsService: AdvertsService) {}

    @Get()
    getAll(@Query() options: AdvertsGetDto): Promise<AdvertsGetResponseDto> {
        return this.advertsService.getAll(options);
    }

    @Get(':id')
    getById(@Param('id', ParseUUIDPipe) id: string): Promise<Advert> {
        return this.advertsService.getById(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, ACGuard)
    createAdvert(@Body() body: CreateAdvertDto, @Req() req: Request & JWTUserPayload): Promise<Advert> {
        return this.advertsService.create(req.user.id, body);
    }

    @Patch(':id')
    updateAdvert(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateAdvertDto): Promise<Advert> {
        return this.advertsService.update(id, body);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteModel(@Param('id', ParseUUIDPipe) id: string) {
        await this.advertsService.delete(id);
    }
}
