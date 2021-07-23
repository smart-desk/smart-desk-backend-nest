import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

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

    @Column('uuid', { name: 'product_id' })
    productId: string;

    @Column('timestamp', { name: 'start_date' })
    startDate: Date;

    @Column('timestamp', { name: 'end_date' })
    endDate: Date;

    @Column('varchar', { length: 100 })
    status: PromoStatus;

    @OneToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;
}
