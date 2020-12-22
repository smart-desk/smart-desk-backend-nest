import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Expose } from 'class-transformer';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { length: 255 })
    firstName: string;

    @Column('varchar', { length: 255 })
    lastName: string;

    @Column('varchar', { length: 255 })
    @Expose({ groups: ['owner'] })
    email: string;

    @Column('varchar', { length: 255, array: true })
    roles: string[];
}
