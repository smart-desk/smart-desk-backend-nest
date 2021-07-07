import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class Promotion1624996041370 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'products',
            new TableColumn({
                name: 'promotion_timestamp',
                type: 'timestamp',
                default: 'NOW()',
            })
        );

        await queryRunner.addColumn(
            'ad_config',
            new TableColumn({
                name: 'lift_rate',
                type: 'numeric',
                precision: 13,
                scale: 2,
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('products', 'promotion_timestamp');
        await queryRunner.dropColumn('ad_config', 'lift_rate');
    }
}
