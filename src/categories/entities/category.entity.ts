import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CategoryDto } from './category.dto';

@Entity('category')
export class Category implements CategoryDto {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    modelId: string;

    @Column('uuid')
    parentId: string;

    @Column('varchar', { length: 255 })
    name: string;

    @Column('date')
    createdAt: string;

    @Column('date')
    updatedAt: string;
}
