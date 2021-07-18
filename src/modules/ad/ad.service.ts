import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdConfig } from './enitities/ad-config.entity';
import { AdConfigDto } from './dto/ad-config.dto';
import { AdCampaign, AdCampaignStatus, AdCampaignType, SHORT_DATE_FORMAT } from './enitities/ad-campaign.entity';
import { AdCampaignDto } from './dto/ad-campaign.dto';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { GetAdCampaignsDto } from './dto/get-ad-campaigns.dto';

dayjs.extend(customParseFormat);

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

    async getCampaign(id: string): Promise<AdCampaign> {
        const adCampaign = this.adCampaignRepository.findOne({ id });
        if (!adCampaign) {
            throw new NotFoundException(`Ad Campaign ${id} not found`);
        }
        return adCampaign;
    }

    async getCampaigns(options: GetAdCampaignsDto): Promise<AdCampaign[]> {
        const builder = this.adCampaignRepository.createQueryBuilder();
        const where = {} as any;

        if (options?.type) {
            where['type'] = options.type;
        }
        if (options?.status) {
            where['status'] = options.status;
        }
        if (options?.user) {
            where['userId'] = options.user;
        }

        return builder.where(where).getMany();
    }

    async createCampaign(campaign: AdCampaignDto, userId: string): Promise<AdCampaign> {
        campaign.startDate = dayjs(campaign.startDate, SHORT_DATE_FORMAT).toISOString();
        campaign.endDate = dayjs(campaign.endDate, SHORT_DATE_FORMAT).toISOString();
        const campaignEntity = this.adCampaignRepository.create({ ...campaign, status: AdCampaignStatus.PENDING, userId });
        return await this.adCampaignRepository.save(campaignEntity);
    }

    async updateCampaign(id: string, campaign: AdCampaignDto): Promise<AdCampaign> {
        const oldCampaign = await this.getCampaign(id);
        oldCampaign.status = AdCampaignStatus.PENDING;
        campaign.startDate = dayjs(campaign.startDate, SHORT_DATE_FORMAT).toISOString();
        campaign.endDate = dayjs(campaign.endDate, SHORT_DATE_FORMAT).toISOString();
        const updatedCampaign = await this.adConfigRepository.preload({ id: oldCampaign.id, ...campaign });
        return await this.adCampaignRepository.save(updatedCampaign);
    }

    async getCampaignsSchedule(type: AdCampaignType): Promise<Partial<AdCampaign[]>> {
        return await this.adCampaignRepository
            .createQueryBuilder('campaign')
            .where({ status: AdCampaignStatus.PAID, type })
            .andWhere('campaign.endDate >= :today', { today: dayjs().toISOString() })
            .select(['campaign.startDate', 'campaign.endDate'])
            .getMany();
    }

    async getCurrentCampaign(type: AdCampaignType): Promise<Partial<AdCampaign>> {
        return await this.adCampaignRepository
            .createQueryBuilder('campaign')
            .where({ status: AdCampaignStatus.PAID, type })
            .andWhere(':today BETWEEN campaign.startDate and campaign.endDate', { today: dayjs().toISOString() })
            .select(['campaign.link', 'campaign.img', 'campaign.type', 'campaign.title'])
            .getOne();
    }

    async approveCampaign(id: string): Promise<AdCampaign> {
        const campaign = await this.findOneCampaignOrThrowException(id);
        campaign.status = AdCampaignStatus.APPROVED;
        campaign.reason = null;
        return this.adCampaignRepository.save(campaign);
    }

    async rejectCampaign(id: string, reason: string): Promise<AdCampaign> {
        const campaign = await this.findOneCampaignOrThrowException(id);
        campaign.status = AdCampaignStatus.REJECTED;
        campaign.reason = reason;
        return this.adCampaignRepository.save(campaign);
    }

    async payCampaign(id: string): Promise<AdCampaign> {
        const campaign = await this.findOneCampaignOrThrowException(id);
        campaign.status = AdCampaignStatus.PAID;
        return this.adCampaignRepository.save(campaign);
    }

    async findOneCampaignOrThrowException(id: string): Promise<AdCampaign> {
        const campaign = await this.adCampaignRepository.findOne({ id });
        if (!campaign) {
            throw new NotFoundException(`Campaign ${id} not found`);
        }
        return campaign;
    }

    async countCampaignCost(id: string): Promise<number> {
        const campaign = await this.findOneCampaignOrThrowException(id);
        const startDate = dayjs(campaign.startDate);
        const endDate = dayjs(campaign.endDate);
        const hours = endDate.diff(startDate, 'hours');

        const adConfig = await this.getAdConfig();
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
        return hours * rate * 100;
    }

    async deleteCampaign(id: string): Promise<any> {
        return this.adCampaignRepository.delete({ id });
    }
}
