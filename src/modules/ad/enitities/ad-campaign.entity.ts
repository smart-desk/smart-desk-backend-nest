import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum AdCampaignType {
    MAIN = 'main',
    SIDEBAR = 'sidebar',
}

export enum AdCampaignState {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    COMPLETED = 'completed',
}

@Entity('ad_campaigns')
export class AdCampaign {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('time with time zone', { name: 'start_date' })
    startDate: Date;

    @Column('time with time zone', { name: 'end_date' })
    endDate: Date;

    @Column('time with time zone', { name: 'start_time' })
    startTime: Date;

    @Column('time with time zone', { name: 'end_time' })
    endTime: Date;

    @Column('varchar', { length: 1000 })
    img: string;

    @Column('varchar', { length: 1000 })
    link: string;

    @Column('varchar', { length: 100 })
    type: AdCampaignType;

    @Column('varchar', { length: 100 })
    status: AdCampaignState = AdCampaignState.PENDING;

    @Column('varchar', { length: 1000 })
    reason: string;
}
