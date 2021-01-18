import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserStatus } from '../user-status.enum';

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
    email: string; // todo hide for public

    @Column('varchar', { length: 255, array: true })
    roles: string[]; // todo hide for public
}
