import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ad_config')
export class AdConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('numeric', { name: 'main_hourly_rate', precision: 13, scale: 2 })
    mainHourlyRate: number;

    @Column('numeric', { name: 'sidebar_hourly_rate', precision: 13, scale: 2 })
    sidebarHourlyRate: number;
}
