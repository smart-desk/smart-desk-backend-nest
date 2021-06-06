import { Injectable } from '@nestjs/common';
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
}
