import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum PromoStatus {
    ACTIVE = 'active',
    PAUSED = 'paused',
}

@Entity('promos')
export class Promo {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'promo_set_id' })
    promoSetId: string;

    @Column('timestamp', { name: 'start_date' })
    startDate: Date;

    @Column('timestamp', { name: 'end_date' })
    endDate: Date;

    @Column('varchar', { length: 100 })
    status: PromoStatus;
}
