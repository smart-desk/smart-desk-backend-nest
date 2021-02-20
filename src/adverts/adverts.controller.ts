import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ACGuard, UseRoles } from 'nest-access-control';
import { AdvertsService } from './adverts.service';
import { Advert } from './entities/advert.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JWTPayload, RequestWithUserPayload } from '../auth/jwt.strategy';
import { ResourceEnum, RolesEnum } from '../app/app.roles';
import { CreateAdvertDto } from './dto/create-advert.dto';
import { UpdateAdvertDto } from './dto/update-advert.dto';
import { GetAdvertsDto, GetAdvertsResponseDto } from './dto/get-adverts.dto';
import { BlockedUserGuard } from '../guards/blocked-user.guard';
import { AdvertStatus } from './advert-status.enum';

@Controller('adverts')
@ApiTags('Adverts')
export class AdvertsController {
    constructor(private advertsService: AdvertsService) {}

    // todo make it accessible only for admin
    @Get()
    getAll(@Query() options: GetAdvertsDto): Promise<GetAdvertsResponseDto> {
        return this.advertsService.getAll(options);
    }

    @Get('/blocked')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.ADVERT,
        action: 'read',
    })
    async getBlocked(@Req() req: RequestWithUserPayload, @Query() options: GetAdvertsDto): Promise<GetAdvertsResponseDto> {
        if (!this.isAdmin(req.user)) {
            options.user = req.user.id;
        }
        options.status = AdvertStatus.BLOCKED;
        return this.advertsService.getAll(options);
    }

    @Get('/pending')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.ADVERT,
        action: 'read',
    })
    async getPending(@Req() req: RequestWithUserPayload, @Query() options: GetAdvertsDto): Promise<GetAdvertsResponseDto> {
        if (!this.isAdmin(req.user)) {
            options.user = req.user.id;
        }
        options.status = AdvertStatus.PENDING;
        return this.advertsService.getAll(options);
    }

    @Get('/completed')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.ADVERT,
        action: 'read',
    })
    async getCompleted(@Req() req: RequestWithUserPayload, @Query() options: GetAdvertsDto): Promise<GetAdvertsResponseDto> {
        if (!this.isAdmin(req.user)) {
            options.user = req.user.id;
        }
        options.status = AdvertStatus.COMPLETED;
        return this.advertsService.getAll(options);
    }

    @Get('/my')
    @UseGuards(JwtAuthGuard, ACGuard)
    @ApiBearerAuth('access-token')
    @UseRoles({
        resource: ResourceEnum.ADVERT,
        action: 'read',
    })
    getMy(@Req() req: RequestWithUserPayload, @Query() options: GetAdvertsDto): Promise<GetAdvertsResponseDto> {
        options.user = req.user.id;
        return this.advertsService.getAll(options);
    }

    @Get('/category/:categoryId')
    getForCategory(
        @Param('categoryId', ParseUUIDPipe) categoryId: string,
        @Query() options: GetAdvertsDto
    ): Promise<GetAdvertsResponseDto> {
        return this.advertsService.getForCategory(categoryId, options);
    }

    @Get(':id')
    getById(@Param('id', ParseUUIDPipe) id: string): Promise<Advert> {
        // todo should not be available for others if it's blocked or pending
        return this.advertsService.getById(id);
    }

    @Get(':id/recommended')
    getRecommended(@Param('id', ParseUUIDPipe) id: string): Promise<GetAdvertsResponseDto> {
        return this.advertsService.getRecommendedById(id);
    }

    @Post()
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @UseRoles({
        resource: ResourceEnum.ADVERT,
        action: 'create',
    })
    createAdvert(@Body() body: CreateAdvertDto, @Req() req: RequestWithUserPayload): Promise<Advert> {
        return this.advertsService.create(req.user.id, body);
    }

    @Patch(':id')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @UseRoles({
        resource: ResourceEnum.ADVERT,
        action: 'update',
    })
    async updateAdvert(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: UpdateAdvertDto,
        @Req() req: RequestWithUserPayload
    ): Promise<Advert> {
        const isAdminOrOwner = await this.isAdminOrOwner(id, req.user);
        if (!isAdminOrOwner) throw new ForbiddenException();
        return this.advertsService.update(id, body);
    }

    @Patch(':id/block')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.ADVERT,
        action: 'update',
    })
    async blockAdvert(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUserPayload): Promise<Advert> {
        const isAdmin = await this.isAdmin(req.user);
        if (!isAdmin) throw new ForbiddenException();
        return this.advertsService.block(id);
    }

    @Patch(':id/publish')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.ADVERT,
        action: 'update',
    })
    async publishAdvert(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUserPayload): Promise<Advert> {
        const isAdmin = await this.isAdmin(req.user);
        if (!isAdmin) throw new ForbiddenException();
        return this.advertsService.publish(id);
    }

    @Patch(':id/complete')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @UseRoles({
        resource: ResourceEnum.ADVERT,
        action: 'update',
    })
    async completeAdvert(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUserPayload): Promise<Advert> {
        const isAdminOrOwner = await this.isAdminOrOwner(id, req.user);
        if (!isAdminOrOwner) throw new ForbiddenException();
        return this.advertsService.complete(id);
    }

    @Delete(':id')
    @ApiBearerAuth('access-token')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @UseRoles({
        resource: ResourceEnum.ADVERT,
        action: 'delete',
    })
    async deleteAdvert(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUserPayload): Promise<Advert> {
        const isAdminOrOwner = await this.isAdminOrOwner(id, req.user);
        if (!isAdminOrOwner) throw new ForbiddenException();
        return await this.advertsService.delete(id);
    }

    private async isAdminOrOwner(advertId: string, userPayload: JWTPayload): Promise<boolean> {
        const isOwner = await this.isOwner(advertId, userPayload);
        const isAdmin = this.isAdmin(userPayload);
        return isOwner || isAdmin;
    }

    private async isOwner(advertId: string, userPayload: JWTPayload): Promise<boolean> {
        const owner = await this.advertsService.getAdvertOwner(advertId);
        return owner === userPayload.id;
    }

    private isAdmin(userPayload: JWTPayload): boolean {
        return userPayload.roles && userPayload.roles.some(role => role === RolesEnum.ADMIN);
    }
}
