import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AdSenseConfig1636667026418 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'ad_config',
            new TableColumn({
                name: 'adsense',
                type: 'varchar',
                length: '1000',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('ad_config', 'adsense');
    }
}
