import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('app_config')
export class AppConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('numeric', { name: 'ad_hourly_rate', precision: 13, scale: 2 })
    adHourlyRate: number;
}
