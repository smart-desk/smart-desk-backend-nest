import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from './enitities/app-config.entity';
import { AppConfigDto } from './dto/app-config.dto';

@Injectable()
export class AppConfigService {
    constructor(@InjectRepository(AppConfig) private appConfigRepository: Repository<AppConfig>) {}

    async updateAppConfig(newConfig: AppConfigDto): Promise<AppConfig> {
        const oldConfig = await this.appConfigRepository.findOne();

        if (oldConfig) {
            const updatedConfig = await this.appConfigRepository.preload({ id: oldConfig.id, ...newConfig });
            return await this.appConfigRepository.save(updatedConfig);
        }

        const newConfigEntity = this.appConfigRepository.create({ ...newConfig });
        return this.appConfigRepository.save(newConfigEntity);
    }

    async getAppConfig(): Promise<AppConfig> {
        return await this.appConfigRepository.findOne();
    }
}
