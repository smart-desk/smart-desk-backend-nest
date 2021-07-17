import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class PromoSet1626382874803 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'promo_sets',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isUnique: true,
                        generationStrategy: 'uuid',
                        default: `uuid_generate_v4()`,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '100',
                    },
                    {
                        name: 'days',
                        type: 'int',
                    },
                    {
                        name: 'price',
                        type: 'numeric',
                        precision: 13,
                        scale: 2,
                    },
                ],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('promo_sets');
    }
}
