import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectCampaignDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    reason: string;
}
