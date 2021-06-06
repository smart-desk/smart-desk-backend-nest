import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdConfig } from './enitities/ad-config.entity';
import { AdConfigDto } from './dto/ad-config.dto';
import { AdCampaign, AdCampaignState } from './enitities/ad-campaign.entity';
import { AdCampaignDto } from './dto/ad-campaign.dto';
import * as dayjs from 'dayjs';

@Injectable()
export class AdService {
    constructor(
        @InjectRepository(AdConfig) private adConfigRepository: Repository<AdConfig>,
        @InjectRepository(AdCampaign) private adCampaignRepository: Repository<AdCampaign>
    ) {}

    async updateAdConfig(newConfig: AdConfigDto): Promise<AdConfig> {
        const oldConfig = await this.adConfigRepository.findOne();
        if (oldConfig) {
            const updatedConfig = await this.adConfigRepository.preload({ id: oldConfig.id, ...newConfig });
            return await this.adConfigRepository.save(updatedConfig);
        }

        const newConfigEntity = this.adConfigRepository.create(newConfig);
        return this.adConfigRepository.save(newConfigEntity);
    }

    async getAdConfig(): Promise<AdConfig> {
        return await this.adConfigRepository.findOne();
    }

    async createCampaign(campaign: AdCampaignDto, userId: string): Promise<AdCampaign> {
        const campaignEntity = this.adCampaignRepository.create({ ...campaign, status: AdCampaignState.PENDING, userId });
        return await this.adCampaignRepository.save(campaignEntity);
    }

    async getCampaignsSchedule(): Promise<Partial<AdCampaign[]>> {
        return await this.adCampaignRepository
            .createQueryBuilder('campaign')
            .where({ status: AdCampaignState.PAID })
            .andWhere('d.endDate >= :today', { today: dayjs().toISOString() })
            .select(['campaign.startDate', 'campaign.endDate', 'campaign.startTime', 'campaign.endTime'])
            .getMany();
    }

    async approveCampaign(id: string): Promise<AdCampaign> {
        const campaign = await this.findOneCampaignOrThrowException(id);
        campaign.status = AdCampaignState.APPROVED;
        campaign.reason = null;
        return this.adCampaignRepository.save(campaign);
    }

    async rejectCampaign(id: string, reason: string): Promise<AdCampaign> {
        const campaign = await this.findOneCampaignOrThrowException(id);
        campaign.status = AdCampaignState.REJECTED;
        campaign.reason = reason;
        return this.adCampaignRepository.save(campaign);
    }

    private async findOneCampaignOrThrowException(id: string): Promise<AdCampaign> {
        const campaign = await this.adCampaignRepository.findOne({ id });
        if (!campaign) {
            throw new NotFoundException(`Campaign ${id} not found`);
        }
        return campaign;
    }
}
