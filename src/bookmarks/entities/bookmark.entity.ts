import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bookmarks')
export class Bookmark {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'user_id' })
    userId: string;

    @Column('uuid', { name: 'advert_id' })
    advertId: string;
}
