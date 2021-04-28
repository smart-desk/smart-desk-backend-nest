import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameCalendar1619642734225 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameTable('data_calendar', 'data_datepicker');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameTable('data_datepicker', 'data_calendar');
    }
}
