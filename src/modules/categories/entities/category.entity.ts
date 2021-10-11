import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'model_id' })
    modelId: string;

    @Column('uuid', { name: 'parent_id' })
    parentId: string;

    @Column('varchar', { length: 255 })
    name: string;

    @Column('varchar', { length: 1000 })
    img: string;

    @Column('date', { name: 'created_at' })
    createdAt: string;

    @Column('date', { name: 'updated_at' })
    updatedAt: string;
}
