import { AdCampaignType } from '../enitities/ad-campaign.entity';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { IsImageUrl } from '../../../utils/validation';

export class AdCampaignDto {
    @IsString()
    @IsOptional()
    title: string;

    @IsNotEmpty()
    @IsString()
    startDate: string;

    @IsNotEmpty()
    @IsString()
    endDate: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    img: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    @IsUrl()
    link: string;

    @IsNotEmpty()
    @IsEnum(AdCampaignType)
    type: AdCampaignType;
}
