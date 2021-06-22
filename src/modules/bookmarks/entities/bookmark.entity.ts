import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Exclude } from 'class-transformer';

@Entity('bookmarks')
export class Bookmark {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'user_id' })
    userId: string;

    @Column('uuid', { name: 'advert_id' })
    @Exclude()
    productId: string;

    @OneToOne(() => Product, { eager: true })
    @JoinColumn({ name: 'advert_id' })
    product: Product;
}
