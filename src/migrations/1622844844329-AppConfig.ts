import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AppConfig1622844844329 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'ad_config',
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
                        name: 'main_hourly_rate',
                        type: 'numeric',
                        precision: 13,
                        scale: 2,
                    },
                    {
                        name: 'sidebar_hourly_rate',
                        type: 'numeric',
                        precision: 13,
                        scale: 2,
                    },
                ],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('ad_config');
    }
}
