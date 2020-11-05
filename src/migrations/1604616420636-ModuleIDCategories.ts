import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ModuleIDCategories1604616420636 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'categories',
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

        await queryRunner.query('ALTER TABLE categories ALTER COLUMN created_at SET DEFAULT NOW()');
        await queryRunner.query('ALTER TABLE categories ALTER COLUMN updated_at SET DEFAULT NOW()');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'categories',
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

        await queryRunner.query('ALTER TABLE categories ALTER COLUMN created_at DROP DEFAULT;');
        await queryRunner.query('ALTER TABLE categories ALTER COLUMN updated_at DROP DEFAULT;');
    }
}
