import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveSection11620686099365 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('fields', 'fields_section_id_fkey');

        await queryRunner.dropColumn('fields', 'section_id');

        await queryRunner.dropTable('sections');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
