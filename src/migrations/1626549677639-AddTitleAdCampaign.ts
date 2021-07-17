import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTitleAdCampaign1626549677639 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'ad_campaigns',
            new TableColumn({
                name: 'title',
                type: 'varchar',
                length: '255',
                default: "''",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('ad_campaigns', 'title');
    }
}
