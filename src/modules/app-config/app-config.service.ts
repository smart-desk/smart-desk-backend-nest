import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from './enitities/app-config.entity';
import { AppConfigDto } from './dto/app-config.dto';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class AppConfigService {
    constructor(@InjectRepository(AppConfig) private appConfigRepository: Repository<AppConfig>, private s3Service: S3Service) {}

    async updateAppConfig(newConfig: AppConfigDto): Promise<AppConfig> {
        if (newConfig?.logo) {
            await this.s3Service.moveImageToPublic(newConfig?.logo);
            newConfig.logo = newConfig?.logo.replace('temp', 'public');
        }
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
