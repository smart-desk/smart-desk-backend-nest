import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('chats')
export class Chat {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'user_1' })
    user1: string;

    @Column('uuid', { name: 'user_2' })
    user2: string;

    @Column('uuid', { name: 'advert_id' })
    productId: string;

    productData: Product;

    user1Data: User;

    user2Data: User;

    unreadMessagesCount: number;
}
