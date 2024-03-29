import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class Photo1606076284212 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'data_photos',
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
                        name: 'value',
                        type: 'varchar',
                        length: '1000',
                        isArray: true,
                    },
                ],
            })
        );

        await queryRunner.createForeignKey(
            'data_photos',
            new TableForeignKey({
                columnNames: ['field_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'fields',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'data_photos',
            new TableForeignKey({
                columnNames: ['advert_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'adverts',
                onDelete: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('data_photos');
    }
}
