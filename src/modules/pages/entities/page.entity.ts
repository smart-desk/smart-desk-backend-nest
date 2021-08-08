import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pages')
export class PageEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { length: 255 })
    title: string;

    @Column('varchar', { length: 10000 })
    content: string;
}
