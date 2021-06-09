import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdConfig } from './enitities/ad-config.entity';
import { AdController } from './ad.controller';
import { AdService } from './ad.service';
import { AdCampaign } from './enitities/ad-campaign.entity';
import { BlockedUserGuard } from '../../guards/blocked-user.guard';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([AdConfig]), TypeOrmModule.forFeature([AdCampaign]), UsersModule],
    controllers: [AdController],
    providers: [AdService, BlockedUserGuard],
    exports: [AdService],
})
export class AdModule {}
