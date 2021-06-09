import { AdCampaignType } from '../enitities/ad-campaign.entity';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';
import { IsImageUrl } from '../../../utils/validation';

export class AdCampaignDto {
    @IsNotEmpty()
    @Type(() => Date)
    startDate: Date;

    @IsNotEmpty()
    @Type(() => Date)
    endDate: Date;

    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    @IsUrl()
    @IsImageUrl()
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
