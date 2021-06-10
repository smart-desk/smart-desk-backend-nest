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
import { AdCampaign, AdCampaignType } from './enitities/ad-campaign.entity';
import { AdCampaignDto } from './dto/ad-campaign.dto';
import { RejectCampaignDto } from './dto/reject-campaign.dto';
import { GetAdCampaignsDto } from './dto/get-ad-campaigns.dto';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as dayjs from 'dayjs';

dotenv.config();

const DATE_FORMAT = 'MMMM D, YYYY';

@Controller('ad')
@ApiTags('Ad')
export class AdController {
    private stripe: Stripe;

    constructor(private adService: AdService) {
        // todo update to live key
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2020-08-27' });
    }

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
    async payCampaign(@Param('id', ParseUUIDPipe) id: string): Promise<{ id: string }> {
        const campaign = await this.adService.findOneCampaignOrThrowException(id);
        const startDate = dayjs(campaign.startDate);
        const endDate = dayjs(campaign.endDate);
        const hours = endDate.diff(startDate, 'hours');

        const adConfig = await this.adService.getAdConfig();
        if (!adConfig) {
            throw new BadRequestException('Hourly rate is not set');
        }
        let rate: number;
        if (campaign.type === AdCampaignType.MAIN) {
            rate = Number.parseFloat(adConfig.mainHourlyRate.toString());
        } else if (campaign.type === AdCampaignType.SIDEBAR) {
            rate = Number.parseFloat(adConfig.sidebarHourlyRate.toString());
        } else {
            throw new BadRequestException('Invalid campaign type');
        }

        const amount = hours * rate * 100;

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'rub', // todo site currency
                        product_data: {
                            name: `Рекламная кампания c ${startDate.format(DATE_FORMAT)} по ${endDate.format(DATE_FORMAT)}`,
                            metadata: {
                                campaign: campaign.id,
                            },
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.HOST}/my-ad-campaigns.html`, // todo + id of campaign
            cancel_url: `${process.env.HOST}/my-ad-campaigns.html`, // todo + id of campaign
        });

        return { id: session.id };
    }

    private isAdmin(user: User): boolean {
        return user.roles && user.roles.some(role => role === RolesEnum.ADMIN);
    }

    private async checkAdCampaignParams(campaignParams: AdCampaignDto): Promise<string | undefined> {
        if (campaignParams.startDate > campaignParams.endDate) {
            return 'Start date must be earlier than End date';
        }

        const takenAdRanges = await this.adService.getCampaignsSchedule(campaignParams.type);
        const overlapping = takenAdRanges.some(
            takenAdRange => !(campaignParams.startDate > takenAdRange.endDate || campaignParams.endDate < takenAdRange.startDate)
        );
        if (overlapping) {
            return 'Dates overlap with another campaign';
        }
    }
}
