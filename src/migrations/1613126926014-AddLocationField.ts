import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddLocationField1613126926014 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'data_locations',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isUnique: true,
                        generationStrategy: 'uuid',
                        default: `uuid_generate_v4()`,
                    },
                    {
                        name: 'field_id',
                        type: 'uuid',
                    },
                    {
                        name: 'advert_id',
                        type: 'uuid',
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        length: '255',
                    },
                    {
                        name: 'lat',
                        type: 'float',
                    },
                    {
                        name: 'lng',
                        type: 'float',
                    },
                ],
            })
        );

        await queryRunner.createForeignKey(
            'data_locations',
            new TableForeignKey({
                columnNames: ['field_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'fields',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'data_locations',
            new TableForeignKey({
                columnNames: ['advert_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'adverts',
                onDelete: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('data_locations');
    }
}
