import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChangeDatePicker1620138403979 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'data_datepicker',
            'date2',
            new TableColumn({
                name: 'date2',
                type: 'timestamp with time zone',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'data_datepicker',
            'date2',
            new TableColumn({
                name: 'date2',
                type: 'timestamp with time zone',
                isNullable: false,
            })
        );
    }
}
