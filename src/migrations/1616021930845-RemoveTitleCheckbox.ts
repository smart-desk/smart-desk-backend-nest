import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTitleCheckbox1616021930845 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('data_checkboxes', 'title');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
