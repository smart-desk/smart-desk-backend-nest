import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

class Point {
    lat: number;
    lng: number;
}

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

    @Column({
        type: 'point',
        transformer: {
            from: v => v, // todo lat and lng
            to: v => `${v.x},${v.y}`,
        },
    })
    public coords: Point;
}
