import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('models')
export class Model {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column("varchar", { length: 255 })
  name: string;
}
