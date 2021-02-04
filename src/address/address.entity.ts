import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('address')
export class Address {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { length: 255 })
    title: string;

    @Column('integer')
    radius: number;

    @Column('uuid', { name: 'user_id' })
    userId: string;

    @Column('float')
    lat: number;

    @Column('float')
    lng: number;
}
