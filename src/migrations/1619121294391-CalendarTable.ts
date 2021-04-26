import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CalendarTable1619121294391 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'data_calendar',
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
                        name: 'range',
                        type: 'boolean'
                    },
                    {
                        name: 'date1',
                        type: 'timestamp with time zone',
                    },
                    {
                        name: 'date2',
                        type: 'timestamp with time zone',
                    },
                ],
            })
        );

        await queryRunner.createForeignKey(
            'data_calendar',
            new TableForeignKey({
                columnNames: ['field_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'fields',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'data_calendar',
            new TableForeignKey({
                columnNames: ['advert_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'adverts',
                onDelete: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('data_calendar');
    }

}
