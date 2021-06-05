import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdConfig } from './enitities/ad-config.entity';
import { AdConfigDto } from './dto/ad-config.dto';

@Injectable()
export class AdService {
    constructor(@InjectRepository(AdConfig) private adConfigRepository: Repository<AdConfig>) {}

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
}
