import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReplaceAmazonPath1627826276783 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE data_photos
            SET value = ARRAY(
                SELECT REPLACE(t.val, 'https://smart-desk-advert.s3.eu-central-1.amazonaws.com', '')
                FROM UNNEST(data_photos.value) WITH ORDINALITY AS t(val,idx) ORDER BY t.idx);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE data_photos
            SET value = ARRAY(
                SELECT 'https://smart-desk-advert.s3.eu-central-1.amazonaws.com' || t.val
                FROM UNNEST(data_photos.value) WITH ORDINALITY AS t(val,idx) ORDER BY t.idx);
        `);
    }
}
