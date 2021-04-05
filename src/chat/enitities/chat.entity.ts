import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('chats')
export class Chat {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'user_1' })
    user1: string;

    @Column('uuid', { name: 'user_2' })
    user2: string;

    @Column('uuid', { name: 'advert_id' })
    advertId: string;
}
