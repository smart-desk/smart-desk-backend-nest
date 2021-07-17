import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Type } from 'class-transformer';

@Entity('promo_sets')
export class PromoSet {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { length: 100 })
    name: string;

    @Column('integer')
    days: number;

    @Column('numeric', { precision: 13, scale: 2 })
    @Type(() => Number)
    price: number;
}
