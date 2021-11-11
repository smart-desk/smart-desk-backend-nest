import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Type } from 'class-transformer';

@Entity('ad_config')
export class AdConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('numeric', { name: 'main_hourly_rate', precision: 13, scale: 2 })
    @Type(() => Number)
    mainHourlyRate: number;

    @Column('numeric', { name: 'sidebar_hourly_rate', precision: 13, scale: 2 })
    @Type(() => Number)
    sidebarHourlyRate: number;

    @Column('numeric', { name: 'lift_rate', precision: 13, scale: 2 })
    @Type(() => Number)
    liftRate: number;

    @Column('json')
    adsense: unknown;
}
