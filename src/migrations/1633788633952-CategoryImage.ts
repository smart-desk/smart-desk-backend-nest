import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CategoryImage1633788633952 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'categories',
            'img',
            new TableColumn({
                name: 'img',
                type: 'varchar',
                length: '1000',
            })
        );

        await queryRunner.query('ALTER TABLE categories ALTER COLUMN created_at SET DEFAULT NOW()');
        await queryRunner.query('ALTER TABLE categories ALTER COLUMN updated_at SET DEFAULT NOW()');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'categories',
            'img',
            new TableColumn({
                name: 'img',
                type: 'varchar',
                length: '1000',
            })
        );

        await queryRunner.query('ALTER TABLE categories ALTER COLUMN created_at DROP DEFAULT;');
        await queryRunner.query('ALTER TABLE categories ALTER COLUMN updated_at DROP DEFAULT;');
    }
}
