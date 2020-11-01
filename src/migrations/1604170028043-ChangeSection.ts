import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChangeSection1604170028043 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'sections',
            'id',
            new TableColumn({
                name: 'id',
                type: 'uuid',
                isPrimary: true,
                isUnique: true,
                isGenerated: true,
                generationStrategy: 'uuid',
                default: `uuid_generate_v4()`,
            })
        );

        await queryRunner.dropColumn('sections', 'created_at');
        await queryRunner.dropColumn('sections', 'updated_at');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'sections',
            'id',
            new TableColumn({
                name: 'id',
                type: 'uuid',
                isPrimary: true,
                isUnique: true,
                isGenerated: true,
                generationStrategy: 'uuid',
                default: `uuid_generate_v4()`,
            })
        );

        await queryRunner.addColumn(
            'sections',
            new TableColumn({
                name: 'created_at',
                type: 'timestamp',
                default: 'NOW()',
            })
        );
        await queryRunner.addColumn(
            'sections',
            new TableColumn({
                name: 'updated_at',
                type: 'timestamp',
                default: 'NOW()',
            })
        );
    }
}
