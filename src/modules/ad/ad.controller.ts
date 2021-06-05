import { Body, Controller, ForbiddenException, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ACGuard, UseRoles } from 'nest-access-control';
import { ResourceEnum, RolesEnum } from '../app/app.roles';
import { AdService } from './ad.service';
import { AdConfigDto } from './dto/ad-config.dto';
import { AdConfig } from './enitities/ad-config.entity';
import { User } from '../users/entities/user.entity';
import { RequestWithUserPayload } from '../auth/jwt.strategy';
import { BlockedUserGuard } from '../../guards/blocked-user.guard';
import { AdCampaign } from './enitities/ad-campaign.entity';
import { AdCampaignDto } from './dto/ad-campaign.dto';

@Controller('ad')
@ApiTags('Ad')
export class AdController {
    constructor(private appService: AdService) {}

    @Post('config')
    @UseGuards(JwtAuthGuard, ACGuard)
    @ApiBearerAuth('access-token')
    @UseRoles({
        resource: ResourceEnum.AD_CONFIG,
        action: 'update',
    })
    updateAdConfig(@Body() body: AdConfigDto, @Req() req: RequestWithUserPayload): Promise<AdConfig> {
        if (!this.isAdmin(req.user)) throw new ForbiddenException();
        return this.appService.updateAdConfig(body);
    }

    @Get('config')
    getAdConfig(): Promise<AdConfig> {
        return this.appService.getAdConfig();
    }

    @Post('campaign')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @ApiBearerAuth('access-token')
    @UseRoles({
        resource: ResourceEnum.AD_CAMPAIGN,
        action: 'create',
    })
    createCampaign(@Body() body: AdCampaignDto): Promise<AdCampaign> {
        return this.appService.createCampaign(body);
    }

    private isAdmin(user: User): boolean {
        return user.roles && user.roles.some(role => role === RolesEnum.ADMIN);
    }
}
