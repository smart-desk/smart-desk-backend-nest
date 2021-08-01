import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserStatus } from '../models/user-status.enum';
import { NotificationTypes } from '../models/notification-types.enum';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { length: 255 })
    firstName: string;

    @Column('varchar', { length: 255 })
    lastName: string;

    @Column('varchar', { length: 255 })
    status: UserStatus;

    @Column('varchar', { length: 1000 })
    avatar: string;

    @Column('varchar', { length: 255 })
    email: string;

    @Column('varchar', { length: 255, array: true })
    roles: string[];

    @Column('varchar', { length: 255 })
    phone: string;

    @Column('boolean', { name: 'is_phone_verified' })
    isPhoneVerified: boolean;

    @Column('varchar', { length: 100, name: 'vk_id' })
    vkId: string;

    @Column('varchar', { length: 100, name: 'facebook_id' })
    facebookId: string;

    @Column('varchar', { length: 100, name: 'email_notifications', array: true })
    emailNotifications: NotificationTypes[];
}
