import {
    BadRequestException,
    Body,
    Controller,
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
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ACGuard, UseRoles } from 'nest-access-control';
import { ResourceEnum, RolesEnum } from '../app/app.roles';
import { AdService } from './ad.service';
import { AdConfigDto } from './dto/ad-config.dto';
import { AdConfig } from './enitities/ad-config.entity';
import { User } from '../users/entities/user.entity';
import { RequestWithUserPayload } from '../auth/jwt.strategy';
import { BlockedUserGuard } from '../../guards/blocked-user.guard';
import { AdCampaign, AdCampaignType, SHORT_DATE_FORMAT } from './enitities/ad-campaign.entity';
import { AdCampaignDto } from './dto/ad-campaign.dto';
import { RejectCampaignDto } from './dto/reject-campaign.dto';
import { GetAdCampaignsDto } from './dto/get-ad-campaigns.dto';
import * as dotenv from 'dotenv';
import * as dayjs from 'dayjs';
import { StripeService } from '../stripe/stripe.service';

dotenv.config();

const DATE_FORMAT = 'MMMM D, YYYY';

@Controller('ad')
@ApiTags('Ad')
export class AdController {
    constructor(private adService: AdService, private stripeService: StripeService) {}

    @Post('config')
    @UseGuards(JwtAuthGuard, ACGuard)
    @ApiBearerAuth('access-token')
    @UseRoles({
        resource: ResourceEnum.AD_CONFIG,
        action: 'update',
    })
    @HttpCode(HttpStatus.OK)
    updateAdConfig(@Body() body: AdConfigDto, @Req() req: RequestWithUserPayload): Promise<AdConfig> {
        if (!this.isAdmin(req.user)) throw new ForbiddenException();
        return this.adService.updateAdConfig(body);
    }

    @Get('config')
    @UseGuards(JwtAuthGuard, ACGuard)
    @ApiBearerAuth('access-token')
    @UseRoles({
        resource: ResourceEnum.AD_CONFIG,
        action: 'read',
    })
    getAdConfig(): Promise<AdConfig> {
        return this.adService.getAdConfig();
    }

    @Get('campaigns')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @ApiBearerAuth('access-token')
    @UseRoles({
        resource: ResourceEnum.AD_CAMPAIGN,
        action: 'read',
    })
    async getCampaigns(@Req() req: RequestWithUserPayload, @Query() options: GetAdCampaignsDto): Promise<AdCampaign[]> {
        if (!this.isAdmin(req.user)) {
            options.user = req.user.id;
        }
        return this.adService.getCampaigns(options);
    }

    @Post('campaigns')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @ApiBearerAuth('access-token')
    @UseRoles({
        resource: ResourceEnum.AD_CAMPAIGN,
        action: 'create',
    })
    async createCampaign(@Body() body: AdCampaignDto, @Req() req: RequestWithUserPayload): Promise<AdCampaign> {
        const errorMessage = await this.checkAdCampaignParams(body);
        if (errorMessage) throw new BadRequestException(errorMessage);
        return this.adService.createCampaign(body, req.user.id);
    }

    @Patch('campaigns/:id')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @ApiBearerAuth('access-token')
    @UseRoles({
        resource: ResourceEnum.AD_CAMPAIGN,
        action: 'update',
    })
    async updateCampaign(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: AdCampaignDto,
        @Req() req: RequestWithUserPayload
    ): Promise<AdCampaign> {
        const isOwner = await this.isOwner(id, req.user);
        if (!isOwner) throw new ForbiddenException();
        const errorMessage = await this.checkAdCampaignParams(body);
        if (errorMessage) throw new BadRequestException(errorMessage);
        return this.adService.updateCampaign(id, body);
    }

    @Get('campaigns/schedule')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @ApiBearerAuth('access-token')
    @UseRoles({
        resource: ResourceEnum.AD_CAMPAIGN,
        action: 'read',
    })
    getCampaignsSchedule(@Query('type') type: AdCampaignType): Promise<Partial<AdCampaign[]>> {
        if (!type) throw new BadRequestException('Invalid campaign type');
        return this.adService.getCampaignsSchedule(type);
    }

    @Patch('campaigns/:id/approve')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @ApiBearerAuth('access-token')
    @UseRoles({
        resource: ResourceEnum.AD_CAMPAIGN,
        action: 'update',
    })
    approveCampaign(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUserPayload): Promise<AdCampaign> {
        if (!this.isAdmin(req.user)) throw new ForbiddenException();
        return this.adService.approveCampaign(id);
    }

    @Patch('campaigns/:id/reject')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @ApiBearerAuth('access-token')
    @UseRoles({
        resource: ResourceEnum.AD_CAMPAIGN,
        action: 'update',
    })
    rejectCampaign(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: RejectCampaignDto,
        @Req() req: RequestWithUserPayload
    ): Promise<AdCampaign> {
        if (!this.isAdmin(req.user)) throw new ForbiddenException();
        return this.adService.rejectCampaign(id, body.reason);
    }

    @Get('campaigns/current')
    getCurrentCampaign(@Query('type') type: AdCampaignType): Promise<Partial<AdCampaign>> {
        if (!type) throw new BadRequestException('Invalid campaign type');
        return this.adService.getCurrentCampaign(type);
    }

    @Post('campaigns/:id/pay')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @ApiBearerAuth('access-token')
    @UseRoles({
        resource: ResourceEnum.AD_CAMPAIGN,
        action: 'update',
    })
    @HttpCode(HttpStatus.OK)
    async payCampaign(@Param('id', ParseUUIDPipe) id: string): Promise<{ id: string }> {
        const campaign = await this.adService.findOneCampaignOrThrowException(id);
        const amount = await this.adService.countCampaignCost(campaign.id);
        const startDate = dayjs(campaign.startDate);
        const endDate = dayjs(campaign.endDate);

        return await this.stripeService.createPaymentSession({
            payment_method_types: ['card'],
            payment_intent_data: {
                metadata: {
                    campaign: campaign.id,
                },
            },
            line_items: [
                {
                    price_data: {
                        currency: 'rub', // todo site currency
                        product_data: {
                            name: `Рекламная кампания c ${startDate.format(DATE_FORMAT)} по ${endDate.format(DATE_FORMAT)}`,
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.HOST}/profile/my-ad-campaigns/${campaign.id}`,
            cancel_url: `${process.env.HOST}/profile/my-ad-campaigns/${campaign.id}`,
        });
    }

    private isAdmin(user: User): boolean {
        return user.roles && user.roles.some(role => role === RolesEnum.ADMIN);
    }

    private async isOwner(campaignId: string, user: User): Promise<boolean> {
        const campaign = await this.adService.getCampaign(campaignId);
        return campaign.userId === user.id;
    }

    private async checkAdCampaignParams(targetCampaign: AdCampaignDto): Promise<string | undefined> {
        const targetCampaignStartDate = dayjs(targetCampaign.startDate, SHORT_DATE_FORMAT);
        const targetCampaignEndDate = dayjs(targetCampaign.endDate, SHORT_DATE_FORMAT);

        if (targetCampaignEndDate.isBefore(targetCampaignEndDate)) {
            return 'Start date must be earlier than End date';
        }

        if (targetCampaignStartDate.isBefore(dayjs())) {
            return 'Start date must be in future';
        }

        const otherAdCampaigns = await this.adService.getCampaignsSchedule(targetCampaign.type);
        const overlapping = otherAdCampaigns.some(adCampaign => {
            const adCampaignStartDate = dayjs(adCampaign.startDate);
            const adCampaignEndDate = dayjs(adCampaign.endDate);
            return targetCampaignStartDate.isBefore(adCampaignEndDate) && adCampaignStartDate.isAfter(targetCampaignEndDate);
        });

        if (overlapping) {
            return 'Dates overlap with another campaign';
        }
    }
}
