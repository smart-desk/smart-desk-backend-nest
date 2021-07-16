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
    Req,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ACGuard, UseRoles } from 'nest-access-control';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ResourceEnum, RolesEnum } from '../app/app.roles';
import { PromoSetService } from './promo-set.service';
import { PromoSetDto } from './dto/promo-set.dto';
import { PromoSet } from './entities/promo-set.entity';
import { RequestWithUserPayload } from '../auth/jwt.strategy';
import { User } from '../users/entities/user.entity';

@Controller('promo-set')
export class PromoSetController {
    constructor(private promoSetService: PromoSetService) {}

    @Post()
    @UseGuards(JwtAuthGuard, ACGuard)
    @ApiBearerAuth('access-token')
    @UseRoles({
        resource: ResourceEnum.PROMO_SET,
        action: 'create',
    })
    createPromoSet(@Body() body: PromoSetDto, @Req() req: RequestWithUserPayload): Promise<PromoSet> {
        if (!this.isAdmin(req.user)) throw new ForbiddenException();
        return this.promoSetService.create(body);
    }

    @Get()
    @UseGuards(JwtAuthGuard, ACGuard)
    @ApiBearerAuth('access-token')
    @UseRoles({
        resource: ResourceEnum.PROMO_SET,
        action: 'read',
    })
    getPromoSets(@Req() req: RequestWithUserPayload): Promise<PromoSet[]> {
        if (!this.isAdmin(req.user)) throw new ForbiddenException();
        return this.promoSetService.getList();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, ACGuard)
    @ApiBearerAuth('access-token')
    @UseRoles({
        resource: ResourceEnum.PROMO_SET,
        action: 'read',
    })
    getPromoSet(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUserPayload): Promise<PromoSet> {
        if (!this.isAdmin(req.user)) throw new ForbiddenException();
        return this.promoSetService.getById(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, ACGuard)
    @ApiBearerAuth('access-token')
    @UseRoles({
        resource: ResourceEnum.PROMO_SET,
        action: 'update',
    })
    updatePromoSet(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: PromoSetDto,
        @Req() req: RequestWithUserPayload
    ): Promise<PromoSet> {
        if (!this.isAdmin(req.user)) throw new ForbiddenException();
        return this.promoSetService.update(id, body);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard, ACGuard)
    @ApiBearerAuth('access-token')
    @UseRoles({
        resource: ResourceEnum.PROMO_SET,
        action: 'delete',
    })
    async deletePromoSet(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUserPayload) {
        if (!this.isAdmin(req.user)) throw new ForbiddenException();
        await this.promoSetService.delete(id);
    }

    private isAdmin(user: User): boolean {
        return user.roles && user.roles.some(role => role === RolesEnum.ADMIN);
    }
}
