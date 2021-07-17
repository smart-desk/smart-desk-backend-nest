import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Type } from 'class-transformer';
import * as dayjs from 'dayjs';
import { Transform } from 'class-transformer/decorators';

export enum AdCampaignType {
    MAIN = 'main',
    SIDEBAR = 'sidebar',
}

export enum AdCampaignStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    COMPLETED = 'completed',
    PAID = 'paid',
}

export const SHORT_DATE_FORMAT = 'DD.MM.YYYY';

@Entity('ad_campaigns')
export class AdCampaign {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'user_id' })
    userId: string;

    @Column('time with time zone', { name: 'start_date' })
    @Transform(value => dayjs(value).format(SHORT_DATE_FORMAT), { toPlainOnly: true })
    startDate: string;

    @Column('time with time zone', { name: 'end_date' })
    @Transform(value => dayjs(value).format(SHORT_DATE_FORMAT), { toPlainOnly: true })
    endDate: string;

    @Column('varchar', { length: 1000 })
    img: string;

    @Column('varchar', { length: 1000 })
    link: string;

    @Column('varchar', { length: 100 })
    type: AdCampaignType;

    @Column('varchar', { length: 100 })
    status: AdCampaignStatus;

    @Column('varchar', { length: 1000 })
    reason: string;
}
