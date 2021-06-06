import { AdCampaignStatus, AdCampaignType } from '../enitities/ad-campaign.entity';
import { IsEnum, IsOptional } from 'class-validator';

export class GetAdCampaignsDto {
    @IsOptional()
    @IsEnum(AdCampaignType)
    type?: AdCampaignType;

    @IsOptional()
    @IsEnum(AdCampaignStatus)
    status?: AdCampaignStatus;
}
