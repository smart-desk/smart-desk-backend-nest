import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Advert } from '../../adverts/entities/advert.entity';
import { Exclude } from 'class-transformer';

@Entity('bookmarks')
export class Bookmark {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'user_id' })
    userId: string;

    @Column('uuid', { name: 'advert_id' })
    @Exclude()
    advertId: string;

    @OneToOne(() => Advert, { eager: true })
    @JoinColumn({ name: 'advert_id' })
    advert: Advert;
}
