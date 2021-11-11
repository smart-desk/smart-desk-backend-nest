import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AdSenseConfig1636667026418 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'ad_config',
            new TableColumn({
                name: 'adsense',
                type: 'json',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('ad_config', 'adsense');
    }
}
