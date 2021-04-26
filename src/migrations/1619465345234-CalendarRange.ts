import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CalendarRange1619465345234 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('data_calendar', 'range');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'data_calendar',
            new TableColumn({
                name: 'range',
                type: 'boolean',
            })
        );
    }
}
