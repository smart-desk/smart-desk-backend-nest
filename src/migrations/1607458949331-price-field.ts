import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class priceField1607458949331 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'data_price',
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
                        type: 'numeric',
                        precision: 13,
                        scale: 2,
                    },
                ],
            })
        );

        await queryRunner.createForeignKey(
            'data_price',
            new TableForeignKey({
                columnNames: ['field_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'fields',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'data_price',
            new TableForeignKey({
                columnNames: ['advert_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'adverts',
                onDelete: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableFields = await queryRunner.getTable('fields');
        const foreignKey1 = tableFields.foreignKeys.find(fk => fk.columnNames.indexOf('field_id') !== -1);
        await queryRunner.dropForeignKey('fields', foreignKey1);

        const tableAdverts = await queryRunner.getTable('adverts');
        const foreignKey2 = tableAdverts.foreignKeys.find(fk => fk.columnNames.indexOf('advert_id') !== -1);
        await queryRunner.dropForeignKey('adverts', foreignKey2);

        await queryRunner.dropTable('data_price');
    }
}
