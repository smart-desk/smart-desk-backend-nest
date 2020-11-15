import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdvertCreateAt1604853961440 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE adverts ALTER COLUMN created_at SET DEFAULT NOW()');
        await queryRunner.query('ALTER TABLE adverts ALTER COLUMN updated_at SET DEFAULT NOW()');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE adverts ALTER COLUMN created_at DROP DEFAULT;');
        await queryRunner.query('ALTER TABLE adverts ALTER COLUMN updated_at DROP DEFAULT;');
    }
}
